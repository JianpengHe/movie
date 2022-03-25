import * as path from 'path'
import * as Koa from 'koa'
import * as KoaStatic from 'koa-static'
import { koaRouter } from './router'
import { getKey } from './utils'
export const koa = new Koa() //  引入Koa构造函数对象,创建服务器示例对象
  .use(async (ctx, next) => {
    //  配置中间件koa.use（做什么） 参数说明：ctx(context)上下文对象，该对象类似于原生http中的req+res 。 context 对象就是从请求到响应过程中的一个描述对象
    if (ctx.path.indexOf('/api') !== 0 || ctx.path === '/api/login' || ctx.path === '/api/register') {
      await next() // next函数:调用下一个中间件
      return
    }
    const username = ctx.cookies.get('username') //  cookie保存在浏览器客户端，存储已登录用户的凭证，可以让我们用同一个浏览器访问统一域名下的共享数据。Koa中获取Cookie的值方法ctx.cookies.get('xxx')
    const key = ctx.cookies.get('key')
    if (!username || !key) {
      ctx.body = '请登录'
      return
    }
    if (key !== getKey(username)) {
      //  判断用户的cookie是否是按照我们算法生成的（是否我们给的），不是的话就请登录

      ctx.body = '请登录'
      return
    }
    await next()
  })
  .use(koaRouter.routes()) // 将koaRouter注册到koa对象上面。koaRouter替你接管url和处理函数之间的映射，而不需要关心真实的访问路径如何
  .use(KoaStatic(path.join(__dirname, '../../src/public'))) //  引入配置中间件  __dirname为绝对路径  path.join()为拼接路径语法  设置Public文件为静态资源文件夹浏览器可以直接访问静态资源夹
  .listen(80) // 在端口80监听
