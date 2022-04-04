import { useRequest } from 'ahooks'
import moment from 'moment'
import { Form, Input, Rate, Modal, DatePicker, InputNumber, Radio, message } from 'antd'
import React from 'react'
import { ajax } from './ajax'
interface IProp {
  userInfo: any
  setUserInfo: React.Dispatch<any>
  refresh: () => void
}

const UserForm: React.FC<IProp> = ({ userInfo, setUserInfo, refresh }) => {
  const [form] = Form.useForm()
  React.useEffect(() => {
    if (userInfo?.id) {
      form.setFieldsValue(userInfo)
    } else if (userInfo) {
      form.resetFields()
    }
  }, [userInfo])

  const { run } = useRequest(ajax.post('/user'), {
    manual: true,
    onSuccess(body) {
      if (body === '成功') {
        message.success('保存成功')
        setUserInfo(null)
        refresh()
      } else {
        message.error(body)
      }
    },
  })

  return (
    <Modal
      title={`${userInfo?.id ? '编辑' : '添加'}用户`}
      visible={Boolean(userInfo)}
      onCancel={() => setUserInfo(null)}
      onOk={() => form.submit()}
    >
      <Form form={form} onFinish={obj => run(obj)}>
        <Form.Item label="用户名" name="userName" rules={[{ required: true }]}>
          <Input placeholder="请输入用户名" />
        </Form.Item>
        <Form.Item label="用户密码" name="password">
          <Input.Password placeholder={`${userInfo?.id ? '如果不填则不修改' : '请输入'}密码`} />
        </Form.Item>
        <Form.Item label="性别" name="sex">
          <Radio.Group>
            <Radio value="男">男</Radio>
            <Radio value="女">女</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="用户邮箱" name="email" rules={[{ type: 'email' }]}>
          <Input type="email" placeholder="请输入邮箱" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UserForm
