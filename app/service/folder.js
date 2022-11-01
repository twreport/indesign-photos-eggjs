'use strict';
const Service = require('egg').Service;

class FolderService extends Service {
    async get_folder_list_by_user_id(user_id)
    {
        const rows = await this.app.mysql.select('tt_folder', {
            where: {'auth_id': user_id, 'status': 1},
            orders: [['add_time','desc']], // 排序方式
        });
        return rows;
    }

    async add_folder(data, user_id) {
        const now_time = parseInt(new Date().getTime() / 1000);
        const row = {
            'name': data.folder_name,
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

    async assign_photo_2_folder(data) {
        const query = "select * from tt_folder_photo where folder_id=" + data.folder_id + " and photo_id=" + data.photo_id + ";";
        console.log(query);
        const rows = await this.app.mysql.query(query);
        console.log(rows);
        if(rows.length > 0){
            return false;
        }
        const result = await this.app.mysql.insert('tt_folder_photo', data);
        const insertSuccess = result.affectedRows === 1;
        return insertSuccess;
    }

    async soft_delete_photo_link_folder(data) {
        const result = await this.ctx.service.db.del_middle('tt_folder_photo', 'folder_id', data.folder_id, 'photo_id', data.photo_id);
        return result;
    }
}

module.exports = FolderService;
