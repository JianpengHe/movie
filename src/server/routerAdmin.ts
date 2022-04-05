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
koaRouterAdmin.post('/film', async ctx => {
  const { actor, fImage, fName, fid, introduce, price, releaseTime, score, totalBoxoffice, type } = await recvData(ctx)
  await dosql(
    `INSERT ignore INTO film(actor,fImage,fName,fid,introduce,price,releaseTime,score,totalBoxoffice,type) values(?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE actor=values(actor),fImage=values(fImage),fName=values(fName),fid=values(fid),introduce=values(introduce),price=values(price),releaseTime=values(releaseTime),score=values(score),totalBoxoffice=values(totalBoxoffice),type=values(type)`,
    [JSON.stringify(actor || '[]'), fImage, fName, fid, introduce, price, releaseTime, score, totalBoxoffice, type]
  )
  ctx.body = '成功'
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
  // 使用koaRouter的post方法去接收http请求并调用对应的函数。如router.('/path',async fn)或者router.post('/path',async fn)。
  type user = {
    userName?: string
    password?: string
    sex?: string
    email?: string
  }
  const post: user = await recvData(ctx) // post的类型就是user的类型，就是说赋值给post的话要以user的形式
  if (!Boolean(post.userName)) {
    //  如果用户输入的userName为空时，前端提示
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
    //  把返回的结果全部遍历一遍
    if (!cidHash.has(cid)) {
      //  如果cidhash中有cid记录，则从cidhash中读取内容
      cidHash.set(cid, { cid, cName, halls: [] })
    }
    cidHash.get(cid)?.halls.push({ hid, hName, capacity, price }) // 否则往halls空数组最后添加内容
  })
  ctx.body = [...cidHash.values()] //  返回的结果是cidhash表里的值
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

type IAutoFilmInfo = {
  fid: number
  filmlong: number
  totalBoxoffice: number
  releaseDays: number
  price: number
  maxScale?: number
  minScale?: number
}

koaRouterAdmin.get('/autoPlay', async ctx => {
  const { cid, date } = ctx.query
  const filmInfoList: IAutoFilmInfo[] = await dosql(
    'SELECT fid,filmlong,totalBoxoffice,datediff(now(),releaseTime) as releaseDays,price FROM `film` ORDER BY `film`.`totalBoxoffice` DESC LIMIT 10',
    []
  )
  const scaleTotal = filmInfoList.reduce(
    (sum, { releaseDays, totalBoxoffice }) => sum + totalBoxoffice / releaseDays,
    0
  )
  filmInfoList.forEach(obj => {
    const scale = obj.totalBoxoffice / obj.releaseDays / scaleTotal
    obj.maxScale = Math.min(1, scale + 0.1)
    obj.minScale = Math.max(0, scale - 0.1)
  })
  const halls = await dosql('SELECT hid,capacity,price FROM `hall` WHERE cid=?', [String(cid)])
  // console.log(filmInfoList)
  // console.time('time')
  // const hallNum = 1 / halls.length
  const qu5 = (num: number) => Math.ceil(num / 5) * 5
  type IOutput = {
    pid: number
    fid: number
    date: string
    time: number
    hid: number
  }

  ctx.body = halls
    .map(({ capacity, price, hid }) => {
      let nowTime = 480
      const output: IOutput[] = []
      ;(
        (
          autoPlay(
            filmInfoList.map(({ filmlong }) => qu5(filmlong + capacity / 2)),
            qu5(960 + capacity / 2)
          )
            .filter(plan => {
              const total = plan.reduce((a, b) => a + b)
              return !plan.some(
                (times, index) =>
                  times / total > ((filmInfoList[index] || {}).maxScale || 0) ||
                  times / total < ((filmInfoList[index] || {}).minScale || 0)
              )
              // return !plan.some((times, index) => times / total > hallNum + ((filmInfoList[index] || {}).maxScale || 0))
            })
            .map(plan => ({
              plan,
              total: plan.reduce((a, num, i) => a + num * filmInfoList[i].price * price * capacity, 0),
            }))
            .sort((a, b) => b.total - a.total)[0] || {}
        ).plan || []
      ).forEach((num, filmIndex) => {
        while (num--) {
          output.push({
            pid: Math.floor(-Math.random() * 100000),
            fid: filmInfoList[filmIndex].fid,
            date: String(date),
            time: 0,
            hid,
          })
          nowTime += filmInfoList[filmIndex].filmlong + capacity / 2
        }
      })
      let time = 960 - (nowTime - capacity / 2 - 480)
      output.sort((a, b) => a.pid - b.pid)
      nowTime = 480
      output.forEach((obj, index) => {
        obj.time = qu5(nowTime)
        const jiange = time / (output.length - index)
        const filmlong = filmInfoList.find(({ fid }) => fid === obj.fid)?.filmlong ?? 0
        const realTime = obj.time + filmlong + capacity / 2
        const endTime = Math.max(qu5(realTime), Math.floor((realTime + jiange) / 5) * 5)
        time -= endTime - realTime
        nowTime = endTime
      })
      return output
    })
    .flat()

  // console.log(output)
  // const result: number[][][] = []
  // const hallIndexArr: number[][] = []
  // const dfs = (hallIndex: number) => {
  //   if (hallIndex >= plans.length) {
  //     const total = hallIndexArr.flat().reduce((a, b) => a + b) // 该计划总排片电影数量
  //     if (
  //       hallIndexArr[0].every((_, filmIndex) => {
  //         const filmTotalScale = hallIndexArr.map(hallPlan => hallPlan[filmIndex]).reduce((a, b) => a + b) / total // 某部电影所有影厅的排片比例
  //         return (
  //           // @ts-ignore
  //           filmTotalScale <= filmInfoList[filmIndex].maxScale && filmTotalScale >= filmInfoList[filmIndex].minScale
  //         )
  //       })
  //     ) {
  //       result.push([...hallIndexArr])
  //     }
  //     // console.log(hallIndexArr)
  //   } else {
  //     plans[hallIndex].forEach(plan => {
  //       hallIndexArr[hallIndex] = plan
  //       dfs(hallIndex + 1)
  //     })
  //   }
  // }
  // dfs(0)

  // console.log(result)
  // console.timeEnd('time')
  //  ctx.body = output
  // const halls = await dosql('SELECT hid,capacity,price FROM `hall` WHERE cid=?', [String(cid)])
})

// const autoPlay = (filmInfoList: IAutoFilmInfo[], freeTime: number, duration = 960) => {
//   const result: IAutoFilmInfo[][] = []
//   const sum: IAutoFilmInfo[] = []
//   let usedTime = 0
//   const dfs = (filmInfo: IAutoFilmInfo) => {
//     sum.push(filmInfo)
//     usedTime += filmInfo.filmlong
//     //  console.log(usedTime)
//     if (usedTime > duration) {
//       result.push([...sum].slice(0, sum.length - 1))
//     } else {
//       usedTime += freeTime
//       filmInfoList.forEach(dfs)
//       usedTime -= freeTime
//     }
//     usedTime -= filmInfo.filmlong
//     sum.pop()
//   }
//   filmInfoList.forEach(dfs)
//   return result
// }

const autoPlay = (filmInfoList: IAutoFilmInfo['filmlong'][], duration = 960) => {
  const lastFilmLong = filmInfoList.pop() || 0
  const result: number[][] = []
  const sum: number[] = []
  let usedTime = 0
  const dfs = (filmIndex: number) => {
    if (filmIndex >= filmInfoList.length) {
      result.push([
        ...sum,
        Math.floor(
          (duration -
            filmInfoList.reduce((previousValue, filmlong, index) => previousValue + filmlong * sum[index], 0)) /
            lastFilmLong
        ),
      ])
    } else {
      const maxTime = Math.floor(duration / filmInfoList[filmIndex])
      for (let i = 0; i <= maxTime; i++) {
        usedTime += filmInfoList[filmIndex] * i
        if (usedTime <= duration) {
          sum[filmIndex] = i
          dfs(filmIndex + 1)
        }
        usedTime -= filmInfoList[filmIndex] * i
      }
    }
  }
  dfs(0)
  // console.log(result.map(arr => arr.reduce((a, b, i) => a + b * (filmInfoList[i] || lastFilmLong), 0)))
  return result
}
