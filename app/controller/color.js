'use strict';

const { Controller } = require('egg');

class ColorController extends Controller {
    async get_color_by_photo_id()
    {
        const photo_id = this.ctx.params.photo_id;
        const result = await this.ctx.service.color.get_color_by_photo_id(photo_id);
        this.ctx.body = result;
    }

    async getPhotosByMainColorId()
    {
        const { ctx } = this;
        const standard_id = ctx.params.standard_id;
        const res = await ctx.service.color.getPhotosByMainColorId(standard_id);
        ctx.body = res;
    }
}
module.exports = ColorController
