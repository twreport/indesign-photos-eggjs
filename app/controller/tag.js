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
}
module.exports = TagController;