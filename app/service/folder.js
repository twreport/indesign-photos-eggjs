'use strict';
const Service = require('egg').Service;

class FolderService extends Service {

    heir_tree = [];
    i = 0;

    async get_folder_list_by_user_id(user_id) {
        const rows = await this.app.mysql.select('tt_folder', {
            where: { 'auth_id': user_id, 'parent_id': 0, 'status': 1 },
            orders: [['add_time', 'desc']], // 排序方式
        });
        return rows;
    }

    async add_folder(data, user_id) {
        const now_time = parseInt(new Date().getTime() / 1000);
        if ('parent_id' in data) {

        } else {
            data['parent_id'] = 0;
        }
        const row = {
            'name': data.folder_name,
            'parent_id': data.parent_id,
            'auth_id': user_id,
            'add_time': now_time,
            'status': 1
        }
        const result = await this.app.mysql.insert('tt_folder', row);
        const addSuccess = result.affectedRows === 1;
        return addSuccess;
    }

    async edit_folder(data) {
        const row = {
            'id': data.id,
            'name': data.folder_name,
            'auth_id': data.auth_id,
            'add_time': data.add_time,
            'status': data.status
        }
        const result = await this.app.mysql.update('tt_folder', row);
        const updateSuccess = result.affectedRows === 1;
        return updateSuccess;
    }

    async soft_del_folder(id) {
        const row = {
            'id': id,
            'status': 0
        }
        console.log(row)
        const result = await this.app.mysql.update('tt_folder', row);
        console.log(result)
        const updateSuccess = result.affectedRows === 1;
        return updateSuccess;
    }

    async photos_by_folder_id(data, user_id) {
        const start_num = parseInt(data.offset) * parseInt(data.limit);
        const end_num = parseInt(data.limit);
        const query = "SELECT p.* FROM tt_folder_photo as fp left join tt_photos as p on p.id = fp.photo_id left join tt_folder as f on f.id = fp.folder_id where f.id = " +
            data.folder_id + " and p.status = 1 order by p." + data.order_by + " " + data.order_sort + " limit " + start_num + "," + end_num + ";";
        console.log("query:", query);
        const rows = await this.app.mysql.query(query);
        const photos = await this.ctx.service.photo.format_photo_rows(rows, user_id);
        return photos;
    }

    async folders_by_photo_id(photo_id, user_id) {
        const query = "SELECT f.* FROM tt_folder_photo as fp left join tt_photos as p on p.id = fp.photo_id left join tt_folder as f on f.id = fp.folder_id where p.id = " +
            photo_id + " and f.auth_id = " + user_id + ";";
        console.log(query);
        const rows = await this.app.mysql.query(query);
        return rows;
    }

    async assign_photo_2_folder(data, user_id) {
        const query = "select * from tt_folder_photo where folder_id=" + data.folder_id + " and photo_id=" + data.photo_id + ";";
        console.log(query);
        const rows = await this.app.mysql.query(query);
        console.log(rows);
        if (rows.length > 0) {
            return false;
        }
        const existFolderbyPhoto = await this.app.mysql.select('tt_folder_photo', {
            where: { 'photo_id': data.photo_id }
        });
        console.log('existFolderbyPhoto', existFolderbyPhoto)
        // 如果该图片已经有所属目录
        if (existFolderbyPhoto.length > 0) {
            for (const ef of existFolderbyPhoto) {
                // 先判断是不是属于用户自己，如果属于则删除，不属于则忽略
                const myFolder = await this.app.mysql.get('tt_folder', {
                        'id': ef.folder_id
                })
                console.log('myFolder', myFolder)
                console.log('myFolder.auth_id', myFolder.auth_id)
                console.log('user_id', user_id)
                if (myFolder.auth_id == user_id) {
                    const delR = await this.ctx.service.db.del_middle('tt_folder_photo', 'photo_id', data.photo_id, 'folder_id', ef.folder_id);
                    console.log('del result', delR)
                }
            }
        }
        const result = await this.app.mysql.insert('tt_folder_photo', data);
        const insertSuccess = result.affectedRows === 1;
        return insertSuccess;
    }

    async soft_delete_photo_link_folder(data) {
        const result = await this.ctx.service.db.del_middle('tt_folder_photo', 'folder_id', data.folder_id, 'photo_id', data.photo_id);
        return result;
    }

    async folders_by_parent_id(parent_id) {
        const result = await this.app.mysql.select('tt_folder', {
            where: {
                'parent_id': parent_id,
                'status': 1
            }
        })
        return result;
    }

    async move_photos(photo_id, from_folder_id, to_folder_id) {
        const res = await this.ctx.service.db.del_middle('tt_folder_photo', 'folder_id', from_folder_id, 'photo_id', photo_id);
        if (res) {
            const row = {
                'folder_id': to_folder_id,
                'photo_id': photo_id
            }
            const result = await this.service.db.add_db('tt_folder_photo', row);
            return result;
        }
        return false;
    }

    // 递归函数, 查询到根节点为0
    async get_heir_tree(folder_id) {
        const row = await this.app.mysql.get('tt_folder', {
            id: folder_id
        })
        console.log(row)
        console.log(this.i)
        this.heir_tree.unshift(row);
        console.log(this.heir_tree);
        if (row.parent_id == 0) {
            return this.heir_tree;
        } else {
            return await this.get_heir_tree(row.parent_id);
        }

    }

    // 获得指定用户的目录树
    async get_whole_tree(user_id) {
        const rows = await this.app.mysql.select('tt_folder', {
            where: {
                'auth_id': user_id,
                'parent_id': 0,
                'status': 1
            }
        })
        console.log('rows', rows)
        let trees = [];
        for (const row of rows) {
            let tree = await this.get_tree(row);
            trees.push(tree);
        }
        console.log('trees', trees)
        return trees;
    }

    // 递归函数，获得指定目录的所有子目录
    async get_tree(row) {
        const leafs = await this.app.mysql.select('tt_folder', {
            where: { "parent_id": row.id,
                    "status": 1 }
        })
        if (leafs.length > 0) {
            row['children'] = [];
            for (const leaf of leafs) {
                row['children'].push(await this.get_tree(leaf));
            }
            return row;
        } else {
            return row;
        }
    }

    async save_eagle_folders(folder_list){
        const now_time = parseInt(new Date().getTime() / 1000);
        for(const folder of folder_list) {
            const folder_row = {
                'eagle_id': folder.id,
                'name': folder.name,
                'parent_id': 0,
                'main_url': '',
                'desc': folder.name,
                'add_time': now_time,
                'status': 1
            }
            const result = await this.app.mysql.insert('tt_photo_set', folder_row);
        }
        return false;
    }

    // 递归函数，挖掘所有子目录
    async saveEagleFolderFamily(children, parent_id)
    {
        const now_time = parseInt(new Date().getTime() / 1000);
        for(const folder of children){
            const folder_row = {
                'eagle_id': folder.id,
                'name': folder.name,
                'parent_id': parent_id,
                'main_url': '',
                'desc': folder.name,
                'add_time': now_time,
                'status': 1
            }
            const result = await this.app.mysql.insert('tt_photo_set', folder_row);
            console.log('saved!');
            console.log(result)
            if(folder.children.length > 0){
                this.saveEagleFolderFamily(folder.children, result.insertId);
            }
        }
    }

}

module.exports = FolderService;
