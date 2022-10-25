'use strict';

const Service = require('egg').Service;

class DbService extends Service {
    async getCurrentPhoto(user_id) {
        const query = "select p.* from tt_user_photo as up left join tt_user as u on u.id = up.user_id left join tt_photos as p on p.id = up.photo_id where u.id = " + user_id +
            " and p.status = 1 order by p.add_time desc limit 0,1;"
        const rows = await this.app.mysql.query(query);
        return rows[0];
    }

    async getMainPhoto(id) {
        const result = await this.app.mysql.get('tt_photos', {id: id});
        return result;
    }

    async softDeletePhoto(photo_id, user_id) {
        const user_photo = await this.app.mysql.select('tt_user_photo', {
            where: {
                'photo_id': photo_id
            }
        });
        //软删除的逻辑是：
        if(user_photo.length > 1){
            // 1-如果还有其他人收藏这张图；则将删除中间表中该用户和这张图的连接
            const delResult = await this.del_middle('tt_user_photo', 'user_id', user_id, 'photo_id', photo_id);
            return delResult;
        }else{
            // 2-如果没有其他人收藏这张图；则将该图的status修改为0
            const row = {
                id: photo_id,
                status: 0
            };
            const result = await this.app.mysql.update('tt_photos', row);
            const updateSuccess = result.affectedRows === 1;
            return updateSuccess;
        }
    }

    async del_middle(db, key1, value1, key2, value2)
    {
        const query = "delete from " + db + " where " + key1 + "=" + value1 + " and " + key2 + "=" + value2 + ";";
        console.log(query);
        const result = await this.app.mysql.query(query);
        console.log(result);
        const delSuccess = result.affectedRows === 1;
        return delSuccess;
    }

    async resume_photo(id) {
        const row = {
            id: id,
            status: 1
        };
        const result = await this.app.mysql.update('tt_photos', row);
        const updateSuccess = result.affectedRows === 1;
        return updateSuccess;
    }

    async insertOnePhoto(data, user_id, folder_id){
        console.log('insert')
        console.log('data', data)
        console.log('user_id', user_id)
        console.log('folder_id', user_id)
        //如果该文件不存在，则存入数据库tt_photos，并建立中间表
        const query = {'src': data.src}
        const photo = await this.is_exist('tt_photos', query);
        if(photo === false){
            const result = await this.app.mysql.insert('tt_photos', data);
            console.log(result)
            // 判断插入成功
            const insertSuccess = result.affectedRows === 1;
            if(insertSuccess) {
                // 中间表中新增一条用户-图片记录
                const new_row = {
                    'user_id': user_id,
                    'photo_id': result.insertId
                }
                const addResult = await this.add_db('tt_user_photo', new_row);
                if(addResult !== false) {
                    console.log('add folder photo')
                    // 如果有默认目录，中间表中新增一条目录-图片记录
                    if(folder_id !== null){
                        const new_folder_row = {
                            'folder_id': folder_id,
                            'photo_id': result.insertId
                        }
                        const addFolderResult = await this.add_db('tt_folder_photo', new_folder_row);
                        if(addFolderResult !== false) {
                            return result.insertId;
                        }else{
                            return false;
                        }
                    }else{
                        return result.insertId;
                    }


                }else{
                    return false;
                }

            }else{
                return false;
            }
        }else{
            const photo_id = photo.id;
            //如果该文件已存在，则判断是否在user_id用户的名下，
            const where = {
                'user_id': user_id,
                'photo_id': photo_id
            }
            const res = await this.is_exist('tt_user_photo', where);
            if(res === false){
                // 如果不在其名下，则中间表中新增一条记录
                const new_row = {
                    'user_id': user_id,
                    'photo_id': photo_id
                }
                const addResult = await this.add_db('tt_user_photo', new_row);
                if(addResult !== false) {
                    console.log('add folder photo')
                    // 如果有默认目录，中间表中新增一条目录-图片记录
                    if(folder_id !== null){
                        const new_folder_row = {
                            'folder_id': folder_id,
                            'photo_id': photo_id
                        }
                        const addFolderResult = await this.add_db('tt_folder_photo', new_folder_row);
                        if(addFolderResult !== false) {
                            return photo_id;
                        }else{
                            return false;
                        }
                    }else{
                        return photo_id;
                    }


                }else{
                    return false;
                }
            }else{
                //如果已经在其名下，则返回false
                return false;
            }
        }
    }

    async add_db(db, row){
        const addResult = await this.app.mysql.insert(db, row);
        console.log('addResult',addResult)
        // 判断插入成功
        const addSuccess = addResult.affectedRows === 1;
        if(addSuccess) {
            return addResult.insertId;
        }else{
            return false;
        }
    }

    async is_exist(db, where){
        const results = await this.app.mysql.select(db,{
            where: where
        });
        if(results.length > 0){
            return results[0];
        }else{
            return false;
        }
    }

    async get_1_photo_2_crawl() {
        const query = "select * from tt_photos where url = '' and status = 1 order by add_time desc limit 0,1;";
        const rows = await this.app.mysql.query(query);
        if(rows.length > 0){
            return rows[0];
        }
        return false;
    }

    async updatePhotoUrl(id, url, m_url, sm_url) {
        const row = {
            id: id,
            url: url,
            m_url: m_url,
            sm_url: sm_url
        };
        const result = await this.app.mysql.update('tt_photos', row);
        const updateSuccess = result.affectedRows === 1;
        return updateSuccess;
    }

    async select_photos(data) {
        const user_id = data.user_id;
        const start_num = parseInt(data.offset) * parseInt(data.limit);
        const end_num = parseInt(data.limit);
        const query = "select p.* from tt_user_photo as up left join tt_user as u on u.id = up.user_id left join tt_photos as p on p.id = up.photo_id where u.id = "
            + user_id + " and p.status = 1 order by p." + data.order_by + " " + data.order_sort + " limit " + start_num + "," + end_num + ";";
        console.log("query:", query);
        const results = await this.app.mysql.query(query);
        return results;
    }

    async select_garbage_photos(data) {
        const user_id = data.user_id;
        const start_num = parseInt(data.offset) * parseInt(data.limit);
        const end_num = parseInt(data.limit);
        const query = "select p.* from tt_user_photo as up left join tt_user as u on u.id = up.user_id left join tt_photos as p on p.id = up.photo_id where u.id = "
        + user_id + " and p.status = 0 order by p." + data.order_by + " " + data.order_sort + " limit " + start_num + "," + end_num + ";";
        const results = await this.app.mysql.query(query);
        return results;
    }

    async get_tags() {
        let data = [];
        const tag_type_rows = await this.app.mysql.select('tt_tag_type', {});
        for(const tag_type_row of tag_type_rows) {
            let row = tag_type_row;
            row['tags'] = await this.app.mysql.select('tt_tags', {
                where: {"tag_type_id": tag_type_row.id}
            })
            data.push(row);
        }
        return data;
    }
}
module.exports = DbService;