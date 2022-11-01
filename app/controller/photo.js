'use strict';

const { Controller } = require('egg');

class PhotoController extends Controller {
    async receive_photo() {
        const { ctx } = this;
        const data = ctx.request.body;
        const user_id = ctx.request.headers.user_id;
        let folder_id = ctx.request.headers.folder_id;
        if(folder_id == undefined){
            folder_id = null;
        }
        console.log("folder_id:", folder_id);
        console.log(data);
        const result = await ctx.service.photo.receive_photo(data, user_id, folder_id);
        ctx.body = {'result': result};
    }

    //取出最新下载的一张图片
    async get_current_photo() {
        const { ctx } = this;
        const user_id = ctx.request.headers.user_id;
        const result = await ctx.service.photo.get_current_photo(user_id);
        ctx.body = {'result': result};
    }

    async soft_delete_photo() {
        const { ctx } = this;
        const data = ctx.request.body;
        const user_id = ctx.request.headers.user_id;
        console.log(data);
        const result = await ctx.service.photo.soft_delete_photo(data.id, user_id);
        ctx.body = {'result': result};
    }

    async batch_delete_photo() {
        const { ctx } = this;
        const data = ctx.request.body;
        console.log(data);
        const user_id = ctx.request.headers.user_id;
        for(const item of data){
            await ctx.service.photo.soft_delete_photo(item.id, user_id);
        }
        ctx.body = {'result': true};
    }

    async resume_photo() {
        const { ctx } = this;
        const data = ctx.request.body;
        console.log(data);
        const result = await ctx.service.photo.resume_photo(data.id);
        ctx.body = {'result': result};
    }

    async select_photos() {
        const { ctx } = this;
        const data = ctx.request.body;
        console.log(data);
        const user_id = ctx.request.headers.user_id;
        data['user_id'] = user_id;
        const result = await ctx.service.photo.select_photos(data);
        ctx.body = {'result': result};
    }

    async select_garbage_photos() {
        const { ctx } = this;
        let data = ctx.request.body;
        const user_id = ctx.request.headers.user_id;
        data['user_id'] = user_id;
        console.log('user_id', user_id);
        const result = await ctx.service.photo.select_garbage_photos(data);
        ctx.body = {'result': result};
    }

    async get_main_photo() {
        const { ctx } = this;
        const data = ctx.request.body;
        console.log(data);
        const result = await ctx.service.photo.get_main_photo(data.id);
        ctx.body = {'result': result};
    }

    async get_instagram_img_base64()
    {
        const { ctx } = this;
        const data = ctx.request.body;
        console.log(data);
        const result = await ctx.service.photo.get_instagram_img_base64(data.src);
        ctx.body = {'result': result};
    }
}

module.exports = PhotoController;
