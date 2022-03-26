import * as KoaRouter from 'koa-router' //  引入koa-router
import { dosql, getKey, recvData } from './utils'
export const koaRouter = new KoaRouter()
koaRouter.prefix('/api') // koaRouter的所有路径都会自动被添加该(/api)路由前缀。
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
  const { username, password } = await recvData(ctx) // 接收前端传来的username和password，分别赋值username和password
  const dbResult = await dosql('SELECT * FROM `account` WHERE `userName` = ? ;', [username]) // 把变量username等于数据库字段userName的记录全部找出来，并赋值给dbResult
  if (dbResult.length === 0) {
    ctx.body = '用户名不存在'
    return
  }
  // console.log(ctx);
  else if (dbResult[0].password !== password) {
    ctx.body = '密码错误'
  } else {
    const key = getKey(username) // 把username进行加密
    ctx.cookies.set('key', key)
    ctx.cookies.set('username', username) //  在上下文中写入cookiecookie相当于通行证，这里是把用户的变量username往cookie里设置username,
    ctx.body = '登录成功'
  }
})

koaRouter.post('/register', async ctx => {
  // 使用loaRouter的post方法去接收http请求并调用对应的函数。如router.('/path',async fn)或者router.post('/path',async fn)。
  type user = {
    username: string
    password: string
    sex: string
    email: string
  }
  const post: user = await recvData(ctx) // post的类型就是user的类型，就是说赋值给post的话要以user的形式
  const inser = await dosql('INSERT ignore INTO `account`(`userName`, `password`, `sex`, `email`) VALUES (?,?,?,?)', [
    post.username,
    post.password,
    post.sex,
    post.email,
  ])
  if (inser.affectedRows === 0) {
    // 是数据库中的唯一索引限制了不能重复插入数据，所以可以用影响行数是否为0来判断是否插入成功，如果影响行数为0返回客户端注册失败。
    ctx.body = '注册失败'
  } else {
    ctx.body = '注册成功'
  }
})
koaRouter.get('/check', async ctx => {
  ctx.body = '成功'
})

koaRouter.get('/filmList', async ctx => {
  const dbResult = await dosql('SELECT * FROM `film` limit 10', [])
  ctx.body = dbResult
})

koaRouter.get('/filmDetails', async ctx => {
  const { fid } = ctx.query
  const dbResult = await dosql(
    'SELECT fName,score,filmlong,releaseTime,introduce,fImage,actor,type FROM `film` WHERE fid=?;',
    [String(fid)]
  )
  ctx.body = dbResult[0]
  ctx.body.actor = JSON.parse(ctx.body.actor)
})
