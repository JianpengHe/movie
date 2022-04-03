import { useRequest } from 'ahooks'
import moment from 'moment'
import { Form, Input, Rate, Modal, DatePicker, InputNumber, Radio } from 'antd'
import React from 'react'
import { ajax } from './ajax'
interface IProp {
  userInfo: any
  setUserInfo: React.Dispatch<any>
}

const UserForm: React.FC<IProp> = ({ userInfo, setUserInfo }) => {
  const [form] = Form.useForm()
  React.useEffect(() => {
    if (userInfo?.id) {
      form.setFieldsValue(userInfo)
    } else if (userInfo) {
      form.resetFields()
    }
  }, [userInfo])

  return (
    <Modal
      title={`${userInfo?.id ? '编辑' : '添加'}用户`}
      visible={Boolean(userInfo)}
      onCancel={() => setUserInfo(null)}
      onOk={() => form.submit()}
    >
      <Form form={form} onFinish={obj => console.log(obj)}>
        <Form.Item label="用户名" name="userName">
          <Input placeholder="请输入用户名" />
        </Form.Item>
        <Form.Item label="用户密码" name="password">
          <Input placeholder={`${userInfo?.id ? '如果不填则不修改' : '请输入'}密码`} />
        </Form.Item>
        <Form.Item label="性别" name="sex">
          <Radio.Group>
            <Radio value="男">男</Radio>
            <Radio value="女">女</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="用户邮箱" name="email">
          <Input placeholder="请输入邮箱" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UserForm
