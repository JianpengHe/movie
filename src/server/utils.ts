import * as crypto from 'crypto'
import * as Koa from 'koa'
import * as mysql from 'mysql'
import { OkPacket } from 'mysql'
const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'usbw',
  database: 'movie',
})
connection.connect()
export const getKey = (username: string) => crypto.createHash('md5').update(username).digest('hex')
export const dosql = (sql: string, item: (string | number)[]): Promise<any[] & OkPacket> => {
  return new Promise(fn => {
    connection.query(sql, item, (err, brr) => {
      if (err) {
        console.error(err)
      }
      // 执行sql查询语句
      fn(brr)
    })
  })
}
export const recvData = (ctx: Koa.ParameterizedContext): Promise<any> =>
  new Promise(fn => {
    const body: Buffer[] = []
    ctx.req.on('data', chuck => body.push(chuck))
    ctx.req.on('end', () => fn(JSON.parse(String(Buffer.concat(body)))))
  })
