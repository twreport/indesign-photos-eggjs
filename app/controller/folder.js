'use strict';

const { Controller } = require('egg');

class FolderController extends Controller {

    async get_folder_list_by_user_id(){
        const { ctx } = this;
        const data = ctx.request.body;
        const user_id = ctx.request.headers.user_id;
        console.log(data);
        const result = await ctx.service.folder.get_folder_list_by_user_id(user_id);
        ctx.body = result;
    }

    async add_folder() {
        const { ctx } = this;
        const data = ctx.request.body;
        const user_id = ctx.request.headers.user_id;
        const result = await ctx.service.folder.add_folder(data, user_id);
        ctx.body = result;
    }

    async get_folder_by_id(){
        const { ctx } = this;
        const id = ctx.params.id;
        console.log(ctx.params);
        const result = await ctx.service.folder.get_folder_by_id(id);
        ctx.body = result;
    }

    async edit_folder(){
        const { ctx } = this;
        const data = ctx.request.body;
        const result = await ctx.service.folder.edit_folder(data);
        ctx.body = result;
    }

    async soft_del_folder() {
        const { ctx } = this;
        const id = ctx.params.id;
        console.log(id)
        const result = await ctx.service.folder.soft_del_folder(id);
        ctx.body = result;
    }

    async photos_by_folder_id() {
        const { ctx } = this;
        const data = ctx.request.body;
        const result = await ctx.service.folder.photos_by_folder_id(data);
        ctx.body = result;
    }

    async folders_by_photo_id() {
        const { ctx } = this;
        const photo_id = ctx.params.photo_id;
        console.log(ctx.params);
        const user_id = ctx.request.headers.user_id;
        const result = await ctx.service.folder.folders_by_photo_id(photo_id, user_id);
        ctx.body = result;
    }

    async assign_photo_2_folder() {
        const { ctx } = this;
        const data = ctx.request.body;
        const result = await ctx.service.folder.assign_photo_2_folder(data);
        ctx.body = result;
    }
}

module.exports = FolderController