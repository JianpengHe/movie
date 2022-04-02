import { Button, Card, message, Table, Tag } from 'antd'
import React from 'react'
import { PlusOutlined, UserOutlined } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { ajax } from './ajax'
interface IProp {}
const OrderList: React.FC<IProp> = () => {
  const { run, data } = useRequest(ajax.get('/order'), {
    manual: true,
    onError() {
      message.error('请求失败')
    },
  })
  React.useEffect(() => {
    run()
  }, [])

  return (
    <>
      <Card title="订单管理">
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
