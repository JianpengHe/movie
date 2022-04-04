import { Button, Card, DatePicker, Form, Input, message, Select } from 'antd'
import React from 'react'
import { useRequest } from 'ahooks'
import { ajax } from './ajax'
import './HallList.less'
import moment from 'moment'
const colorList = ['magenta', 'red', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple']
const formatTime = (start: number) =>
  `${String(Math.floor(start / 60)).padStart(2, '0')}:${String(start % 60).padStart(2, '0')}` //把开始时间取整
interface IProp {}
const HallList: React.FC<IProp> = () => {
  const dateFormat = 'YYYY-MM-DD' //定义日期输出格式
  const [selectedCid, setCid] = React.useState<number>(0)
  const [selectedDate, setDate] = React.useState<string>(moment().format(dateFormat)) //  获取格式化日期

  const { data: hallInfo } = useRequest(ajax.get('/hall'), {
    onSuccess(res) {
      setCid((res[0] || {}).cid || 0)
    },
  })

  const { run: getPlay, data: playList } = useRequest(ajax.get('/play'), {
    manual: true,
    onSuccess(res) {
      console.log(res)
    },
  })

  const { data: filmList } = useRequest(ajax.get('/filmBoxofficeTop10'))
  React.useEffect(() => {
    if (!selectedCid) {
      return
    }
    getPlay(`cid=${selectedCid}&date=${selectedDate}`)
  }, [selectedCid, selectedDate])
  React.useEffect(() => {
    if (!filmList) {
      return
    }
    ;(document.getElementById('play') as any).onmousedown = ({ target, layerX, layerY, clientX, clientY }) => {
      if ([...(target?.classList || [])].indexOf('filmCard') < 0) {
        return
      }
      const playMove = document.getElementById('playMove')
      const { style } = playMove
      const filmInfo = filmList[target.dataset.filmindex]

      playMove.innerHTML = target.innerHTML //把移动的元素
      playMove.className = target.className //
      const cardInfo: any = playMove.getElementsByClassName('info')[0] || {}
      style.cssText = target.style.cssText
      style.width = target.clientWidth + 'px'
      style.transform = `translate(${clientX - layerX}px, ${clientY - layerY}px)` //这个坐标是当前被拖拽标签左上角相对浏览器原点的坐标
      const playHallListInfo: { top: number; left: number; width: number; height: number }[] = [
        ...(document.getElementsByClassName('playHallList') as any), //  排片轨道
      ].map(({ offsetTop, offsetLeft, clientWidth, clientHeight }) => ({
        top: offsetTop,
        left: offsetLeft,
        width: clientWidth,
        height: clientHeight,
      }))

      window.onmousemove = e => {
        //鼠标移动源标签时
        let x = e.clientX - layerX //这个被拖拽元素x轴的真实坐标是浏览器x轴坐标-该元素所在标签的x轴坐标
        let y = e.clientY - layerY //这个被拖拽元素y轴的真实坐标是浏览器y轴坐标-该元素所在标签的y轴坐标
        cardInfo.style.display = 'none'
        cardInfo.innerHTML = ''
        playHallListInfo.some(({ top, height, left, width }) => {
          if (y > top - height / 2 && y < top + height / 2) {
            y = top
            // if (x > left && x < left + width) {
            const startTimeMins = Math.max(
              0,
              Math.min(Math.round((((x - left) / width) * 960) / 5) * 5, 960 - Math.ceil(filmInfo.filmlong / 5) * 5) //  math.round() 方法可把一个数字舍入为最接近的整数。math.ceil() 方法可对一个数进行上舍入。
            )
            console.log(startTimeMins)
            cardInfo.style.display = 'block'
            cardInfo.innerHTML = `${formatTime(startTimeMins + 480)}-${formatTime(
              startTimeMins + 480 + filmInfo.filmlong
            )}`
            x = left + (startTimeMins * width) / 960
            // }
            return true
          }
        })
        style.transform = `translate(${x}px, ${y}px)`
      }
      window.onmouseup = () => {
        //  鼠标放开时，电影卡片样式消失（电影卡片消失）
        window.onmousemove = null
        window.onmouseup = null
        style.display = 'none'
      }
    }
  }, [filmList])
  return (
    <div id="play">
      <Card title="放映厅排片">
        <div id="filter" className="space-between">
          <div>
            <div style={{ width: '80px' }}>电影院：</div>
            <Select
              value={selectedCid} //  选择影院列表默认是已选择的
              style={{ width: '90%' }} //  列表宽度是90%
              onChange={e => {
                // 当源元素改变时，重新指向新的cid
                setCid(e)
              }}
            >
              {hallInfo?.map(
                (
                  { cid, cName },
                  index //  显示影院选择列表
                ) => (
                  <Select.Option key={index} value={cid}>
                    {cName}
                  </Select.Option>
                )
              )}
            </Select>
          </div>
          <div>
            <div style={{ width: '80px' }}>日期：</div>
            <DatePicker
              allowClear={false}
              defaultValue={moment()} //  moment()不带参数表示默认当前日期（今天日期）
              style={{ width: '90%' }}
              onChange={e => {
                //  当选择的时间改变时，让新的时间格式设置成预定好的时间格式
                setDate(e.format(dateFormat)) //setDate()回调函数
              }}
            />
          </div>
          <div>
            <Button type="primary">一键排期</Button>
          </div>
        </div>
        <div className="filmPool">
          {filmList?.map(({ fName, filmlong, rank }) => (
            <div
              key={rank}
              className={`ant-tag-${colorList[rank]} filmCard`}
              style={{ width: (filmlong / 960) * 100 + '%' }} //时间轴长为960分钟，电影卡片宽度取决于电影时长/960时间横轴的占比百分几
              data-filmindex={rank} //排名赋值给
            >
              <div className="pid">
                <div>{rank + 1}</div>
                <div>{filmlong}mins</div>
              </div>
              <div className="fName">{fName}</div>
              <div className="info" style={{ display: 'none' }} />
            </div>
          ))}
        </div>
      </Card>
      <Card
        style={{ marginTop: '20px', position: 'unset' }}
        title={
          <div className="space-between playTime">
            {Array(16) //  把时间轴分成16段填满，fill() 方法用于将一个固定值替换数组的元素。
              .fill(0)
              .map((_, index) => (
                <div key={index}>{index + 8}:00</div> // 电影时间轴从8点开始
              ))}
          </div>
        }
      >
        <div className="playHallList">
          <div
            className={`ant-tag-${colorList[1]} filmCard`}
            style={{ width: (120 / 960) * 100 + '%' }}
            data-filmindex="1"
          >
            <div className="pid">
              <div>56456</div>
              <div>100mins</div>
            </div>
            <div className="fName">jirg</div>
            <div className="info">12:00-14:00</div>
          </div>
          <div
            className={`ant-tag-${colorList[1]} filmCard`}
            style={{ width: (120 / 960) * 100 + '%' }}
            data-filmindex="1"
          >
            <div className="pid">
              <div>56456</div>
              <div>100mins</div>
            </div>
            <div className="fName">jirg</div>
            <div className="info">12:00-14:00</div>
          </div>
        </div>
        <div className="playHallList">
          <div
            className={`ant-tag-${colorList[1]} filmCard`}
            style={{ width: (120 / 960) * 100 + '%' }}
            data-filmindex="1"
          >
            <div className="pid">
              <div>56456</div>
              <div>100mins</div>
            </div>
            <div className="fName">jirg</div>
            <div className="info">12:00-14:00</div>
          </div>
          <div
            className={`ant-tag-${colorList[1]} filmCard`}
            style={{ width: (120 / 960) * 100 + '%' }}
            data-filmindex="1"
          >
            <div className="pid">
              <div>56456</div>
              <div>100mins</div>
            </div>
            <div className="fName">jirg</div>
            <div className="info">12:00-14:00</div>
          </div>
        </div>
      </Card>
      <div id="playMove" />
    </div>
  )
}

export default HallList
