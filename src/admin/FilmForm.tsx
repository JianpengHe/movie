import { useRequest } from 'ahooks'
import moment from 'moment'
import { Form, Input, Rate, Modal, DatePicker, InputNumber, Space, Button, Select, message } from 'antd'
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'
import React from 'react'
import { ajax } from './ajax'
interface IProp {
  filmInfo: any
  setFilmInfo: React.Dispatch<any>
  refresh: () => void
}
const FilmForm: React.FC<IProp> = ({ filmInfo, setFilmInfo, refresh }) => {
  const [form] = Form.useForm()
  const { run } = useRequest(ajax.post('/film'), {
    manual: true,
    onSuccess() {
      message.success('保存成功')
      refresh()
      setFilmInfo(null)
    },
  })
  React.useEffect(() => {
    if (filmInfo?.fid) {
      filmInfo.releaseTime = moment(filmInfo.releaseTime, 'YYYY-MM-DD hh-mm-ss')
      filmInfo.score /= 20
      filmInfo.price /= 100
      filmInfo.type = filmInfo.type.replace(/\s/g, '').split(',')
      form.setFieldsValue(filmInfo)
    } else if (filmInfo) {
      form.resetFields()
    }
  }, [filmInfo])

  return (
    <Modal
      title={`${filmInfo?.fid ? '编辑' : '上架'}电影`}
      visible={Boolean(filmInfo)}
      onCancel={() => setFilmInfo(null)}
      onOk={() => form.submit()}
    >
      <Form
        form={form}
        onFinish={obj => {
          obj.score *= 20
          obj.type = obj.type.join(',')
          obj.releaseTime = obj.releaseTime.format('YYYY-MM-DD hh-mm-ss')
          obj.price = Math.round(100 * obj.price)
          run(obj)
        }}
      >
        <Form.Item label="电影名称" name="fName">
          <Input />
        </Form.Item>
        <Form.Item label=" " name="fid" hidden>
          <Input />
        </Form.Item>
        <Form.Item label="评分" name="score">
          <Rate allowHalf />
        </Form.Item>
        <Form.Item label="上映时间" name="releaseTime">
          <DatePicker />
        </Form.Item>
        <Form.Item label="基础价格" name="price">
          <InputNumber prefix="￥" precision={2} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="电影简介" name="introduce">
          <Input />
        </Form.Item>
        <Form.Item label="电影海报" name="fImage">
          <Input />
        </Form.Item>
        <Form.Item label="演员">
          <Form.List name="actor">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} align="baseline">
                    <Form.Item {...restField} name={[name, 'name']} rules={[{ required: true }]}>
                      <Input placeholder="请输入演员名字" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'headimg']} rules={[{ required: true }]}>
                      <Input placeholder="请输入演员照片" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    增加演员
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>
        <Form.Item label="电影类型" name="type">
          <Select allowClear mode="multiple">
            {[
              '爱情',
              '剧情',
              '悬疑',
              '犯罪',
              '灾难',
              '科幻',
              '家庭',
              '奇幻',
              '冒险',
              '动作',
              '动画',
              '喜剧',
              '恐怖',
              '惊悚',
              '运动',
              '传记',
              '历史',
              '战争',
              '纪录片',
              '儿童',
              '音乐',
            ].map((type, index) => (
              <Select.Option key={index} value={type}>
                {type}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="电影票房" name="totalBoxoffice">
          <InputNumber prefix="￥" style={{ width: '100%' }} precision={0} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default FilmForm
