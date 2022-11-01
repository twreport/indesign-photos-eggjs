'use strict';
const md5 = require('md5');
const Service = require('egg').Service;

class UserService extends Service {
    async get_user_by_id(id){
        const row = await this.app.mysql.get('tt_user', {id: id});
        return row;
    }

    async edit_user(data){
        let row = data;
        const md5_passwd = md5(data.password);
        row['password'] = md5_passwd;
        delete row.check_password;
        const result = await this.app.mysql.update('tt_user', row); // 更新 posts 表中的记录
        // 判断更新成功
        const updateSuccess = result.affectedRows === 1;
        return updateSuccess;
    }
}

module.exports = UserService;