import * as KoaRouter from 'koa-router' //  引入koa-router
import { dosql, getKey, recvData } from './utils'
export const koaRouterAdmin = new KoaRouter()
koaRouterAdmin.prefix('/admin_api') // koaRouter的所有路径都会自动被添加该(/api)路由前缀。
koaRouterAdmin.get('/check', async ctx => {
  ctx.body = 'hello'
})
