+++
title = "台风动态壁纸"
date = 2026-07-11T19:18:00+08:00
lastmod = 2026-09-09T19:30:17+08:00
tags = ["Python"]
categories = ["技术"]
draft = false
+++

使用 Python 写一个桌面壁纸，实现动态展示当前卫星云图的功能。 <br/>

<!--more-->


## 功能 {#功能}

-   每 15 分钟自动下载最新的中国区域卫星云图（可见光/红外合成图） <br/>
-   将下载的图片适配当前显示器分辨率（居中，黑边填充） <br/>
-   每 2 秒切换一张图片，形成动态播放效果 <br/>
-   自动管理缓存，最多保留最近 288 张图片（约 3 天数据） <br/>
-   程序在后台持续运行，支持开机自启（需用户自行设置） <br/>


## 特点 {#特点}

-   多线程：后台下载线程 + 主线程轮播，互不干扰 <br/>
-   容错性强：大量 try-except + 重试机制，即使网络波动也能稳定运行 <br/>
-   安全写入：使用临时文件避免读写冲突 <br/>
-   适配多显示器：按主显示器工作区进行适配 <br/>
-   日志完善：所有操作都有详细日志记录，便于排查问题 <br/>


## 模块 {#模块}


### 初始化 {#初始化}

-   创建临时工作目录: `%TEMP%\wallpaper` <br/>
-   配置日志系统（滚动日志，最大 2MB） <br/>
-   修改注册表，把壁纸设置为“居中” + “不平铺”模式 <br/>


### 下载模块 {#下载模块}

-   使用 `中国气象局官方地址` 下载 FY4B 卫星数据 <br/>
-   采用回溯重试机制：如果最新时刻的图还没生成，就往前推 90 分钟、105 分钟……按照 15 分钟的间隔，直到找到可用的图 <br/>
-   下载成功后进行图片有效性校验（PIL verify） <br/>
-   每 15 分钟 执行一次下载 <br/>


### 图片处理模块 {#图片处理模块}

-   获取当前显示器的工作区分辨率（去掉任务栏后的可用区域）和全屏分辨率 <br/>
-   把卫星图缩放到工作区大小 <br/>
-   在全屏黑色画布上居中贴上处理后的图片 <br/>
-   使用 .tmp 临时文件 + rename 原子操作，避免轮播线程读到正在写入的损坏文件 <br/>


### 轮播模块 {#轮播模块}

-   持续扫描目录中所有 `GEOS_*.jpg` 文件（按文件名排序） <br/>
-   依次调用 Windows API SystemParametersInfo 设置桌面壁纸 <br/>
-   默认每张图显示 2 秒，形成动画效果 <br/>
-   如果本地没有图片，会每 5 秒检查一次等待下载 <br/>


### 清理模块 {#清理模块}

-   自动删除最早的旧图，保持磁盘占用合理（最多 288 张） <br/>


## 代码 {#代码}

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
import io
import logging
import os
import tempfile
import threading
import time
from datetime import datetime, timedelta, timezone
from logging.handlers import RotatingFileHandler

import requests
import win32api
import win32con
import win32gui
from PIL import Image

WORK_DIR = os.path.join(tempfile.gettempdir(), "wallpaper")
MAX_CACHED_IMAGES = 288
DOWNLOAD_RETRIES = 10
DOWNLOAD_RETRY_OFFSET_MINUTES = 90
DOWNLOAD_RETRY_STEP_MINUTES = 15
DOWNLOAD_INTERVAL_SECONDS = 900  # 15 分钟
DEFAULT_PLAY_INTERVAL = 2.0
MIN_IMAGE_SIZE_BYTES = 10 * 1024
LOG_MAX_BYTES = 2 * 1024 * 1024

os.makedirs(WORK_DIR, exist_ok=True)
log_file = os.path.join(WORK_DIR, "wallpaper.log")

log_handler = RotatingFileHandler(
    log_file,
    maxBytes=LOG_MAX_BYTES,
    encoding="utf-8",
)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[log_handler],
)

