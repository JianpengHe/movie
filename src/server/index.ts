import * as path from 'path'
import * as Koa from 'koa'
import * as KoaStatic from 'koa-static'
import { koaRouter } from './router'
import { getKey } from './utils'
export const koa = new Koa()
  .use(async (ctx, next) => {
    if (ctx.path.indexOf('/api') !== 0 || ctx.path === '/api/login' || ctx.path === '/api/register') {
      await next()
      return
    }
    const username = ctx.cookies.get('username')
    const key = ctx.cookies.get('key')
    if (!username || !key) {
      ctx.body = '请登录'
      return
    }
    if (key !== getKey(username)) {
      ctx.body = '请登录'
      return
    }
    await next()
  })
  .use(koaRouter.routes())
  .use(KoaStatic(path.join(__dirname, '../../src/public')))
  .listen(80)
