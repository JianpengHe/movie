import { useRequest } from 'ahooks'
import { Button, Form, Input, Table, Typography } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import React, { useEffect } from 'react'
import { ajax } from './ajax'
import './FilmList.less'
const { Title } = Typography
interface IProp {}
const FilmList: React.FC<IProp> = () => {
  //  React.FC提供了类型检查和自动完成的静态属性,简单来说，不知道用什么组件类型时，就用 React.FC
  const { run, data } = useRequest(ajax('get', '/filmList'), { manual: true })
  useEffect(() => {
    run()
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
        <Button type="primary">上架电影</Button> {/*主按钮primary：用于主行动点，一个操作区域只能有一个主按钮。*/}
      </div>
      <div className="context">
        <Form layout="inline">
          {/*表单布局为inline*/}
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
        <Table dataSource={(data as any)?.data} columns={columns} scroll={{ x: 2300, y: 600 }} />;
      </div>
    </>
  )
}

export default FilmList
