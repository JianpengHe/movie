import * as crypto from 'crypto'
import * as Koa from 'koa'
import * as mysql from 'mysql'
import { OkPacket } from 'mysql'
const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: 'movie',
  dateStrings: true,
})
connection.connect()
/** 计算第一个入参的MD5并返回加密后字符串 */
export const getKey = (username: string): string => crypto.createHash('md5').update(username).digest('hex')
/** 第一个参数带占位符的sql语句，第二个参数是代替占位符的数组，返回一个记录结果数组或者受影响的行数，记录结果数组是由key（字段）和value（数值）的对象（记录）构成数组 */
export const dosql = (sql: string, item: (string | number | any)[]): Promise<any[] & OkPacket> => {
  return new Promise((fn, reject) => {
    connection.query(sql, item, (err, brr) => {
      if (err) {
        reject(err)
        return
      }
      // 执行sql查询语句
      fn(brr)
    })
  })
}
/** 服务端监听接收客户端的请求数据，把接收的数据用内存块数据存储起来在拼接成一整个内存块，转换成字符串，再以对象的形式返回 */
export const recvData = (ctx: Koa.ParameterizedContext): Promise<any> =>
  new Promise(fn => {
    const body: Buffer[] = [] // 缓冲区合并。在处理像TCP流或文件流时，必须使用到二进制数据。因此在 Node.js中，定义了一个 Buffer 类，该类用来创建一个专门存放二进制数据的缓存区。Buffer 库为 Node.js 带来了一种存储原始数据的方法，可以让 Node.js 处理二进制数据，每当需要在 Node.js 中处理I/O操作中移动的数据时，就有可能使用 Buffer 库。
    ctx.req.on('data', chuck => body.push(chuck))
    ctx.req.on('end', () => fn(JSON.parse(String(Buffer.concat(body)))))
  })
