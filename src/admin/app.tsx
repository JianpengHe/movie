import React from 'react'
import { Col, Layout, Menu, Row, Space } from 'antd'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  VideoCameraOutlined,
  SolutionOutlined,
  InfoCircleOutlined,
  BarChartOutlined,
  PoweroffOutlined,
} from '@ant-design/icons' // 在前端定义枚举映射
import styled from 'styled-components'
import FilmList from './FilmList'
import HallList from './HallList'
import './app.css'
import OrderList from './OrderList'
import UserList from './UserList'
const { Header, Sider, Content } = Layout
const Div = styled.div``
const menu: {
  name: string
  icon: React.ReactNode
  render: React.ReactNode //  对服务器下发的菜单数据进行转换,icon字段是React.ReactNode的类型  React.ReactNode是组件所有可能的返回值的集合(可以是 ReactElement, ReactFragment, string ，a number 或者一个数组 ReactNodes, 或者null,或者 undefined, 或者 boolean)
}[] = [
  {
    name: '影讯信息管理',
    icon: <UserOutlined />,
    render: <FilmList />,
  },
  {
    name: '放映厅管理',
    icon: <VideoCameraOutlined />,
    render: <HallList />,
  },
  {
    name: '订单信息管理',
    icon: <SolutionOutlined />,
    render: <OrderList />,
  },
  {
    name: '用户信息管理',
    icon: <InfoCircleOutlined />,
    render: <UserList />,
  },
  {
    name: '票房统计',
    icon: <BarChartOutlined />,
    render: <OrderList />,
  },
]
export default () => {
  const [collapsed, setCollapsed] = React.useState(false) // 改写成Hooks的写法。useState：组件状态管理的钩子      collapsed：管理组件的状态  setCollapsed：更新collapsed的方法，方法名不可更改！  false:初始的collapsed，可以是任意的数据类型,这里是布尔型
  const [page, setPage] = React.useState('0')

  return (
    <Div>
      <Layout>
        <Sider trigger={null} collapsible collapsed={collapsed}>
          {' '}
          {/*使用自定义触发器，可以设置 trigger={null} 来隐藏默认设定*/}
          <div className="logo" />
          <Menu theme="dark" mode="inline" onSelect={({ key }) => setPage(key)} defaultSelectedKeys={[page]}>
            {menu.map(({ name, icon }, index) => (
              <Menu.Item key={String(index)} icon={icon}>
                {name}
              </Menu.Item>
            ))}
          </Menu>
        </Sider>
        <Layout className="site-layout">
          <Header className="site-layout-background" style={{ padding: 0 }}>
            <Row justify="space-between">
              {/* 栅格化系统基于 Flex 布局，允许子元素在父节点内的水平对齐方式 */}
              <Col span={8}>
                {/* 通过 row 在水平方向建立一组 column（简写 col）。 你的内容应当放置于 col 内，并且，只有 col 可以作为
                row 的直接元素。 栅格系统中的列是指 1 到 24 的值来表示其跨越的范围。例如，三个等宽的列可以使用来创建。 */}
                <Col span={8} />
                {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                  className: 'trigger',
                  onClick() {
                    setCollapsed(!collapsed) //  鼠标点击触发器菜单栏展开（不是收起状态）
                  },
                })}
              </Col>
              <Col span={8} offset={8} style={{ textAlign: 'right', margin: '0 20px', fontSize: '18px' }}>
                {/* //offset栅格左侧的间隔格数，间隔内不可以有栅格 */}
                <Space>
                  {/* 设置组件之间的间距。避免组件黏在一起，拉开一定距离，适合行内元素的水平间距 */}
                  <a>
                    <UserOutlined />
                    admin
                  </a>
                  <a>
                    <PoweroffOutlined />
                    退出登录
                  </a>
                </Space>
              </Col>
            </Row>
          </Header>
          <Content
            className="site-layout-background"
            style={{
              margin: '24px 16px',
              // padding: 24,
              minHeight: 280,
            }}
          >
            {menu[Number(page)].render}
          </Content>
        </Layout>
      </Layout>
    </Div>
  )
}
