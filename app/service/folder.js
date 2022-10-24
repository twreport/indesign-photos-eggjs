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
}

module.exports = FolderService;
