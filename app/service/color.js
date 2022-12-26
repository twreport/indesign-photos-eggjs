'use strict';

const Service = require('egg').Service;

class ColorService extends Service {
    async get_color_by_photo_id(photo_id) {
        const rows = await this.app.mysql.select('tt_photos', {
            where: {'id': photo_id}
        })
        const row = rows[0];
        const color_id = row.color_id;
        const results = await this.app.mysql.select('tt_colors', {
            where: {'id': color_id}
        })
        const result = results[0];
        console.log(result);
        const res = {
            'color_list': [
                {'rgb': [result.c1_red, result.c1_green, result.c1_blue], 'weight': result.c1_weight},
                {'rgb': [result.c2_red, result.c2_green, result.c2_blue], 'weight': result.c2_weight},
                {'rgb': [result.c3_red, result.c3_green, result.c3_blue], 'weight': result.c3_weight},
                {'rgb': [result.c4_red, result.c4_green, result.c4_blue], 'weight': result.c4_weight},
                {'rgb': [result.c5_red, result.c5_green, result.c5_blue], 'weight': result.c5_weight}           
            ],
            'main_color': {'rgb': [result.main_color_red, result.main_color_green, result.main_color_blue], 'id': result.main_color_standard_id}
        }
        return res;
    }

    async getPhotosByMainColorId(standard_id)
    {
        const rows = await this.app.mysql.select('tt_colors', {
            where: {'main_color_standard_id': standard_id},
            orders: [['main_color_weight', 'desc']]
        })
        console.log('SAME COLOR:')
        console.log(rows)
        let photos = [];
        for(const row of rows){
            const photo = await this.app.mysql.select('tt_photos', {
                where: {'color_id': row.id}
            })
            if(photo.length > 0){
                photos.push(photo[0]);
            }
        }
        return photos;
    }
}

module.exports = ColorService;