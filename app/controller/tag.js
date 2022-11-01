'use strict';

const { Controller } = require('egg');

class TagController extends Controller {
    async get_tags() {
        const { ctx } = this;
        const result = await ctx.service.tag.get_tags();
        ctx.body = {'result': result};
    }

    async add_tag() {
        const { ctx } = this;
        const data = ctx.request.body;
        console.log(data);
        const result = await ctx.service.tag.add_tag(data);
        ctx.body = {'result': result};
    }

    async del_tag() {
        const { ctx } = this;
        const data = ctx.request.body;
        console.log(data);
        const result = await ctx.service.tag.del_tag(data.id);
        ctx.body = {'result': result};
    }

    async get_ai_tags_of_current_photo() {
        const { ctx } = this;
        const data = ctx.request.body;
        console.log(data);
        const result = await ctx.service.tag.get_ai_tags_of_current_photo(data);
        ctx.body = {'result': result};
    }

    async add_tag_photo()
    {
        const { ctx } = this;
        const data = ctx.request.body;
        console.log(data);
        const result = await ctx.service.tag.add_tag_photo(data);
        ctx.body = {'result': result};
    }

    async batch_assign_tag() {
        const { ctx } = this;
        const data = ctx.request.body;
        console.log(data);
        for(const item of data){
            await ctx.service.tag.add_tag_photo(item);
        }
        ctx.body = {'result': true};
    }

    async del_tag_photo()
    {
        const { ctx } = this;
        const data = ctx.request.body;
        console.log(data);
        const result = await ctx.service.tag.del_tag_photo(data);
        ctx.body = {'result': result};
    }

    async get_tags_by_photo_id()
    {
        const { ctx } = this;
        const photo_id = ctx.params.photo_id;
        console.log(photo_id)
        const result = await ctx.service.tag.get_tags_of_current_photo(photo_id);
        ctx.body = {'result': result};
    }

    async photos_by_tag_id() {
        const { ctx } = this;
        const data = ctx.request.body;
        const user_id = ctx.request.headers.user_id;
        const result = await ctx.service.tag.photos_by_tag_id(data, user_id);
        ctx.body = result;
    }
}
module.exports = TagController;