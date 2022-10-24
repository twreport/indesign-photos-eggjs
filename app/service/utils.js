'use strict';

const Service = require('egg').Service;

class UtilsService extends Service {
    async getToday() {
        const date = new Date();
        const year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();

        month = (month > 9) ? month : ("0" + month);
        day = (day < 10) ? ("0" + day) : day;
        const today = year.toString() + month.toString() + day.toString();
        return today;
    }

    /**
     * 随机生成字符串
     * @param len 指定生成字符串长度
     */
    async getRandomString(len) {
        let _charStr = 'abacdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789',
            min = 0,
            max = _charStr.length - 1,
            _str = '';                    //定义随机字符串 变量
        //判断是否指定长度，否则默认长度为20
        len = len || 20;
        //循环生成字符串
        for (let i = 0, index; i < len; i++) {
            index = (function (randomIndexFunc, i) {
                return randomIndexFunc(min, max, i, randomIndexFunc);
            })(function (min, max, i, _self) {
                let indexTemp = Math.floor(Math.random() * (max - min + 1) + min),
                    numStart = _charStr.length - 10;
                if (i == 0 && indexTemp >= numStart) {
                    indexTemp = _self(min, max, i, _self);
                }
                return indexTemp;
            }, i);
            _str += _charStr[index];
        }
        return _str;
    }
}

module.exports = UtilsService;