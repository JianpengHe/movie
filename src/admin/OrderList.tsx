import { Button, Card, message, Table, Tag } from 'antd'
import React from 'react'
import { PlusOutlined, UserOutlined } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { ajax } from './ajax'
interface IProp {}
const OrderList: React.FC<IProp> = () => {
  const { run, data } = useRequest(ajax.get('/order'), {
    //useRequest 是一个超级强大，且生产完备的网络请求 Hooks，useRequest 接收了一个 ajax请求。并自动管理 data 、run 等数据。data:请求返回的数据。run:执行请求,会自动捕获异常,通过下面配置的onError函数获取异常报错。
    manual: true, //手动请求。一般需要手动触发，比如添加用户，编辑信息，删除用户等等。 useRequest 只需要配置 manual = true ，即可阻止初始化执行。只有触发 run 时才会开始执行。
    onError() {
      //  请求错误触发
      message.error('请求失败')
    },
  })
  React.useEffect(() => {
    //  useEffect用于处理组件中的effect，通常用于请求数据，事件处理，订阅等相关操作useEffect 就是一个 Effect Hook，给函数组件增加了操作副作用的能力。useEffect()有两个参数，第一个参数是要执行的函数，第二个参数是一个依赖项数组(根据需求第二个参数可选是否填写)，根据数组里的变量是否变化决定是否执行函数
    run()
  }, []) //  若不写第二个参数，函数操作每次都会执行。有第二个参数但数组为空，即没有传入比较变化的变量，则比较结果永远都保持不变，那么副作用逻辑（run()）就只能执行一次。副作用仅在组件挂载和卸载时执行。useEffect( ()=>{doSomeThing}, [])

  return (
    <>
      <Card title="订单信息管理">
        <Table
          rowKey="oid"
          dataSource={data}
          columns={[
            { title: '订单编号', dataIndex: 'oid', key: 'oid', align: 'center' },
            { title: '电影名', dataIndex: 'fName', key: 'fName', align: 'center' },
            { title: '影厅名', dataIndex: 'hName', key: 'hName', align: 'center' },
            { title: '下单时间', dataIndex: 'buyTime', key: 'buyTime', align: 'center' },
            {
              title: '座位号',
              dataIndex: 'seatid',
              key: 'seatid',
              align: 'center',
              render(value) {
                return <Tag>{`${Math.floor(value / 9) + 1}排${(value % 9) + 1}列`}</Tag>
              },
            },
            { title: '用户名', dataIndex: 'userName', key: 'userName', align: 'center' },
            {
              title: '票价',
              dataIndex: 'price',
              key: 'price',
              render(value) {
                return `￥${value / 1000}`
              },
              align: 'center',
            },
          ]}
        />
      </Card>
    </>
  )
}

export default OrderList
