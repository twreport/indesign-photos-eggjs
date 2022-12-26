'use strict';
const Service = require('egg').Service;
const fs = require('fs');

class PhotoService extends Service {
    async get_current_photo(user_id) {
        const row = await this.ctx.service.db.getCurrentPhoto(user_id);
        const data = await this.format_photo_url(row);
        return data;
    }

    async get_photo_by_photo_id(db_name, id)
    {
        const row = await this.app.mysql.get(db_name, {id: id})
        const data = await this.format_photo_url(row);
        return data;
    }

    async format_photo_url(row) {
        if (row['sm_path'].length > 0) {
            //如果sm_path存在说明有本地图片，则一律使用本地图片
            row['temp_sm_src'] = this.app.config.BaseUrl + row['sm_path'];
        } else {
            // ins图片格式特殊，需要先下载然后展示
            if (row.host == 'www.instagram.com') {
                row['temp_sm_src'] = this.app.config.BaseUrl + this.app.config.LoadingLogo;
            } else {
                row['temp_sm_src'] = row['src'];
            }
        }
        return row;
    }

    async soft_delete_photo(photo_id, user_id) {
        const result = await this.ctx.service.db.softDeletePhoto(photo_id, user_id);
        return result;
    }

    async resume_photo(id) {
        const result = await this.ctx.service.db.resume_photo(id);
        return result;
    }

    // 处理base64图片
    async handleBase64(data) {
        const imgInfoArr = data.src.split(';base64,');
        const base64Data = imgInfoArr[1];
        const ext = imgInfoArr[0].replace('data:image/', '');
        const dataBuffer = new Buffer(base64Data, 'base64');
        const today = await this.ctx.service.utils.getToday();
        const basePath = this.app.config.BasePath;
        const imgFullPath = basePath + today + "/";
        if (!fs.existsSync(imgFullPath)) {
            fs.mkdirSync(imgFullPath);
        }
        const imgName = await this.ctx.service.utils.getRandomString();
        const imgFullName = imgFullPath + imgName + '.' + ext;
        fs.writeFileSync(imgFullName, dataBuffer);
        data['path'] = today + "/" + imgName + '.' + ext;
        data['src'] = this.app.config.BaseUrl + data['path'];
        return data;
    }

    async receive_photo(data, user_id, folder_id) {
        const row = await this.format_photo_data(data);
        const result = await this.ctx.service.db.insertOnePhoto(row, user_id, folder_id);
        return result;
    }

    async format_photo_data(data) {
        const now_time = parseInt(new Date().getTime() / 1000);

        let alt = data.alt.replace('其中包括图片：', '');
        if (alt == '') {
            alt = 'pic_' + now_time.toString()
        }

        // google.com或其他网站的base64图片另行处理
        if (data.src.indexOf('data:image/jpeg;base64') != -1) {
            const res = await this.handleBase64(data);
            const base64row = {
                'name': alt,
                'alt': alt,
                'src': res.src,
                'srcset': res.srcset,
                'source_page': res.src,
                'host': res.host,
                'url': res.src,
                'm_url': res.src,
                'sm_url': res.src,
                'path': res.path,
                'm_path': res.path,
                'sm_path': res.path,
                'photoset_id': 0,
                'color_id': 0,
                'author_id': 0,
                'ai_id': 0,
                'add_time': now_time,
                'status': 1
            }
            return base64row;
        }

        // 正常图片走scrapy下载流程
        const url = await this.get_url_from_srcset(data);
        const row = {
            'name': alt,
            'alt': alt,
            'src': url.sm_url,
            'srcset': data.srcset,
            'source_page': data.url,
            'host': data.host,
            'url': url.url,
            'm_url': url.m_url,
            'sm_url': url.sm_url,
            'path': '',
            'm_path': '',
            'sm_path': '',
            'photoset_id': 0,
            'color_id': 0,
            'author_id': 0,
            'ai_id': 0,
            'add_time': now_time,
            'status': 1
        }
        return row;
    }

