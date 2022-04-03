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

koaRouterAdmin.get('/user', async ctx => {
  const result = await dosql(`SELECT id,userName,sex,email FROM account;`, [])
  ctx.body = result
})

koaRouterAdmin.post('/user', async ctx => {
  // 使用loaRouter的post方法去接收http请求并调用对应的函数。如router.('/path',async fn)或者router.post('/path',async fn)。
  type user = {
    username: string
    password?: string
    sex: string
    email: string
  }
  const post: user = await recvData(ctx) // post的类型就是user的类型，就是说赋值给post的话要以user的形式
  const needUpdatePwd = Boolean(post.password)
  const inser = await dosql(
    'INSERT ignore INTO `account`(`userName`, `sex`, `email`' +
      (needUpdatePwd ? ', `password`' : '') +
      ') VALUES (?,?,?' +
      (needUpdatePwd ? '?,' : '') +
      ')',
    [post.username, post.sex, post.email, post.password]
  )
  if (inser.affectedRows === 0) {
    // 是数据库中的唯一索引限制了不能重复插入数据，所以可以用影响行数是否为0来判断是否插入成功，如果影响行数为0返回客户端注册失败。
    ctx.body = '注册失败'
  } else {
    ctx.body = '注册成功'
  }
})
