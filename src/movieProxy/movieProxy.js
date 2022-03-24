const https = require('https');
const fs = require('fs');

https.createServer({
    cert: fs.readFileSync("t.hejianpeng.com.crt"),
    key: fs.readFileSync("t.hejianpeng.com.key")
}, (req, res) => {
    delete req.headers['accept-encoding']
    https.get({
        host: "203.119.169.69",
        path: req.url,
        headers: req.headers
    }, res2 => {


        res.writeHead(res2.statusCode, res2.headers)
        const body = []
        res2.on("data", c => {
            res.write(c)
            body.push(c)
        })
        res2.on("end", () => {
            res.end()
            const { searchParams } = new URL("http://t.tt" + req.url)
            const data = JSON.parse(searchParams.get("data"))
            if (data.dr) {
                data.dr = JSON.parse(data.dr)[0]
            }
            const str = String(Buffer.concat(body)).trim()
             const file = str.substring(searchParams.get("callback").length + 1, str.length - 1)
            switch (searchParams.get("api")) {
                case "mtop.film.life.aristotle.get":
                    const pageIndex = (data?.dr?.targetArgs?.pageIndex ?? "1")
                    switch (data.patternName) {
                        case 'outer_home_h5': fs.writeFileSync("data/list" + pageIndex + ".json", file); break
                        case "outer_soonshow_h5": fs.writeFileSync("data/list66" + pageIndex + ".json", file); break
                    }
                    break;
                case "mtop.film.MtopShowAPI.getExtendShowById":
                    fs.writeFileSync("data/" + data.showid + ".json", file); break
            }



        })
        //res2.pipe(res)
    })
}
).listen(443)