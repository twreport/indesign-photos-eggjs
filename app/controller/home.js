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

    async readEagleJSON() {
        const url = '/var/www/html/tp5/public/eagle/tuku.library/metadata.json';
        const that = this;
        fs.readFile(url, 'utf-8', async function(err, data){
            if(err){
                console.log(err)
            }
            var folders = JSON.parse(data);
            const f1 = folders.folders;
            const res = await that.ctx.service.folder.saveEagleFolderFamily(f1, 0);
            console.log('result', res);
        })
    }

    async readEagleImg() {
        const url = '/var/www/html/tp5/public/eagle/tuku.library/images/';
        fs.readdir(url, (err, data)=>{
            if(err) return console.log(err)
            for(const dirName of data){
                const childFileName = url + dirName + '/metadata.json'
                var that = this;
                fs.readFile(childFileName, 'utf-8', async function(error, jsonData){
                    if(error){
                        console.log(error);
                        return false;
                    }
                    const photo = JSON.parse(jsonData);
                    const photo_set = await that.app.mysql.select('tt_photo_set', {
                        where: {'eagle_id': photo.folders[0]}
                    })
                    let photoset_id = 0;
                    if(photo_set.length > 0){
                        photoset_id = photo_set[0].id;
                    }
                    const now = Math.round(new Date().getTime()/1000);
                    const row = {
                        'name': photo.encodeName,
                        'alt': photo.id,
                        'src': '',
                        'srcset': '',
                        'source_page': photo.url,
                        'host': 'eagle',
                        'url': '',
                        'm_url': '',
                        'sm_url': '',
                        'path': 'images/' + dirName + '/' + photo.name + '.' + photo.ext,
                        'm_path': 'images/' + dirName + '/' + photo.name + '.' + photo.ext,
                        'sm_path': 'images/' + dirName + '/' + photo.name + '_thumbnail.' + photo.ext,
                        'photoset_id': photoset_id,
                        'color_id': 0,
                        'author_id': 0,
                        'ai_id': 0,
                        'add_time': now,
                        'status': 1
                    }
                    console.log(row)
                    const res = await that.app.mysql.insert('tt_eagle', row);
                })
            }
        })
    }

    async trans_old(){
        const old_imgs = await this.app.mysql.select('color_photos', {});
        const now = Math.round(new Date().getTime()/1000);

        for(const old_img of old_imgs)
        {
            const row = {
                'name': old_img.name,
                'alt': old_img.alt,
                'src': old_img.save_name,
                'srcset': '',
                'source_page': old_img.save_name,
                'host': 'old',
                'url': old_img.crawl_url,
                'm_url': old_img.crawl_m_url,
                'sm_url': old_img.crawl_sm_url,
                'path': old_img.url,
                'm_path': old_img.m_url,
                'sm_path': old_img.sm_url,
                'photoset_id': 0,
                'color_id': 0,
                'author_id': 0,
                'ai_id': 0,
                'add_time': now,
                'status': 1
            }
            const res = await this.app.mysql.insert('tt_images', row);
        } 
    }

}

module.exports = HomeController;
