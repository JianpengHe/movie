import { Button, Card, message, Table } from 'antd'
import React from 'react'
import { PlusOutlined, UserOutlined } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { ajax } from './ajax'
interface IProp {}
const HallList: React.FC<IProp> = () => {
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
      <Card
        title="放映厅管理"
        extra={
          <Button icon={<PlusOutlined />} type="primary">
            增加影厅
          </Button>
        }
      >
        <Table rowKey="hid" dataSource={data} columns={[{ title: '影厅编号' }]} />
        daadad
      </Card>
    </>
  )
}

export default HallList
