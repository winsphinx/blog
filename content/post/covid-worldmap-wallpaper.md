+++
title = "COVID Worldmap Wallpaper"
date = 2020-03-23T21:27:00+08:00
lastmod = 2021-10-23T18:19:01+08:00
tags = ["COVID-19", "Python"]
categories = ["技术"]
draft = false
+++

新冠来袭，肆虐全球，生灵涂炭。余心系天下，试将其地图做壁纸，时时观之，扼腕叹息。

<!--more-->


## 设计 {#设计}

-   使用 urllib 爬取网站。
-   使用 pandas 处理数据。
-   使用 matplotlib 作图。
-   使用 pyecharts 地图可视化。
-   使用 pillow 处理图像。
-   使用 pywin32 处理 Windows 注册表。


## 依赖 {#依赖}

```text
cycler
Jinja2
kiwisolver
MarkupSafe
matplotlib
numpy
pandas
Pillow
prettytable
pyecharts
pyparsing
python-dateutil
pytz
pywin32
simplejson
six
snapshot-phantomjs
```


## 代码 {#代码}

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import random
import tempfile
import time

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import requests
import win32api
import win32con
import win32gui
from PIL import Image
from pyecharts import options as opts
from pyecharts.charts import Map
from pyecharts.render import make_snapshot
from snapshot_phantomjs import snapshot
from pyecharts.globals import ThemeType

URL = "https://lab.isaaclin.cn/nCoV/api/area"

