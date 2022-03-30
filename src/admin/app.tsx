import React from 'react'
import { Col, Layout, Menu, Row, Space } from 'antd'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
  PoweroffOutlined,
} from '@ant-design/icons'
import styled from 'styled-components'
import FilmList from './FilmList'
import HallList from './HallList'
import './app.css'
const { Header, Sider, Content } = Layout
const Div = styled.div`
  .trigger {
    padding: 0 24px;
    font-size: 18px;
    line-height: 64px;
    cursor: pointer;
    transition: color 0.3s;
  }

  .trigger:hover {
    color: #1890ff;
  }

  .logo {
    height: 32px;
    margin: 16px;
    background: rgba(255, 255, 255, 0.3);
  }

  .site-layout .site-layout-background {
    background: #fff;
  }
  .ant-layout {
    height: 100vh;
  }
  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px 15px;
    border-bottom: 2px solid rgb(240, 242, 245);
  }
  .context {
    padding: 20px 24px 15px;
  }
  .space-between {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
`
const menu: {
  name: string
  icon: React.ReactNode
  render: React.ReactNode
}[] = [
  {
    name: '影讯信息管理',
    icon: <UserOutlined />,
    render: <FilmList />,
  },
  {
    name: '放映厅管理',
    icon: <UserOutlined />,
    render: <HallList />,
  },
]
export default () => {
  const [collapsed, setCollapsed] = React.useState(false)
  const [page, setPage] = React.useState('0')

  return (
    <Div>
      <Layout>
        <Sider trigger={null} collapsible collapsed={collapsed}>
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
              <Col span={8}>
                {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                  className: 'trigger',
                  onClick() {
                    setCollapsed(!collapsed)
                  },
                })}
              </Col>
              <Col span={8} offset={8} style={{ textAlign: 'right', margin: '0 20px', fontSize: '18px' }}>
                <Space>
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
