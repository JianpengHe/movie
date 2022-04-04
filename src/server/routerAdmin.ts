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
    userName?: string
    password?: string
    sex?: string
    email?: string
  }
  const post: user = await recvData(ctx) // post的类型就是user的类型，就是说赋值给post的话要以user的形式
  if (!Boolean(post.userName)) {
    ctx.body = '用户名不能为空'
    return
  }
  const keys = ['userName', 'password', 'sex', 'email']
  const needUpdateKey = keys.filter(key => Boolean(post[key]))

  const inser = await dosql(
    `INSERT ignore INTO account (${needUpdateKey.join(',')}) VALUES (${needUpdateKey
      .map(a => '?')
      .join(',')}) ON DUPLICATE KEY UPDATE ${needUpdateKey.map(key => `${key}=VALUES(${key})`).join(',')}`,
    needUpdateKey.map(key => post[key])
  )
  if (inser.affectedRows === 0) {
    // 是数据库中的唯一索引限制了不能重复插入数据，所以可以用影响行数是否为0来判断是否插入成功，如果影响行数为0返回客户端注册失败。
    ctx.body = '失败'
  } else {
    ctx.body = '成功'
  }
})

koaRouterAdmin.get('/hall', async ctx => {
  const result = await dosql(
    `SELECT hall.cid,hName,hid,cName,capacity,price FROM hall INNER JOIN cinema on hall.cid=cinema.cid`,
    []
  )
  type ICinema = {
    cid: number
    cName: string
    halls: {
      hid: number
      hName: string
      capacity: number
      price: number
    }[]
  }
  const cidHash = new Map<number, ICinema>()
  result.forEach(({ cid, cName, hid, hName, capacity, price }) => {
    if (!cidHash.has(cid)) {
      cidHash.set(cid, { cid, cName, halls: [] })
    }
    cidHash.get(cid)?.halls.push({ hid, hName, capacity, price })
  })
  ctx.body = [...cidHash.values()]
})

koaRouterAdmin.get('/play', async ctx => {
  const { cid, date } = ctx.query
  ctx.body = await dosql(
    'SELECT pid,fid,time,hid FROM `play` WHERE date=? and hid in (SELECT hid FROM `hall` WHERE cid=?)',
    [date, cid]
  )
})

koaRouterAdmin.get('/filmBoxofficeTop10', async ctx => {
  ctx.body =
    (await dosql(
      'SELECT (@rowNum:=@rowNum+1) AS rank,fName,fid,score,filmlong,releaseTime,price,totalBoxoffice,fImage FROM `film` ,(SELECT (@rowNum :=-1) ) b ORDER BY `film`.`totalBoxoffice` DESC LIMIT 10',
      []
    )) || []
})

koaRouterAdmin.post('/play', async ctx => {
  const { date, cid } = ctx.query
  const list = await recvData(ctx)
  const updateArr = list.filter(({ pid }) => pid > 0)
  const insertArr = list.filter(({ pid }) => pid < 0)
  await dosql('DELETE FROM play WHERE date=? and hid in (SELECT hid FROM `hall` WHERE cid=?)', [date, cid])
  if (updateArr.length) {
    await dosql(
      `INSERT ignore INTO play (pid,fid,date,time,hid) VALUES ? ON DUPLICATE KEY UPDATE pid=VALUES(pid),fid=VALUES(fid),date=VALUES(date),time=VALUES(time),hid=VALUES(hid)`,
      [updateArr.map(({ pid, fid, time, hid }) => [pid, fid, date, time, hid])]
    )
  }
  if (insertArr.length) {
    await dosql(`INSERT ignore INTO play (fid,date,time,hid) VALUES ? `, [
      insertArr.map(({ fid, time, hid }) => [fid, date, time, hid]),
    ])
  }

  ctx.body = '成功'
})
