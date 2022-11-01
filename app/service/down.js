'use strict';
const fs = require('fs');
const Service = require('egg').Service;

class DownService extends Service {
    async start() {
        const { ctx } = this;
        const photo = await ctx.service.db.get_1_photo_2_crawl();
        if(photo !== false){
            const res = await this.crawl_photo(photo);
            ctx.body = res;
        }else{
            return false;
        }
    }

    async crawl_photo(photo) {

        //分别爬取大中小图
        const sm_url = await this.downloadImage(url_obj.sm_url);
        const m_url = await this.downloadImage(url_obj.m_url);
        const url = await this.downloadImage(url_obj.url);

        if(url !== false && m_url !== false && sm_url !== false){
            const res = await this.ctx.service.db.updatePhotoUrl(photo.id, url, m_url, sm_url);
            return res;
        }
        return false;
    }

    async downloadImage(url) {
        // try {
        console.log("url", url)
            const {ctx} = this;

        //判断扩展名
        let ext = '';
        const ext_arr = ['.jpg', '.jpeg', '.png'];
        for(let i=0;i<ext_arr.length;i++){
            if(url.indexOf(ext_arr[i] > -1)){
                ext = ext_arr[i];
                break;
            }
        }

            const today = await ctx.service.utils.getToday();
            const staticDir = this.app.config.static.dir;
            const childDir = "/uploads/" + today + "/";
            const uploadsPath = staticDir + "/uploads/" + today + "/";
            if (!fs.existsSync(uploadsPath)) {
                fs.mkdirSync(uploadsPath);
            }
            const randomNum = await ctx.service.utils.getRandomString();
            const fileName = childDir + randomNum + ext;
            const saveFilePath = this.app.config.static.dir + fileName;

            console.log("fileName:", fileName);
            console.log("this.app.config.static.dir:", this.app.config.static.dir);
            console.log("saveFilePath:", saveFilePath);

            const result = await ctx.curl(url, {
                headers: {
                    'Accept': '*/*',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
                },
                timeout: 30000,
                streaming: true
            });

            result.res.pipe(fs.createWriteStream(saveFilePath));
        // }catch (e){
        //     console.log(e);
        //     return false;
        // }
        return fileName;
    }
}
module.exports = DownService;