MAP = {
    "不丹": "Bhutan",
    "东帝汶": "Timor-Leste",
    "东萨摩亚(美)": "Samoa Eastern",
    "中国": "China",
    "中非共和国": "Central African Rep.",
    "丹麦": "Denmark",
    "乌克兰": "Ukraine",
    "乌兹别克斯坦": "Uzbekistan",
    "乌干达": "Uganda",
    "乌拉圭": "Uruguay",
    "乍得": "Chad",
    "也门共和国": "Yemen",
    "亚美尼亚": "Armenia",
    "以色列": "Israel",
    "伊拉克": "Iraq",
    "伊朗": "Iran",
    "伯利兹": "Belize",
    "俄罗斯": "Russia",
    "保加利亚": "Bulgaria",
    "克罗地亚": "Croatia",
    "关岛": "Guam",
    "冈比亚": "Gambia",
    "冰岛": "Iceland",
    "几内亚": "Guinea",
    "几内亚比绍": "Guinea-Bissau",
    "列支敦士登": "Liechtenstein",
    "刚果（布）": "Congo",
    "刚果（金）": "Dem. Rep. Congo",
    "利比亚": "Libya",
    "利比里亚": "Liberia",
    "加拿大": "Canada",
    "加纳": "Ghana",
    "加蓬": "Gabon",
    "匈牙利": "Hungary",
    "北爱尔兰": "Northern Ireland",
    "北马其顿": "Macedonia",
    "南苏丹": "S. Sudan",
    "南非": "South Africa",
    "博茨瓦纳": "Botswana",
    "卡塔尔": "Qatar",
    "卢旺达": "Rwanda",
    "卢森堡": "Luxembourg",
    "印度": "India",
    "印度尼西亚": "Indonesia",
    "危地马拉": "Guatemala",
    "厄瓜多尔": "Ecuador",
    "厄立特里亚": "Eritrea",
    "叙利亚": "Syria",
    "古巴": "Cuba",
    "吉尔吉斯斯坦": "Kyrgyzstan",
    "吉布提": "Djibouti",
    "哈萨克斯坦": "Kazakhstan",
    "哥伦比亚": "Colombia",
    "哥斯达黎加": "Costa Rica",
    "喀麦隆": "Cameroon",
    "土库曼斯坦": "Turkmenistan",
    "土耳其": "Turkey",
    "圣卢西亚": "St.Lucia",
    "圣多美和普林西比": "Sao Tome and Principe",
    "圣巴泰勒米": "Saint Barthelemy",
    "圣文森特": "St.Vincent",
    "圣文森特和格林纳丁斯": "Saint Vincent and the Grenadines",
    "圣文森特岛": "Saint Vincent",
    "圣马丁岛": "Sint Maarten",
    "圣马力诺": "San Marino",
    "圭亚那": "Guyana",
    "坦桑尼亚": "Tanzania",
    "埃及": "Egypt",
    "埃塞俄比亚": "Ethiopia",
    "塔吉克斯坦": "Tajikistan",
    "塞内加尔": "Senegal",
    "塞尔维亚": "Serbia",
    "塞拉利昂": "Sierra Leone",
    "塞浦路斯": "Cyprus",
    "塞舌尔": "Seychelles",
    "墨西哥": "Mexico",
    "多哥": "Togo",
    "多米尼克": "Dominica",
    "多米尼加": "Dominican Rep.",
    "奥地利": "Austria",
    "委内瑞拉": "Venezuela",
    "孟加拉国": "Bangladesh",
    "安哥拉": "Angola",
    "安圭拉岛": "Anguilla",
    "安提瓜和巴布达": "Antigua and Barbuda",
    "安道尔": "Andorra",
    "安道尔共和国": "Andorra",
    "尼加拉瓜": "Nicaragua",
    "尼日利亚": "Nigeria",
    "尼日尔": "Niger",
    "尼泊尔": "Nepal",
    "巴勒斯坦": "Palestine",
    "巴哈马": "Bahamas",
    "巴基斯坦": "Pakistan",
    "巴巴多斯": "Barbados",
    "巴布亚新几内亚": "Papua New Guinea",
    "巴拉圭": "Paraguay",
    "巴拿马": "Panama",
    "巴林": "Bahrain",
    "巴西": "Brazil",
    "布基纳法索": "Burkina Faso",
    "布隆迪共和国": "Burundi",
    "希腊": "Greece",
    "库克群岛": "Cook Is",
    "开曼群岛": "Cayman Is",
    "德国": "Germany",
    "意大利": "Italy",
    "所罗门群岛": "Solomon Is",
    "扎伊尔": "Zaire",
    "拉脱维亚": "Latvia",
    "挪威": "Norway",
    "捷克": "Czech Rep.",
    "摩尔多瓦": "Moldova",
    "摩洛哥": "Morocco",
    "摩纳哥": "Monaco",
    "文莱": "Brunei",
    "斐济": "Fiji",
    "斯威士兰": "Swaziland",
    "斯洛伐克": "Slovakia",
    "斯洛文尼亚": "Slovenia",
    "斯里兰卡": "Sri Lanka",
    "新加坡": "Singapore",
    "新西兰": "New Zealand",
    "日本": "Japan",
    "智利": "Chile",
    "朝鲜": "North Korea",
    "柬埔寨": "Cambodia",
    "根西岛": "Guernsey",
    "格林纳达": "Grenada",
    "格陵兰": "Greenland",
    "格鲁吉亚": "Georgia",
    "梵蒂冈": "Status Civitatis Vaticanae",
    "比利时": "Belgium",
    "毛里塔尼亚": "Mauritania",
    "毛里求斯": "Mauritius",
    "汤加": "Tonga",
    "沙特阿拉伯": "Saudi Arabia",
    "法国": "France",
    "法属圭亚那": "French Guiana",
    "法属玻利尼西亚": "French Polynesia",
    "法罗群岛": "Faroe",
    "波兰": "Poland",
    "波多黎各": "Puerto Rico",
    "波黑": "Bosnia and Herz.",
    "泰国": "Thailand",
    "泽西岛": "Bailiwick of Jersey",
    "津巴布韦": "Zimbabwe",
    "洪都拉斯": "Honduras",
    "海地": "Haiti",
    "澳大利亚": "Australia",
    "爱尔兰": "Ireland",
    "爱沙尼亚": "Estonia",
    "牙买加": "Jamaica",
    "特立尼达和多巴哥": "Trinidad and Tobago",
    "玻利维亚": "Bolivia",
    "瑙鲁": "Nauru",
    "瑞典": "Sweden",
    "瑞士": "Switzerland",
    "留尼旺": "Reunion",
    "白俄罗斯": "Belarus",
    "百慕大群岛": "Bermuda Is",
    "直布罗陀": "Gibraltar",
    "科威特": "Kuwait",
    "科特迪瓦": "Côte d'Ivoire",
    "秘鲁": "Peru",
    "突尼斯": "Tunisia",
    "立陶宛": "Lithuania",
    "索马里": "Somalia",
    "约旦": "Jordan",
    "纳米比亚": "Namibia",
    "缅甸": "Myanmar",
    "罗马尼亚": "Romania",
    "美国": "United States",
    "老挝": "Lao PDR",
    "肯尼亚": "Kenya",
    "至尊公主邮轮": "Grand Princess",
    "芬兰": "Finland",
    "苏丹": "Sudan",
    "苏里南": "Suriname",
    "英国": "United Kingdom",
    "荷兰": "Netherlands",
    "荷属安的列斯": "Netheriands Antilles",
    "莫桑比克": "Mozambique",
    "莱索托": "Lesotho",
    "菲律宾": "Philippines",
    "萨尔瓦多": "El Salvador",
    "葡萄牙": "Portugal",
    "蒙古": "Mongolia",
    "蒙特塞拉特岛": "Montserrat Is",
    "西班牙": "Spain",
    "西萨摩亚": "Samoa Western",
    "贝宁": "Benin",
    "赞比亚共和国": "Zambia",
    "赤道几内亚": "Eq. Guinea",
    "越南": "Vietnam",
    "钻石公主号邮轮": "Diamond Princess Cruise Ship",
    "阿塞拜疆": "Azerbaijan",
    "阿富汗": "Afghanistan",
    "阿尔及利亚": "Algeria",
    "阿尔巴尼亚": "Albania",
    "阿拉伯联合酋长国": "United Arab Emirates",
    "阿曼": "Oman",
    "阿根廷": "Argentina",
    "阿森松": "Ascension",
    "阿联酋": "United Arab Emirates",
    "韩国": "Korea",
    "马尔代夫": "Maldives",
    "马拉维": "Malawi",
    "马提尼克": "Martinique",
    "马来西亚": "Malaysia",
    "马耳他": "Malta",
    "马达加斯加": "Madagascar",
    "马里": "Mali",
    "马里亚那群岛": "Mariana Is",
    "黎巴嫩": "Lebanon",
    "黑山": "Montenegro",
}


