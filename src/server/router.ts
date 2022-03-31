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
  } else if (dbResult[0].password !== password) {
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

koaRouter.get('/filmList', async ctx => {
  const dbResult = await dosql('SELECT fName,fid,score,releaseTime,fImage FROM `film` ORDER BY `film`.`score` DESC', [])
  ctx.body = dbResult
})

koaRouter.get('/filmDetails', async ctx => {
  const { fid } = ctx.query //  获得GET请求的方式有两种，一种是从request中获得，一种是一直从上下文中获得。获得的格式也有两种：query和querystring       query返回的是格式化好的参数对象
  const dbResult = await dosql(
    'SELECT fName,score,filmlong,releaseTime,price,introduce,fImage,actor,type FROM `film` WHERE fid=?;',
    [String(fid)]
  )
  ctx.body = dbResult[0] || {}
  ctx.body.actor = JSON.parse(ctx.body?.actor ?? '[]') /// JSON.parse（json字符串 -> json对象）JSON字符串转换为JSON对象
})

koaRouter.get('/cinemaSelect', async ctx => {
  const { fid, date } = ctx.query
  const result = await dosql(
    `SELECT d.cid,cName,address,minPrice FROM (SELECT cid,min(price) as minPrice FROM (SELECT cid,price FROM (SELECT hid FROM play WHERE fid=? AND date=?)a INNER JOIN hall b on a.hid=b.hid)c GROUP by cid) d INNER JOIN cinema e on d.cid=e.cid;`,
    [String(fid), String(date)]
  )
  ctx.body = result
})

koaRouter.get('/hallSelect', async ctx => {
  const { fid, date, cid } = ctx.query
  const result = await dosql(
    `SELECT hName,price,time,pid FROM (SELECT hid,hName,price FROM hall WHERE cid=?) a INNER JOIN play b on a.hid =b.hid WHERE date=? and fid=?; `,
    [String(cid), String(date), String(fid)]
  )
  ctx.body = result
})

koaRouter.get('/seatSelect', async ctx => {
  const { pid } = ctx.query
  const dbresult = await dosql(
    `SELECT capacity,date,time,fName,filmlong,d.price*c.price as price,hName FROM (SELECT date,time,hid,fName,filmlong,price FROM (SELECT fid,date,time,hid FROM play WHERE pid=?) a INNER JOIN film b on a.fid=b.fid) c INNER JOIN hall d on c.hid=d.hid;`,
    [String(pid)]
  )
  ctx.body = dbresult[0] || {} // 如果 dbresult[0] 为空，就用空对象去代替
  const dbresult2 = await dosql(`SELECT seatid FROM orderlist WHERE pid=?;`, [String(pid)])
  ctx.body.seat = dbresult2.map(function (a) {
    return a.seatid
  })
})

koaRouter.post('/seatSelect', async ctx => {
  const { pid } = ctx.query
  const seat: number[] = await recvData(ctx)
  const userName = ctx.cookies.get('username')
  try {
    await dosql('INSERT INTO `orderlist`( `pid`, `seatid`, `userName`) VALUES ?', [seat.map(a => [pid, a, userName])])
    ctx.body = '购买成功'
  } catch (e) {
    ctx.body = '座位已被售出'
  }
})

koaRouter.get('/orderlist', async ctx => {
  const userName = ctx.cookies.get('username')
  const dbresult = await dosql(
    `SELECT oid	,seatid	,buyTime,date,time,fName,filmlong,d.price*c.price as price,hName,fImage,getCinemaName(cid) as cName FROM (SELECT oid,seatid	,buyTime,date,time,hid,fName,filmlong,price,fImage FROM (SELECT oid,seatid,buyTime,fid,date,time,hid FROM orderlist f INNER JOIN play e on f.pid=e.pid WHERE userName=?) a INNER JOIN film b on a.fid=b.fid) c INNER JOIN hall d on c.hid=d.hid;`,
    [String(userName)]
  )
  ctx.body = dbresult
})

koaRouter.get('/List', async ctx => {
  const dbResult = await dosql(`SELECT fName,fImage,actor,score,releaseTime FROM film ORDER BY film.score DESC `, [])
  dbResult.forEach(function (_, i) {
    dbResult[i].actor = JSON.parse(dbResult[i].actor)
      .slice(0, 2)
      .map(function (gkd) {
        return gkd.name
      })
      .join('、')
  })
  ctx.body = dbResult
})

koaRouter.get('/cinema', async ctx => {
  const dbResult = await dosql(`SELECT cName,address,location FROM cinema `, [])
  ctx.body = dbResult
})
