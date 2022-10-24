'use strict';
const Service = require('egg').Service;

class TagService extends Service {
    async get_tags() {
        const rows = await this.ctx.service.db.get_tags();
        return rows;
    }

    async add_tag(data) {
        let add_data = data;
        add_data['tag_group_id'] = 0;
        add_data['status'] = 1;
        const exist = await this.app.mysql.select('tt_tags', {
            where: {"tag_name": add_data.tag_name}
        })
        if(exist.length > 0){
            return false;
        }
        const result = await this.app.mysql.insert('tt_tags', data);
        // 判断插入成功
        const insertSuccess = result.affectedRows === 1;
        return insertSuccess;
    }

    async del_tag(id) {
        const result = await this.app.mysql.delete('tt_tags', {
            id: id,
        });
        const delSuccess = result.affectedRows === 1;
        return delSuccess;
    }
}
module.exports = TagService;