def get_data(url, place):
    data = requests.get(url).json()

    p = pd.json_normalize(data["results"])[[
        "countryName",
        "provinceShortName",
        "currentConfirmedCount",
        "confirmedCount",
        "deadCount",
        "curedCount",
    ]]
    p = p.rename(
        columns={
            "countryName": "country",
            "provinceShortName": "province",
            "currentConfirmedCount": "现存确诊",
            "confirmedCount": "累计确诊",
            "deadCount": "累计死亡",
            "curedCount": "累计治愈",
        })

    if place == "country":
        p = p[p["country"] == p["province"]]
        p.drop(["province"], axis=1, inplace=True)
    elif place == "province":
        p = p[p["country"] != p["province"]]
        p.drop(["country"], axis=1, inplace=True)

    return p.groupby(
        place,
        as_index=False,
    ).sum().sort_values(
        by=["累计确诊"],
        ascending=False,
    )


def make_plot(data, place):
    if place == "country":
        t = "全球累计确诊 TOP-N\n(累计确诊 = 现存确诊 + 累计死亡 + 累计治愈)"
        data = data[[
            "country",
            "现存确诊",
            "累计死亡",
            "累计治愈",
        ]]
    elif place == "province":
        t = "全国现存确诊 TOP-N\n"
        data = data[[
            "province",
            "现存确诊",
        ]].sort_values(
            by=["现存确诊"],
            ascending=False,
        )

    plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]
    plt.style.use("dark_background")

    ax = data[:15].plot(
        kind="barh",
        x=place,
        title=t,
        stacked=True,
        grid=True,
        color=["#0fc0fc", "#ff1a1a", "#00b300"],
    )
    ax.xaxis.tick_top()
    ax.set_ylabel("")
    ax.invert_yaxis()
    ax.set_facecolor("#293441")

    # plt.xticks(rotation=15)
    plt.savefig(
        os.path.join(tempfile.gettempdir(), "plot.png"),
        bbox_inches="tight",
        facecolor="#293441",
    )


