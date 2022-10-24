//options: 中间件的配置项，框架会将 app.config[${middlewareName}] 传递进来。
//app: 当前应用 Application 的实例。
module.exports = (options,app) => {
    //返回一个异步的方法
    return async function checkToken(ctx,next){
        console.log('token');
        const headers = ctx.request.headers;
        console.log(ctx.request);
        //判断是否携带了token
        if(headers.hasOwnProperty('token') == true){
            const token = ctx.request.headers.token;
            console.log("token", token);
            const rows = await ctx.service.auth.get_token(token);
            console.log("token rows", rows);
            if(rows.length > 0){
                const row = rows[0];
                //判断是否超时
                const now = Math.round(new Date().getTime()/1000);
                if (now > row.expires) {
                    //如果超时直接返回
                    ctx.body = {'code': 404};
                    return;
                }else{
                    //将与时间戳对应的用户id附加到访问headers
                    const user_id = row.user_id;
                    ctx.request.headers['user_id'] = user_id;
                    await next();
                }
            }else{
                ctx.body = {'code': 404};
                return;
            }
        }else{
            ctx.body = {'code': 404};
            return;
        }
    }
}