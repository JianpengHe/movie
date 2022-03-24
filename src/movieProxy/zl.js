const fs = require('fs');
const list = [];
for (const fname of fs.readdirSync("data")) {
    if (/^list\d+/.test(fname)) {
        const n = JSON.parse(fs.readFileSync("data/" + fname)).data?.nodes || []
        list.push(...((n[1] || n[0])?.nodes[0]?.nodes || []).map(({ data }) => data))
    }
}
fs.writeFileSync("list.json", JSON.stringify(list));

console.log(`(${String(function (list) {
    let i = list.length;
    const go = function () {
        i--;
        if (i < 0) { return }
        const dom = document.createElement("a");
        dom.href = "https://m.taopiaopiao.com/tickets/moviemain/pages/show-detail/index.html?showid=" + list[i];
        dom.target = 'new';
        dom.click();
        setTimeout(go, 3000)
    }
    go();
})})(${JSON.stringify(list.map(({ id }) => id))});`)

