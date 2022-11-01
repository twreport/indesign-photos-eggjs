'use strict';
const fs = require('fs');
const {Controller} = require('egg');

class HomeController extends Controller {
    async index() {
        const {ctx} = this;
        ctx.body = 'hi, egg';
    }

    async init() {
        const {ctx} = this;
        const user_id = ctx.request.headers.user_id;
        console.log("init user id", user_id)
        const row = await this.app.mysql.get('tt_user', {id:user_id});
        ctx.body = {"user_name": row.name}
    }

    async testt() {
        const {ctx} = this;
        const res = await ctx.service.down.start();
        ctx.body = res;
    }

    async downloadImage() {
        // const url='https://www.baidu.com/img/pc_675fe66eab33abff35a2669768c43d95.png';
        const url='https://i.pinimg.com/236x/c9/ea/51/c9ea51b6e71c10099d0750737efadb56.jpg';

        //判断扩展名
        let ext = '';
        const ext_arr = ['.jpg', '.jpeg', '.png'];
        for(let i=0;i<ext_arr.length;i++){
            if(url.indexOf(ext_arr[i] > -1)){
                ext = ext_arr[i];
                break;
            }
        }

        // const url='https://instagram.fhkg3-2.fna.fbcdn.net/v/t51.2885-15/308780913_438348735029666_7073742860013145249_n.jpg?stp=dst-jpg_e35&_nc_ht=instagram.fhkg3-2.fna.fbcdn.net&_nc_cat=102&_nc_ohc=XBqc9MS3n2sAX95NBXh&tn=0JCW554hoE8PLZWe&edm=ACWDqb8BAAAA&ccb=7-5&ig_cache_key=MjkzNTYwMjA4OTUwMjU4ODU1Mw%3D%3D.2-ccb7-5&oh=00_AT8QH8K6u9HB47nqcUliypvoTrisge46ioHjbc9q83Ne6A&oe=635163A4&_nc_sid=1527a3';
        const {ctx} = this;
        // const data = await this.getQuery(url);
        // const ask_url_arr = url.split("?");
        // console.log(data);
        // console.log(ask_url_arr[0]);
        const result = await ctx.curl(url, {
            // method: 'GET',
            streaming: true,
            headers: {
                'Accept': '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
            },
            // data: data,
            // timeout: 30000
        });
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

        result.res.pipe(fs.createWriteStream(saveFilePath));
        ctx.body = saveFilePath;
    }

    async getQuery(url){
        // str为？之后的参数部分字符串
        const str = url.substr(url.indexOf('?') + 1)
        // arr每个元素都是完整的参数键值
        const arr = str.split('&')
        // result为存储参数键值的集合
        const result = {}
        for (let i = 0; i < arr.length; i++) {
            // item的两个元素分别为参数名和参数值
            const item = arr[i].split('=')
            result[item[0]] = item[1]
        }
        return result;
    }

}

module.exports = HomeController;
