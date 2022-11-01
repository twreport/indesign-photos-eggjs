'use strict';
const Service = require('egg').Service;

// const stopwords = require('stopwords-en'); // array of stopwords

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
        if (exist.length > 0) {
            return false;
        }
        const result = await this.app.mysql.insert('tt_tags', data);
        // 判断插入成功
        const insertSuccess = result.affectedRows === 1;
        if (insertSuccess == true) {
            return result.insertId;
        }
        return insertSuccess;
    }

    async del_tag(id) {
        //先删除与tag关联的中间表
        const res = await this.app.mysql.delete('tt_tag_photo', {
            tag_id: id
        })
        const delTagPhotoSuccess = result.affectedRows === 1;
        if (delTagPhotoSuccess === false) {
            return delTagPhotoSuccess;
        }
        //然后再删除tag本身记录
        const result = await this.app.mysql.delete('tt_tags', {
            id: id,
        });
        const delSuccess = result.affectedRows === 1;
        return delSuccess;
    }

    async get_ai_tags_of_current_photo(photo) {
        const nameArr = photo['alt'].split(' ');
        const altArr = photo['name'].split(' ');
        const cutWordsArr = nameArr.concat(altArr);
        const punctuationStr = this.app.config.PunctuationString;
        let aiArr = [];
        let handleArr = [];
        console.log("cutWordsArr", cutWordsArr)
        for (const word of cutWordsArr) {
            //如果分词不是英文符号，也不包含省略号
            if (punctuationStr.indexOf(word) == -1 && word.indexOf('...') == -1) {
                aiArr.push(word);
                handleArr.push(word)
            } else {
                //如果重复则跳过
            }
        }
        return aiArr;
    }

    async get_tags_of_current_photo(photo_id) {
        const tag_photo = await this.app.mysql.select('tt_tag_photo', {
            where: {'photo_id': photo_id}
        })
        return tag_photo;
    }

    async add_tag_photo(data) {
        console.log("data in service add_tag_photo",data)
        const query = "select * from tt_tag_photo where photo_id=" + data.photo_id + " and tag_id=" + data.tag_id + ";";
        const rows = await this.app.mysql.query(query);
        if(rows.length > 0){
            return false;
        }
        const result = await this.app.mysql.insert('tt_tag_photo', data);
        // 判断新增成功
        const insertResult = result.affectedRows === 1;
        return insertResult;
    }

    async del_tag_photo(data) {
        const result = await this.ctx.service.db.del_middle('tt_tag_photo', 'tag_id', data.tag_id, 'photo_id', data.photo_id);
        return result;
    }
    
    async photos_by_tag_id(data, user_id) {
        const start_num = parseInt(data.offset) * parseInt(data.limit);
        const end_num = parseInt(data.limit);
        const query = "SELECT p.* FROM tt_tag_photo as fp left join tt_photos as p on p.id = fp.photo_id left join tt_tags as f on f.id = fp.tag_id where f.id = " +
            data.tag_id + " and p.status = 1 order by p." + data.order_by + " " + data.order_sort + " limit " + start_num + "," + end_num + ";";
        console.log("query:", query);
        const rows = await this.app.mysql.query(query);
        const photos = await this.ctx.service.photo.format_photo_rows(rows, user_id);
        return photos;
    }
}

module.exports = TagService;