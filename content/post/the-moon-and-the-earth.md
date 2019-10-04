+++
title = "The Moon and The Earth"
date = 2019-09-14T20:25:00+08:00
lastmod = 2023-05-28T10:19:27+08:00
tags = ["photography", "Python"]
categories = ["技术"]
draft = false
+++

中秋节发图一般大概是这样的—— <br/>

{{< figure src="/ox-hugo/moon.png" >}} <br/>

（来源：摄于 2019 年中秋晚，f/8，1/500s，ISO200） <br/>

我来发个这样的—— <br/>

{{< figure src="/ox-hugo/earth.png" >}} <br/>

（来源：向日葵 8 号气象卫星，UTC:201909130330） <br/>

比起关注月球，还是先关注自己的地球母亲吧。 <br/>

<!--more-->

向日葵 8 号[^1]是日本气象厅的一颗气象卫星，于 2014 年 10 月 7 日发射。设计寿命 15 年以上，主要用于检测暴雨云团、台风动向和火山活动等防灾领域。 <br/>
[^1]: [向日葵8号实时网页](http://himawari8.nict.go.jp/) <br/>

把它的卫星云图定时爬取下来（数据 10 分钟更新一次，网页延迟大约 1 小时），再设置为电脑桌面壁纸并定时刷新，这样可以实时关注地球了。 <br/>

用 Python 来实现，在 win10 + Python 3.7 / 3.8 下运行正常。用到的库有：requests，PyWin32，Pillow。 <br/>

```python
import datetime
import os
import tempfile

import requests
import win32api
import win32con
import win32gui
from PIL import Image


def crawlWallpaper(imagefile):
    url_base = 'https://himawari8-dl.nict.go.jp/himawari8/img/D531106/1d/550/'
    t = datetime.datetime.utcnow()
    date = t - datetime.timedelta(hours=1, minutes=t.minute % 10)
    ext = '00_0_0.png'
    picture_url = url_base + date.strftime('%Y/%m/%d/%H%M') + ext
    res = requests.get(picture_url)
    with open(imagefile, 'wb') as f:
        f.write(res.content)


def resizeWallpaper(imagefile):
    Image.open(imagefile).resize((660, 660), Image.ANTIALIAS).save(imagefile)


def setWallpaper(imagefile):
    keyex = win32api.RegOpenKeyEx(win32con.HKEY_CURRENT_USER, 'Control Panel\\Desktop', 0, win32con.KEY_SET_VALUE)
    win32api.RegSetValueEx(keyex, 'WallpaperStyle', 0, win32con.REG_SZ, '0')
    win32api.RegSetValueEx(keyex, 'TileWallpaper', 0, win32con.REG_SZ, '0')
    win32gui.SystemParametersInfo(win32con.SPI_SETDESKWALLPAPER, imagefile, win32con.SPIF_SENDWININICHANGE)


if __name__ == '__main__':
    wallpaper = os.path.join(tempfile.gettempdir(), 'wallpaper.png')
    crawlWallpaper(wallpaper)
    resizeWallpaper(wallpaper)
    setWallpaper(wallpaper)
```

更新： <br/>

采用风云 4 号的卫星云图的版本如下： <br/>

```python
import datetime
import os
import tempfile

import requests
import win32api
import win32con
import win32gui
from PIL import Image


def crawlWallpaper(imagefile):
    # 地图形式展示
    picture_url = 'http://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_CHINA.JPG'
    # 地球形式展示
    # picture_url = 'http://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_DISK.JPG'
    res = requests.get(picture_url)
    with open(imagefile, 'wb') as f:
        f.write(res.content)


def setWallpaper(imagefile):
    keyex = win32api.RegOpenKeyEx(win32con.HKEY_CURRENT_USER, 'Control Panel\\Desktop', 0, win32con.KEY_SET_VALUE)
    win32api.RegSetValueEx(keyex, 'WallpaperStyle', 0, win32con.REG_SZ, '2')
    win32api.RegSetValueEx(keyex, 'TileWallpaper', 0, win32con.REG_SZ, '0')
    win32gui.SystemParametersInfo(win32con.SPI_SETDESKWALLPAPER, imagefile, win32con.SPIF_SENDWININICHANGE)
    """
    | WallpaperStyle | TileWallpaper | style     |
    |----------------+---------------+-----------|
    |             10 |             0 | filled    |
    |              6 |             0 | fitted    |
    |              2 |             0 | stretched |
    |              0 |             0 | centered  |
    |              0 |             1 | tiled     |
    """


if __name__ == '__main__':
    wallpaper = os.path.join(tempfile.gettempdir(), 'wallpaper.png')
    crawlWallpaper(wallpaper)
    setWallpaper(wallpaper)
```

