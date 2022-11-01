'use strict';

const Service = require('egg').Service;

class AuthService extends Service {
    async get_token(token) {
        const rows = await this.app.mysql.select('auth_access_tokens', {
            where: {'access_token': token}
        })
        return rows;
    }
}

module.exports = AuthService;