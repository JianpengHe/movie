import { useRequest } from 'ahooks'
import { Button, Form, Input, Table, Typography } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import axios from 'axios'
import React, { useEffect } from 'react'
const { Title } = Typography
interface IProp {}
const FilmList: React.FC<IProp> = () => {
  const { run, data } = useRequest(axios.get, { manual: true })
  useEffect(() => {
    run('/admin_api/filmList')
  }, [])
  const columns: ColumnsType<any> = [
    { title: '电影名', dataIndex: 'fName', key: 'fName', fixed: 'left' },
    { title: 'id', dataIndex: 'fid', key: 'fid' },
    { title: '评分', dataIndex: 'score', key: 'score' },
    { title: '时长', dataIndex: 'filmlong', key: 'filmlong' },
    { title: '上映时间', dataIndex: 'releaseTime', key: 'releaseTime' },
    { title: '基准票价', dataIndex: 'price', key: 'price' },
    { title: '简介', dataIndex: 'introduce', key: 'introduce', ellipsis: true },
    { title: '海报', dataIndex: 'fImage', key: 'fImage', ellipsis: true },
    { title: '演员', dataIndex: 'actor', key: 'actor', ellipsis: true },
    { title: '类型', dataIndex: 'type', key: 'type' },
    { title: '票房', dataIndex: 'totalBoxoffice', key: 'totalBoxoffice' },
  ]
  console.log(data)
  return (
    <>
      <div className="title">
        <Title level={5}>影讯信息管理</Title>
        <Button type="primary">上架电影</Button>
      </div>
      <div className="context">
        <Form layout="inline">
          <div className="space-between" style={{ marginBottom: '24px' }}>
            <div>
              <Form.Item label="电影名称">
                <Input />
              </Form.Item>
            </div>
            <div className="space-between" style={{ width: 'unset' }}>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  搜索
                </Button>
              </Form.Item>
              <Form.Item>
                <Button htmlType="reset">重置</Button>
              </Form.Item>
            </div>
          </div>
        </Form>
        <Table dataSource={data?.data as any} columns={columns} scroll={{ x: 2300, y: 600 }} />;
      </div>
    </>
  )
}

export default FilmList
