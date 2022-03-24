import React from 'react'
import ReactDOM from 'react-dom'
import 'antd/dist/antd.css'
import zhCN from 'antd/lib/locale-provider/zh_CN'
import { ConfigProvider, Layout } from 'antd'
import App from './app'
ReactDOM.render(
  <ConfigProvider locale={zhCN}>
    <Layout>
      <App />
    </Layout>
  </ConfigProvider>,
  document.getElementById('root')
)

if (module && module.hot) {
  module.hot.accept()
}