def get_quarter_string(dt):
    minute = (dt.minute // 15) * 15
    return f"{dt.hour:02d}{minute:02d}00"

class DynamicWallpaper:
    def __init__(self):
        self.image_dir = WORK_DIR
        self._session = requests.Session()
        self._session.headers.update(
            {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "http://www.nmc.cn/publish/satellite/FY4A/china.html",
                "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            }
        )

        keyex = None
        try:
            keyex = win32api.RegOpenKeyEx(
                win32con.HKEY_CURRENT_USER,
                "Control Panel\\Desktop",
                0,
                win32con.KEY_SET_VALUE,
            )
            win32api.RegSetValueEx(keyex, "WallpaperStyle", 0, win32con.REG_SZ, "0")
            win32api.RegSetValueEx(keyex, "TileWallpaper", 0, win32con.REG_SZ, "0")
        finally:
            if keyex:
                win32api.RegCloseKey(keyex)

        logging.info("DynamicWallpaper 初始化成功，注册表配置完成。")

    def _download_latest(self):
        now_utc = datetime.now(timezone.utc)

        for i in range(DOWNLOAD_RETRIES):
            check_time = now_utc - timedelta(minutes=DOWNLOAD_RETRY_OFFSET_MINUTES + i * DOWNLOAD_RETRY_STEP_MINUTES)

            date_str = check_time.strftime("%Y%m%d")
            year = check_time.strftime("%Y")
            month = check_time.strftime("%m")
            day = check_time.strftime("%d")
            quarter = get_quarter_string(check_time)

            url = f"http://image.nmc.cn/product/{year}/{month}/{day}/WXBL/medium/SEVP_NSMC_WXBL_FY4B_ETCC_ACHN_LNO_PY_{year}{month}{day}{quarter}000.JPG"
            target_path = os.path.join(self.image_dir, f"GEOS_{date_str}_{quarter}.jpg")
            if os.path.exists(target_path):
                continue

            try:
                res = self._session.get(url, timeout=10)

                if res.status_code == 200 and len(res.content) > MIN_IMAGE_SIZE_BYTES:
                    try:
                        test_img = Image.open(io.BytesIO(res.content))
                        test_img.verify()
                    except Exception:
                        logging.warning(f"下载的文件验证不是有效图片，跳过: {date_str}_{quarter}")
                        continue

                    # 确保处理成功后再最终定稿文件名，防止轮播线程读到半成品
                    if self._process_image(res.content, target_path):
                        logging.info(f"[下载成功] 成功捕获有效云图 URL: {date_str}_{quarter}")
                        break
            except Exception as e:
                logging.error(f"尝试下载 {date_str}_{quarter} 时遭遇异常: {e}")

    def _process_image(self, image_bytes, target_path):
        """将内存中的图片字节流进行裁剪拼接，并安全写入目标路径"""
        tmp_path = target_path + ".tmp"
        try:
            monitor_info = win32api.GetMonitorInfo(win32api.MonitorFromPoint((0, 0)))
            scr_w, scr_h = monitor_info["Monitor"][2], monitor_info["Monitor"][3]
            work_w, work_h = monitor_info["Work"][2], monitor_info["Work"][3]

            with Image.open(io.BytesIO(image_bytes)) as img:
                old_image = img.resize((work_w, work_h), Image.Resampling.LANCZOS)
                new_image = Image.new("RGB", (scr_w, scr_h), "black")
                new_image.paste(old_image, ((scr_w - work_w) // 2, (scr_h - work_h) // 2))
                # 写入临时文件，避免被主线程由于轮播提早读取
                new_image.save(tmp_path, "JPEG")

            if os.path.exists(target_path):
                os.remove(target_path)
                os.rename(tmp_path, target_path)
            return True
        except Exception as e:
            logging.error(f"[图片处理失败] 路径: {target_path}, 错误: {e}")
            if os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except OSError:
                    pass
            return False

    def _cleanup_old_files(self):
        try:
            files = [os.path.join(self.image_dir, f) for f in os.listdir(self.image_dir) if f.startswith("GEOS_") and f.endswith(".jpg")]
            files.sort()
            while len(files) > MAX_CACHED_IMAGES:
                old_file = files.pop(0)
                os.remove(old_file)
                logging.info(f"[清理缓存] 已删除陈旧文件: {old_file}")
        except Exception as e:
            logging.error(f"清理旧缓存文件时发生错误: {e}")

    def download_loop(self):
        logging.info("启动卫星图后台下载监控...")
        while True:
            try:
                self._download_latest()
                self._cleanup_old_files()
            except Exception as e:
                logging.error(f"下载线程死循环内捕获异常: {e}")
                time.sleep(DOWNLOAD_INTERVAL_SECONDS)

    def play_loop(self, interval=DEFAULT_PLAY_INTERVAL):
        logging.info(f"开始动态壁纸轮播，刷新间隔: {interval}秒...")
        while True:
            # 过滤掉 .tmp 临时文件，只读正片 .jpg
            files = [os.path.join(self.image_dir, f) for f in os.listdir(self.image_dir) if f.startswith("GEOS_") and f.endswith(".jpg")]
            files.sort()

            if not files:
                logging.info("本地暂无可用卫星云图，等待下载中...")
                time.sleep(5)
                continue

            for img_path in files:
                if os.path.exists(img_path) and os.path.getsize(img_path) > MIN_IMAGE_SIZE_BYTES:
                    try:
                        win32gui.SystemParametersInfo(
                            win32con.SPI_SETDESKWALLPAPER,
                            img_path,
                            win32con.SPIF_SENDWININICHANGE,
                        )
                    except Exception as e:
                        logging.error(f"应用壁纸失败: {img_path}, 错误: {e}")
                        time.sleep(interval)

if __name__ == "__main__":
    logging.info("========== 动态壁纸服务程序启动 ==========")
    wallpaper = DynamicWallpaper()

    # 启动后台异步下载线程
    downloader = threading.Thread(target=wallpaper.download_loop, daemon=True)
    downloader.start()

    try:
        wallpaper.play_loop(interval=DEFAULT_PLAY_INTERVAL)
    except KeyboardInterrupt:
        logging.info("程序接收到退出信号，正在停止...")
```