    //根据srcset获取大中小图的url
    async get_url_from_srcset(data) {
        let url_obj = {
            'url': data.src,
            'm_url': data.src,
            'sm_url': data.src,
            'src': data.src
        };
        console.log('-----------------------host----------------------------')
        console.log(data.host)
        switch (data.host) {
            case 'www.pinterest.com':
            case 'www.pinterest.jp':
            case 'www.pinterest.es':
            case 'www.pinterest.sg':

                if (data.srcset.length > 0) {
                    const srcset_arr = data.srcset.split(",");
                    for (let i = 0; i < srcset_arr.length; i++) {
                        const src_arr = srcset_arr[i].trim().split(" ");
                        //分解出url和标注
                        console.log(src_arr)
                        if (src_arr[1] == "4x") {
                            //得到大图url
                            url_obj['url'] = src_arr[0];
                        } else if (src_arr[1] == "2x") {
                            //得到中图url
                            url_obj['m_url'] = src_arr[0];
                        } else if (src_arr[1] == "1x") {
                            //得到小图url
                            url_obj['sm_url'] = src_arr[0];
                        }
                    }
                } else {
                    //将pinterest特有的大图地址拼出来
                    const pin_url_arr = data.src.split('x/');
                    const host_end = pin_url_arr[0].length - 3;
                    const new_pin_url_0 = pin_url_arr[0].slice(0, host_end);
                    const new_pin_url_1 = pin_url_arr[1];
                    const new_pin_url = new_pin_url_0 + 'originals/' + new_pin_url_1;
                    console.log(new_pin_url);
                    url_obj['url'] = new_pin_url;
                }
                break;
            case 'www.instagram.com':
                const srcset_arr = data.srcset.split(",");
                if (data.srcset.length > 0) {
                    if (data.srcset.indexOf('1080w') != -1) {
                        //如果srcset中包含1080w，说明是大图模式
                        for (let i = 0; i < srcset_arr.length; i++) {
                            const src_arr = srcset_arr[i].trim().split(" ");
                            //分解出url和标注
                            if (src_arr[1] == "1080w") {
                                //得到大图url，如果i大于当前轮数，说明发现了更大图
                                url_obj['url'] = src_arr[0];
                            } else if (src_arr[1] == "640w") {
                                //得到中图url
                                url_obj['m_url'] = src_arr[0];
                            } else if (src_arr[1] == "240w") {
                                //得到小图url
                                url_obj['sm_url'] = src_arr[0];
                            }
                        }
                    } else {
                        for (let i = 0; i < srcset_arr.length; i++) {
                            const src_arr = srcset_arr[i].trim().split(" ");
                            //分解出url和标注
                            if (src_arr[1] == "640w") {
                                //得到大图url，如果i大于当前轮数，说明发现了更大图
                                url_obj['url'] = src_arr[0];
                            } else if (src_arr[1] == "320w") {
                                //得到中图url
                                url_obj['m_url'] = src_arr[0];
                            } else if (src_arr[1] == "150w") {
                                //得到小图url
                                url_obj['sm_url'] = src_arr[0];
                            }
                        }
                    }
                } else {
                    //如果不存在srcset，则直接把src作为大图
                }
                break;
            case 'livden.com':
                if (data.srcset.length > 0) {
                    const srcset_arr = data.srcset.split(",");
                    const sm_url_index = 0;
                    const url_index = srcset_arr.length - 1;
                    const m_url_index = Math.floor((srcset_arr.length - 1) / 2);
                    for (let i = 0; i < srcset_arr.length; i++) {
                        const src_arr = srcset_arr[i].trim().split(" ");
                        //分解出url和标注
                        if (i == sm_url_index) {
                            //得到小图url
                            url_obj['sm_url'] = 'https:' + src_arr[0];
                        } else if (i == m_url_index) {
                            //得到中图url
                            url_obj['m_url'] = 'https:' + src_arr[0];
                        } else if (i == url_index) {
                            //得到大图url
                            url_obj['url'] = 'https:' + src_arr[0];
                        }
                    }
                }
            default:
                break;
        }

        console.log("url_obj", url_obj)
        return url_obj;
    }

    async select_photos(data) {
        const rows = await this.ctx.service.db.select_photos(data);
        const photos = await this.format_photo_rows(rows, data.user_id);
        return photos;
    }

    async format_photo_rows(rows, user_id) {
        let photos = [];
        for (const row of rows) {
            let item = row;
            if (row.name.length > 20) {
                item['name'] = row.name.slice(0, 18) + '...'
            }
            if (row.sm_path.length > 0) {
                item['sm_path'] = this.app.config.BaseUrl + row.sm_path;
                item['path'] = this.app.config.BaseUrl + row.path;
            } else {
                item['sm_path'] = this.app.config.BaseUrl + this.app.config.LoadingLogo;
                item['path'] = this.app.config.BaseUrl + this.app.config.LoadingLogo;
            }

            item['ai_tag_list'] = await this.ctx.service.tag.get_ai_tags_of_current_photo(row);
            // item['tags_list'] = await this.ctx.service.tag.get_tags_of_current_photo(row.id);
            // item['folder_list'] = await this.ctx.service.folder.folders_by_photo_id(row.id, user_id);
            photos.push(item);
        }
        return photos;
    }

    async select_garbage_photos(data) {
        const rows = await this.ctx.service.db.select_garbage_photos(data);
        let photos = [];
        for (const row of rows) {
            let item = row;
            if (row.name.length > 20) {
                item['name'] = row.name.slice(0, 20) + '...'
            }
            if (row.sm_path.length > 0) {
                item['sm_path'] = this.app.config.BaseUrl + row.sm_path;
                item['path'] = this.app.config.BaseUrl + row.path;
            } else {
                item['sm_path'] = this.app.config.BaseUrl + this.app.config.LoadingLogo;
                item['path'] = this.app.config.BaseUrl + this.app.config.LoadingLogo;
            }
            photos.push(item);
        }
        return photos;
    }

    async get_main_photo(id) {
        const row = await this.ctx.service.db.getMainPhoto(id);
        const data = await this.format_photo_url(row);
        return data;
    }

    async get_instagram_img_base64(src) {
        const imgData = await this.ctx.curl(src, {
            headers: 'Access-Control-Allow-Origin:*',
        })
        console.log(typeof imgData)
        console.log(imgData)
        const base64 = imgData.data.toString('base64')
        console.log(base64);
        return base64;
    }
}

module.exports = PhotoService;