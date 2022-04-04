import React from 'react'
import { ajax } from './ajax'
import { useRequest } from 'ahooks'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, message, Popconfirm, Space, Table, Tag } from 'antd'
import UserForm from './UserForm'
interface IProp {}
const UserList: React.FC<IProp> = () => {
  const [userInfo, setUserInfo] = React.useState<any>(undefined)
  const { run, data, refresh } = useRequest(ajax.get('/user'), {
    // useRequest 是一个超级强大，且生产完备的网络请求 Hooks，useRequest 接收了一个 ajax请求。并自动管理 data 、run 等数据。data:请求返回的数据。run:执行请求,会自动捕获异常,通过下面配置的onError函数获取异常报错。
    manual: true, // 手动请求。一般需要手动触发，比如添加用户，编辑信息，删除用户等等。 useRequest 只需要配置 manual = true ，即可阻止初始化执行。只有触发 run 时才会开始执行。
    onError() {
      //  请求错误触发
      message.error('请求失败')
    },
    onSuccess(obj) {
      setFilter(obj)
    },
  })

  const [filter, setFilter] = React.useState<any[]>([])
  React.useEffect(() => {
    //  useEffect用于处理组件中的effect，通常用于请求数据，事件处理，订阅等相关操作useEffect 就是一个 Effect Hook，给函数组件增加了操作副作用的能力。useEffect()有两个参数，第一个参数是要执行的函数，第二个参数是一个依赖项数组(根据需求第二个参数可选是否填写)，根据数组里的变量是否变化决定是否执行函数
    run()
  }, []) //  若不写第二个参数，函数操作每次都会执行。有第二个参数但数组为空，即没有传入比较变化的变量，则比较结果永远都保持不变，那么副作用逻辑（run()）就只能执行一次。副作用仅在组件挂载和卸载时执行。useEffect( ()=>{doSomeThing}, [])

  return (
    <>
      <Card
        title="用户信息管理"
        extra={
          <Button icon={<PlusOutlined />} type="primary" onClick={() => setUserInfo({})}>
            添加用户
          </Button>
        }
      >
        <Form
          onFinish={({ id }) => {
            setFilter(data.filter(({ id: oldName }) => oldName.indexOf(id) >= 0))
          }}
          onReset={() => setFilter(data)}
          layout="inline"
        >
          <div className="space-between" style={{ marginBottom: '24px' }}>
            <div>
              <Form.Item label="用户编号" name="id">
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
          rowKey="id"
          dataSource={data}
          columns={[
            { title: '用户编号', dataIndex: 'id', key: 'id', align: 'center' },
            { title: '用户名', dataIndex: 'userName', key: 'userName', align: 'center' },
            {
              title: '用户密码',
              dataIndex: 'password',
              key: 'password',
              align: 'center',
              render() {
                return '******'
              },
            },
            { title: '用户性别', dataIndex: 'sex', key: 'sex', align: 'center' },
            {
              title: '用户邮箱',
              dataIndex: 'email',
              key: 'email',
              align: 'center',
            },
            {
              title: '操作',
              dataIndex: 'id',
              key: 'id',
              fixed: 'right',
              align: 'center',
              width: 120,
              render(id, info) {
                return (
                  <Space>
                    <Button type="primary" size="small" onClick={() => setUserInfo({ ...info })}>
                      编辑
                    </Button>
                    <Popconfirm
                      placement="topRight"
                      title="是否确定删除"
                      onConfirm={() => {
                        // delect('id=' + id)
                      }}
                    >
                      <Button type="primary" danger size="small">
                        删除
                      </Button>
                    </Popconfirm>
                  </Space> // onConfirm是点击确认的回调（确认之后执行什么） placement是气泡框位置
                )
              },
            },
          ]}
        />
      </Card>
      <UserForm userInfo={userInfo} setUserInfo={setUserInfo} refresh={refresh} />
    </>
  )
}

export default UserList
