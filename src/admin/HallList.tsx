import { Button, Card, DatePicker, message, Select } from 'antd'
import React from 'react'
import { useRequest } from 'ahooks'
import { ajax } from './ajax'
import './HallList.less'
import moment from 'moment'
const colorList = ['magenta', 'red', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple']
const formatTime = (start: number) =>
  `${String(Math.floor(start / 60) % 24).padStart(2, '0')}:${String(start % 60).padStart(2, '0')}`
const filmMap = new Map<
  number,
  {
    fName: string
    fid: number
    filmlong: number
    price: number
    rank: number
  }
>()
interface IProp {}
type IPlay = { pid: number; fid: number; time: number; hid: number }
const HallList: React.FC<IProp> = () => {
  const dateFormat = 'YYYY-MM-DD' // 定义日期输出格式
  const [selectedCid, setCid] = React.useState<number>(0)
  const [selectedDate, setDate] = React.useState<string>(moment().format(dateFormat))
  const [playList, setPlayList] = React.useState<IPlay[]>([])

  const { data: hallInfo } = useRequest(ajax.get('/hall'), {
    onSuccess(res) {
      setCid((res[0] || {}).cid || 0)
    },
  })
  const { run: getPlay } = useRequest(ajax.get('/play'), {
    manual: true,
    onSuccess(res) {
      setPlayList(res)
    },
  })
  const { data: filmList } = useRequest(ajax.get('/filmBoxofficeTop10'), {
    onSuccess(data) {
      data.map(info => filmMap.set(info.fid, info))
    },
  })

  const { run: save } = useRequest(ajax.post('/play'), {
    manual: true,
    onSuccess() {
      getPlay(`cid=${selectedCid}&date=${selectedDate}`)
      message.success('保存成功')
    },
  })

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

      playMove.innerHTML = target.innerHTML // 把移动的元素
      playMove.className = target.className //
      const cardInfo: any = playMove.getElementsByClassName('info')[0] || {}
      style.cssText = target.style.cssText
      style.left = '0'
      style.width = target.clientWidth + 'px'
      style.transform = `translate(${clientX - layerX}px, ${clientY - layerY}px)`
      const newPlay: IPlay = {
        pid: Number(target.dataset.pid ?? -Math.ceil(Math.random() * 100000)),
        fid: filmInfo.fid,
        time: 0,
        hid: 0,
      }
      if (target.dataset.pid) {
        target.style.display = 'none'
      }
      const playHallListInfo: {
        top: number
        left: number
        width: number
        height: number
        hid: number
        freeTime: number
      }[] = [...(document.getElementsByClassName('playHallList') as any)].map(
        ({ offsetTop, offsetLeft, clientWidth, clientHeight, dataset }) => ({
          top: offsetTop,
          left: offsetLeft,
          width: clientWidth,
          height: clientHeight,
          hid: Number(dataset.hid),
          freeTime: Number(dataset.capacity) / 2,
        })
      )
      const move = (playListMap: Map<number, IPlay>, freeTime: number) => {
        const newPlayEndTime = filmInfo.filmlong + freeTime + newPlay.time
        let pTime = 0
        ;[...playListMap.values()]
          .filter(({ pid, hid: oldHid }) => newPlay.hid === oldHid && pid !== newPlay.pid)
          .sort((a, b) => a.time - b.time)
          .forEach(({ time, fid, pid }) => {
            const filmlong = filmMap.get(fid).filmlong
            const nowTime = Math.max(time, pTime)
            const endTime = nowTime + filmlong + freeTime
            if (time !== nowTime) {
              playListMap.get(pid).time = nowTime
            }
            // console.log(newPlay.time, endTime, newPlayEndTime, nowTime)
            if (newPlay.time > endTime || newPlayEndTime < nowTime) {
              pTime = Math.ceil(endTime / 5) * 5
            } else {
              const newStartTime = Math.ceil(newPlayEndTime / 5) * 5
              playListMap.get(pid).time = newStartTime
              pTime = Math.ceil((newStartTime + filmlong + freeTime) / 5) * 5
            }
          })
      }
      window.onmousemove = e => {
        const playListMap = new Map<number, IPlay>()
        playList.map(({ pid, ...item }) => playListMap.set(pid, { pid, ...item }))
        let x = e.clientX - layerX
        let y = e.clientY - layerY
        cardInfo.style.display = 'none'
        cardInfo.innerHTML = ''
        newPlay.hid = 0
        playHallListInfo.some(({ top, height, left, width, hid, freeTime }) => {
          if (y > top - height / 2 && y < top + height / 2) {
            newPlay.hid = hid
            y = top
            const startTimeMins = Math.max(
              0,
              Math.min(Math.round((((x - left) / width) * 960) / 5) * 5, 960 - Math.ceil(filmInfo.filmlong / 5) * 5) //  math.round() 方法可把一个数字舍入为最接近的整数。math.ceil() 方法可对一个数进行上舍入。
            )
            x = left + (startTimeMins * width) / 960
            cardInfo.style.display = 'block'
            cardInfo.innerHTML = `${formatTime(startTimeMins + 480)}-${formatTime(
              startTimeMins + 480 + filmInfo.filmlong
            )}`
            newPlay.time = 480 + startTimeMins
            move(playListMap, freeTime)
            return true
          }
        })
        setPlayList([...playListMap.values()])
        style.transform = `translate(${x}px, ${y}px)`
      }
      window.onmouseup = () => {
        //  鼠标放开时，电影卡片样式消失（电影卡片消失）
        window.onmousemove = null
        window.onmouseup = null
        style.display = 'none'
        const playListMap = new Map<number, IPlay>()
        playList.map(({ pid, ...item }) => playListMap.set(pid, { pid, ...item }))
        move(playListMap, playHallListInfo.find(({ hid }) => newPlay.hid === hid).freeTime)
        const newPlayList = [...playListMap.values()].filter(
          ({ pid, time, fid }) => pid !== newPlay.pid && time + filmMap.get(fid).filmlong - 480 <= 960
        )
        if (newPlay.hid) {
          newPlayList.push(newPlay)
        }
        setPlayList(newPlayList)
        target.style.display = 'block'
      }
    }
  }, [filmList, playList])

  return (
    <div id="play">
      <Card title="放映厅排片">
        <div id="filter" className="space-between">
          <div>
            <div style={{ width: '80px' }}>电影院：</div>
            <Select value={selectedCid} style={{ width: '90%' }} onChange={setCid}>
              {hallInfo?.map(({ cid, cName }, index) => (
                <Select.Option key={index} value={cid}>
                  {cName}
                </Select.Option>
              ))}
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
                setDate(e.format(dateFormat)) // setDate()回调函数
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
              style={{ width: (filmlong / 960) * 100 + '%' }} // 时间轴长为960分钟，电影卡片宽度取决于电影时长/960时间横轴的占比百分几
              data-filmindex={rank} // 排名赋值给
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
        style={{ marginTop: '20px', position: 'unset', overflow: 'hidden' }}
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
        {(((hallInfo || []).find(({ cid }) => cid === selectedCid) || {}).halls || []).map(
          ({ capacity, hName, price, hid }) => (
            <div className="playHallList" key={hid} data-hid={hid} data-capacity={capacity}>
              <h1>
                {hName}（容量：{capacity}人，每次间隔至少{capacity / 2}分钟，票价浮动：{price * 10}%）
              </h1>
              {playList
                .filter(({ hid: playHid }) => hid === playHid)
                .map(({ pid, fid, time }) => {
                  const filmInfo = filmList.find(({ fid: findFid }) => fid === findFid)
                  const isDel = time + filmInfo.filmlong - 480 > 960
                  return (
                    <div
                      key={pid}
                      className={`ant-tag-${colorList[filmInfo.rank]} filmCard`}
                      style={{
                        width: (filmInfo.filmlong / 960) * 100 + '%',
                        left: ((time - 480) * 100) / 960 + '%',
                        filter: `grayscale(${Number(isDel)}00%)`,
                        opacity: isDel ? '0.6' : '1',
                      }}
                      data-filmindex={filmInfo.rank}
                      data-pid={pid}
                    >
                      <div className="pid">
                        <div>{pid < 0 ? 'New' : pid}</div>
                        <div>{filmInfo.filmlong}mins</div>
                      </div>
                      <div className="fName">{filmInfo.fName}</div>
                      <div className="info">
                        {formatTime(time)}-{formatTime(time + filmInfo.filmlong)}
                      </div>
                    </div>
                  )
                })}
            </div>
          )
        )}
        <div style={{ width: '100%', textAlign: 'right' }}>
          <Button
            type="primary"
            onClick={() => {
              save(playList, `cid=${selectedCid}&date=${selectedDate}`)
            }}
          >
            保存
          </Button>
        </div>
      </Card>
      <div id="playMove" />
    </div>
  )
}

export default HallList