def make_map(data, place):
    w = win32api.GetSystemMetrics(win32con.SM_CXSCREEN)
    h = win32api.GetSystemMetrics(win32con.SM_CYSCREEN)

    if place == "country":
        s = "world"
        t = "COVID-19 全球现存确诊分布"
    elif place == "province":
        s = "china"
        t = "COVID-19 全国现存确诊分布"

    x = [MAP[i] if i in MAP else i for i in data[place].tolist()]
    y = [np.log10(i) if i > 0 else i for i in np.array(data["现存确诊"].tolist())]

    m = Map(init_opts=opts.InitOpts(
        width=str(w // 2) + "px",
        height=str(h // 2) + "px",
        theme=ThemeType.CHALK,
    )).add(
        series_name="",
        data_pair=[list(z) for z in zip(x, y)],
        maptype=s,
        is_map_symbol_show=False,
    ).set_series_opts(label_opts=opts.LabelOpts(
        is_show=False)).set_global_opts(
            title_opts=opts.TitleOpts(
                title=t,
                subtitle=time.strftime("%Y-%m-%d %H:00",
                                       time.localtime(time.time())),
                pos_left="center",
            ),
            visualmap_opts=opts.VisualMapOpts(
                is_show=False,
                max_=max(y),
            ),
            tooltip_opts=opts.TooltipOpts(is_show=False),
            legend_opts=opts.LegendOpts(is_show=False),
        )

    make_snapshot(
        snapshot,
        m.render(),
        os.path.join(tempfile.gettempdir(), "map.png"),
        is_remove_html=True,
    )


def make_wallpaper():
    m = Image.open(os.path.join(tempfile.gettempdir(), "map.png"))
    x, y = m.size
    p = Image.open(os.path.join(tempfile.gettempdir(), "plot.png")).resize(
        (x // 4, y // 3),
        Image.ANTIALIAS,
    )

    n = Image.new("RGBA", m.size, (240, 240, 240))
    n.paste(m, (0, 0, x, y), m)
    n.paste(p, (0, y - y // 3 - 50, x // 4, y - 50))
    n.save(os.path.join(tempfile.gettempdir(), "wallpaper.png"))


def set_wallpaper():
    k = win32api.RegOpenKeyEx(
        win32con.HKEY_CURRENT_USER,
        "Control Panel\\Desktop",
        0,
        win32con.KEY_SET_VALUE,
    )
    win32api.RegSetValueEx(k, "WallpaperStyle", 0, win32con.REG_SZ, "2")
    win32api.RegSetValueEx(k, "TileWallpaper", 0, win32con.REG_SZ, "0")
    win32gui.SystemParametersInfo(
        win32con.SPI_SETDESKWALLPAPER,
        os.path.join(tempfile.gettempdir(), "wallpaper.png"),
        win32con.SPIF_SENDWININICHANGE,
    )


def main():
    ch = random.choice(["country", "province"])
    data = get_data(URL, ch)

    make_plot(data, ch)
    make_map(data, ch)

    make_wallpaper()
    set_wallpaper()


if __name__ == "__main__":
    main()
```


## 更新 {#更新}

补记[^1]：
[^1]: 数据来自 [datasets/covid-19](https://github.com/datasets/covid-19/blob/master/data/worldwide-aggregate.csv)

| 日期  | 全球确诊病例（万人） | 间隔天数 |
|-----|------------|------|
| 4.2   | 100        | -    |
| 4.15  | 200        | 13   |
| 4.27  | 300        | 12   |
| 5.9   | 400        | 12   |
| 5.20  | 500        | 11   |
| 5.30  | 600        | 10   |
| 6.7   | 700        | 8    |
| 6.15  | 800        | 8    |
| 6.22  | 900        | 7    |
| 6.28  | 1000       | 6    |
| 7.3   | 1100       | 5    |
| 7.8   | 1200       | 5    |
| 7.13  | 1300       | 5    |
| 7.17  | 1400       | 4    |
| 7.22  | 1500       | 5    |
| 7.25  | 1600       | 3    |
| 7.29  | 1700       | 4    |
| 8.2   | 1800       | 4    |
| 8.6   | 1900       | 4    |
| 8.10  | 2000       | 4    |
| 8.14  | 2100       | 4    |
| 8.18  | 2200       | 4    |
| 8.22  | 2300       | 4    |
| 8.26  | 2400       | 4    |
| 8.30  | 2500       | 4    |
| 9.2   | 2600       | 3    |
| 9.6   | 2700       | 4    |
| 9.10  | 2800       | 4    |
| 9.14  | 2900       | 4    |
| 9.17  | 3000       | 3    |
| 9.20  | 3100       | 3    |
| 9.24  | 3200       | 4    |
| 9.27  | 3300       | 3    |
| 10.1  | 3400       | 4    |
| 10.4  | 3500       | 3    |
| 10.7  | 3600       | 3    |
| 10.10 | 3700       | 3    |
| 10.13 | 3800       | 3    |
| 10.16 | 3900       | 3    |
| 10.19 | 4000       | 3    |
| 10.21 | 4100       | 2    |
| 10.23 | 4200       | 2    |
| 10.26 | 4300       | 3    |
| 10.28 | 4400       | 2    |
| 10.29 | 4500       | 1    |
| 10.31 | 4600       | 2    |
| 11.2  | 4700       | 2    |
| 11.4  | 4800       | 2    |
| 11.6  | 4900       | 2    |
| 11.8  | 5000       | 2    |
| 11.10 | 5100       | 2    |
| 11.11 | 5200       | 1    |
| 11.13 | 5300       | 2    |
| 11.14 | 5400       | 1    |
| 11.16 | 5500       | 2    |
| 11.18 | 5600       | 2    |
| 11.20 | 5700       | 2    |
| 11.21 | 5800       | 1    |
| 11.23 | 5900       | 2    |
| 11.25 | 6000       | 2    |
| 11.26 | 6100       | 1    |
| 11.28 | 6200       | 2    |
| 11.30 | 6300       | 2    |
| 12.2  | 6400       | 2    |
| 12.3  | 6500       | 1    |
| 12.5  | 6600       | 2    |
| 12.6  | 6700       | 1    |
| 12.8  | 6800       | 2    |
| 12.9  | 6900       | 1    |
| 12.10 | 7000       | 1    |
| 12.11 | 7100       | 1    |
| 12.13 | 7200       | 2    |
| 12.15 | 7300       | 2    |
| 12.16 | 7400       | 1    |
| 12.18 | 7500       | 2    |
| 12.19 | 7600       | 1    |
| 12.21 | 7700       | 2    |
| 12.22 | 7800       | 1    |
| 12.24 | 7900       | 2    |
| 12.26 | 8000       | 2    |
| 12.28 | 8100       | 2    |
| 12.30 | 8200       | 2    |
| 12.31 | 8300       | 1    |
