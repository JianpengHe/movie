import * as KoaRouter from 'koa-router'
import { dosql, getKey, recvData } from './utils'
export const koaRouter = new KoaRouter()
koaRouter.prefix('/api')
koaRouter.post('/login', async ctx => {
  // const result = await new Promise((fn) => {
  //   connection.query(sql, [ctx.query.username, ctx.query.password], (err, brr) => {
  //     //执行sql查询语句
  //     if (
  //       ctx.query.username === (brr[0] || {}).userName &&
  //       ctx.query.password === (brr[0] || {}).password
  //     ) {
  //       fn(true);
  //     } else {
  //       fn(false);
  //     }
  //     console.log(err, brr);
  //   });
  // });
  const { username, password } = await recvData(ctx)
  const dbResult = await dosql('SELECT * FROM `account` WHERE `userName` = ? ;', [username])
  // console.log(dbResult);
  if (dbResult.length === 0) {
    ctx.body = '用户名不存在'
    return
  }
  // console.log(ctx);
  else if (dbResult[0].password !== password) {
    ctx.body = '密码错误'
  } else {
    const key = getKey(username)
    ctx.cookies.set('key', key)
    ctx.cookies.set('username', username)
    ctx.body = '登录成功'
  }
})

koaRouter.post('/register', async ctx => {
  type user = {
    username: string
    password: string
    sex: string
    email: string
  }
  const post: user = await recvData(ctx)
  const inser = await dosql('INSERT ignore INTO `account`(`userName`, `password`, `sex`, `email`) VALUES (?,?,?,?)', [
    post.username,
    post.password,
    post.sex,
    post.email,
  ])
  if (inser.affectedRows === 0) {
    ctx.body = '注册失败'
  } else {
    ctx.body = '注册成功'
  }
})
koaRouter.get('/check', async ctx => {
  ctx.body = '成功'
})

koaRouter.get('/filmList', async ctx => {
  const dbResult = await dosql('SELECT * FROM `film`', [])
  ctx.body = dbResult
})
