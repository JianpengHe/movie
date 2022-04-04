import { useBoolean, useRequest } from 'ahooks'
import { Button, Card, Form, Input, Rate, Table, Tooltip, Typography, Image, Tag, Space, Popconfirm } from 'antd'
import { PlusOutlined, UserOutlined } from '@ant-design/icons'
import React, { useEffect } from 'react'
import { ajax } from './ajax'

import FilmForm from './FilmForm'
interface IProp {}
const FilmList: React.FC<IProp> = () => {
  //  React.FC提供了类型检查和自动完成的静态属性,简单来说，不知道用什么组件类型时，就用 React.FC

  const [url, setUrl] = React.useState('')
  const [filmInfo, setFilmInfo] = React.useState<any>(undefined)

  const { run, data, refresh } = useRequest(ajax.get('/filmList'), {
    manual: true,
    onSuccess(obj) {
      setFilter(obj)
    },
  })

  const { run: del } = useRequest(ajax.delete('/film'), {
    manual: true,
    onSuccess() {
      run()
    },
  })

  const [filter, setFilter] = React.useState<any[]>([])
  useEffect(() => {
    run()
  }, [])
  const colorList = [
    'magenta',
    'red',
    'volcano',
    'orange',
    'gold',
    'lime',
    'green',
    'cyan',
    'blue',
    'geekblue',
    'purple',
  ]
  const colorMap: Map<string, string> = new Map()
  ;[...new Set((filter || []).map(({ type }) => type.replace(/\s/g, '').split(',')).flat())].forEach((tag, index) =>
    colorMap.set(tag as string, colorList[index % colorList.length])
  )
  return (
    <>
      <Image
        style={{ display: 'none' }}
        src={url}
        preview={{
          visible: url !== '',
          src: url,
          onVisibleChange(value) {
            if (value) {
              return
            }
            setUrl('')
          },
        }}
      />
      <Card
        title="影讯信息管理"
        extra={
          // 额外的信息提示
          <Button icon={<PlusOutlined />} type="primary" onClick={() => setFilmInfo({})}>
            上架电影
          </Button>
        }
      >
        <Form
          onFinish={({ fName }) => {
            setFilter(data.filter(({ fName: oldName }) => oldName.indexOf(fName) >= 0))
          }}
          onReset={() => setFilter(data)}
          layout="inline"
        >
          <div className="space-between" style={{ marginBottom: '24px' }}>
            <div>
              <Form.Item label="电影名称" name="fName">
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
        <Table
          rowKey="fid"
          dataSource={filter}
          columns={[
            { title: '电影名', dataIndex: 'fName', key: 'fName', fixed: 'left', width: 120, align: 'center' },
            {
              title: '类型',
              dataIndex: 'type',
              key: 'type',
              render(value) {
                return value
                  .replace(/\s/g, '')
                  .split(',')
                  .map((tag, index) => (
                    <p key={index}>
                      <Tag color={colorMap.get(tag)}>{tag}</Tag>
                    </p>
                  ))
              },
              width: 60,
              align: 'center',
            },
            {
              title: '上映时间',
              dataIndex: 'releaseTime',
              key: 'releaseTime',
              render(value) {
                return value.substring(0, 10)
              },
              width: 120,
              ellipsis: true,
              align: 'center',
              defaultSortOrder: 'ascend',
              sorter: (a, b) => new Date(a.releaseTime).getTime() - new Date(b.releaseTime).getTime(),
            },
            {
              title: '时长',
              dataIndex: 'filmlong',
              key: 'filmlong',
              width: 90,
              ellipsis: true,
              render(value) {
                return `${value}分钟`
              },
              align: 'center',
            },

            {
              title: '基准票价',
              dataIndex: 'price',
              key: 'price',
              width: 100,
              ellipsis: true,
              render(value) {
                return `￥${value / 100}`
              },
              align: 'center',
            },
            {
              title: '评分',
              dataIndex: 'score',
              key: 'score',
              width: 120,
              align: 'center',
              render(value) {
                return (
                  <Tooltip placement="top" title={`${value / 10}分`}>
                    <div>
                      <Rate allowHalf disabled defaultValue={value / 20} />
                    </div>
                  </Tooltip>
                )
              },
            },

            {
              title: '简介',
              dataIndex: 'introduce',
              key: 'introduce',
              align: 'center',
              render(value) {
                return (
                  <Tooltip title={value} placement="topLeft">
                    <Typography.Paragraph ellipsis={{ rows: 4 }} style={{ textAlign: 'left', textIndent: '2em' }}>
                      {value}
                    </Typography.Paragraph>
                  </Tooltip>
                )
              },
            },
            {
              title: '海报',
              dataIndex: 'fImage',
              key: 'fImage',
              render(value) {
                return <Image width={60} src={value} preview={{ src: value.substring(0, value.lastIndexOf('_')) }} />
              },
              align: 'center',
              width: 80,
            },
            {
              title: '演员',
              dataIndex: 'actor',
              key: 'actor',
              width: 200,
              render(value) {
                return (
                  <Typography.Paragraph ellipsis={{ rows: 4, expandable: true }}>
                    {value.map(({ name, headimg }, index) => (
                      <Tag
                        icon={<UserOutlined />}
                        key={index}
                        onClick={() => setUrl(headimg)}
                        style={{ cursor: 'pointer' }}
                      >
                        {name}
                      </Tag>
                    ))}
                  </Typography.Paragraph>
                )
              },
            },

            {
              title: '票房',
              dataIndex: 'totalBoxoffice',
              key: 'totalBoxoffice',
              render(value) {
                const arr = [...String(value)]
                return arr
                  .map((n, i) => n + ((arr.length - 1 - i) % 3 === 0 && i !== arr.length - 1 ? ',' : ''))
                  .join('')
              },
              width: 120,
              align: 'center',
            },
            {
              title: '操作',
              dataIndex: 'fid',
              key: 'fid',
              fixed: 'right',
              align: 'center',
              width: 120,
              render(fid, info) {
                return (
                  <Space>
                    <Button type="primary" size="small" onClick={() => setFilmInfo({ ...info })}>
                      编辑
                    </Button>
                    <Popconfirm placement="topRight" title="是否确定下架" onConfirm={() => del('fid=' + fid)}>
                      <Button type="primary" danger size="small">
                        下架
                      </Button>
                    </Popconfirm>
                  </Space>
                )
              },
            },
          ]}
          scroll={{ x: 1500 }}
        />
      </Card>
      <FilmForm filmInfo={filmInfo} setFilmInfo={setFilmInfo} refresh={refresh} />
    </>
  )
}

export default FilmList
