const fs = require('fs')
const list = []
for (const fname of fs.readdirSync('data')) {
  if (/^\d+/.test(fname)) {
    const data = JSON.parse(fs.readFileSync('data/' + fname)).data?.returnValue ?? {}
    list.push(data)
    console.log(
      `INSERT IGNORE INTO film(fName, fid, score, filmlong, releaseTime, price, introduce,fImage,actor,type,totalBoxoffice) VALUES ('${
        data.showName
      }','${data.id}','${data.remark * 10}','${data.duration || 0}','${data.openDay}','${data.minSeatPrice}','${
        data.description
      }','https://gw.alicdn.com/${data.poster}_200x200Q100.jpg','${JSON.stringify(
        (data.artistes.actor || []).map(function ({ artisteName, avatar }) {
          return { name: artisteName, headimg: 'https://gw.alicdn.com/' + avatar }
        })
      )}','${data.type}','${data.boxOfficeData?.totalBoxOffice ?? 0}');\n`
    )
  }
}
fs.writeFileSync('movie.json', JSON.stringify(list))
