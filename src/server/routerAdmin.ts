import * as KoaRouter from 'koa-router' //  引入koa-router
import { dosql, getKey, recvData } from './utils'
export const koaRouterAdmin = new KoaRouter()
koaRouterAdmin.prefix('/admin_api') // koaRouter的所有路径都会自动被添加该(/api)路由前缀。
koaRouterAdmin.get('/check', async ctx => {
  ctx.body = 'hello'
})
koaRouterAdmin.get('/filmList', async ctx => {
  ctx.body = (await dosql('SELECT * FROM `film` where isDel=0', [])) || []
  ctx.body.forEach(({ actor }, index) => {
    ctx.body[index].actor = JSON.parse(actor || '[]')
  })
})

koaRouterAdmin.delete('/film', async ctx => {
  const { fid } = ctx.query
  const result = await dosql(`UPDATE film SET isDel = 1 WHERE fid = ?`, [String(fid)])
  ctx.body = '操作成功'
})

koaRouterAdmin.get('/order', async ctx => {
  const result = await dosql(
    `SELECT oid,userName,fName,seatid,buyTime,d.price*c.price as price,hName,getCinemaName(cid) as cName FROM (SELECT oid,seatid ,buyTime,hid,fName,price,userName FROM (SELECT oid,seatid,buyTime,fid,hid,userName FROM orderlist f INNER JOIN play e on f.pid=e.pid) a INNER JOIN film b on a.fid=b.fid) c INNER JOIN hall d on c.hid=d.hid`,
    []
  )
  ctx.body = result
})
