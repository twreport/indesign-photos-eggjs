'use strict';

const { Controller } = require('egg');

class UserController extends Controller {
    async get_user_by_id(){
        const { ctx } = this;
        const id = ctx.params.id;
        console.log(ctx.params);
        const result = await ctx.service.user.get_user_by_id(id);
        ctx.body = result;
    }

    async edit_user(){
        const { ctx } = this;
        const data = ctx.request.body;
        const result = await ctx.service.user.edit_user(data);
        ctx.body = result;
    }
}

module.exports = UserController