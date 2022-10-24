/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {
    mysql: {
      // 单数据库信息配置
      client: {
        // host
        host: '192.168.2.100',
        // 端口号
        port: '3306',
        // 用户名
        user: 'admin',
        // 密码
        password: 'tw7311',
        // 数据库名
        database: 'photos',
      },
      // 是否加载到 app 上，默认开启
      app: true,
      // 是否加载到 agent 上，默认关闭
      agent: false,
    },
  };

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1665734179642_9036';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
    BaseUrl: 'http://192.168.2.100:7001/public/uploads/',
    LoadingLogo: 'loading.gif'
  };

  config.middleware = ['token'];

  // close csrf
  config.security = {
    csrf: {
      enable: false,
    },
  };

  return {
    ...config,
    ...userConfig,
  };
};
