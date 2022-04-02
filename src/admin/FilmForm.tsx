import { useRequest } from 'ahooks'
import moment from 'moment'
import { Form, Input, Rate, Modal, DatePicker, InputNumber } from 'antd'
import React from 'react'
import { ajax } from './ajax'
interface IProp {
  filmInfo: any
  setFilmInfo: React.Dispatch<any>
}
const FilmForm: React.FC<IProp> = ({ filmInfo, setFilmInfo }) => {
  const [form] = Form.useForm()
  React.useEffect(() => {
    if (filmInfo?.fid) {
      filmInfo.releaseTime = moment(filmInfo.releaseTime, 'YYYY-MM-DD hh-mm-ss')
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
      <Form form={form} onFinish={obj => console.log(obj)}>
        <Form.Item label="电影名称" name="fName">
          <Input />
        </Form.Item>
        <Form.Item label=" " name="fid" hidden>
          <Input />
        </Form.Item>
        <Form.Item label="评分" name="score">
          <Rate />
        </Form.Item>
        <Form.Item label="上映时间" name="releaseTime">
          <DatePicker />
        </Form.Item>
        <Form.Item label="基础价格" name="price">
          <InputNumber />
        </Form.Item>
        <Form.Item label="电影简介" name="introduce">
          <Input />
        </Form.Item>
        <Form.Item label="电影海报" name="fImage">
          <Input />
        </Form.Item>
        <Form.Item label="电影类型" name="type">
          <Input />
        </Form.Item>
        <Form.Item label="电影票房" name="totalBoxoffice">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default FilmForm
