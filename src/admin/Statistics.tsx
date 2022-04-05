import { Card, message, Row, Spin, Statistic, Table, Tag } from 'antd'
import React from 'react'
import { PlusOutlined, UserOutlined } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { ajax } from './ajax'
import { Pie } from '@ant-design/plots'
interface IProp {}
const Statistics: React.FC<IProp> = () => {
  const { data: statistics } = useRequest(ajax.get('/statistics'))
  const { data: filmBoxoffice } = useRequest(ajax.get('/filmBoxofficeTop10'))

  const config = {
    appendPadding: 10,
    data: (filmBoxoffice || []).map(({ fName, totalBoxoffice }) => ({
      type: fName,
      value: totalBoxoffice,
    })),
    angleField: 'value',
    colorField: 'type',
    radius: 0.75,
    label: {
      type: 'spider',
      labelHeight: 28,
      content: '{name}\n{percentage}',
    },
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
    ],
  }
  return (
    <>
      <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
        <Card style={{ width: '100%', margin: '20px' }}>
          <Statistic title="入驻影院" value={statistics?.cinema} />
        </Card>
        <Card style={{ width: '100%', margin: '20px' }}>
          <Statistic title="电影总数" value={statistics?.film} />
        </Card>
        <Card style={{ width: '100%', margin: '20px' }}>
          <Statistic title="注册用户" value={statistics?.account} />
        </Card>
        <Card style={{ width: '100%', margin: '20px' }}>
          <Statistic title="累计订单" value={statistics?.orderlist} />
        </Card>
        <Card style={{ width: '100%', margin: '20px' }}>
          <Statistic title="放映场次" value={statistics?.play} />
        </Card>
      </div>

      <Card title="今日票房">{filmBoxoffice ? <Pie {...config} /> : <Spin />}</Card>
    </>
  )
}

export default Statistics
