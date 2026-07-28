+++
title = "rclone"
date = 2026-04-28T18:02:00+08:00
lastmod = 2026-07-29T18:03:08+08:00
tags = ["rclone"]
categories = ["技术"]
draft = false
+++

rclone 是网盘同步工具，它支持很多网盘和协议。 <br/>

<!--more-->


## 配置 {#配置}

目前好用的支持 webdav 的网盘不多了，我手头的是 koofr 和 infini-cloud，这次以 koofr 为例。在终端进入配置：rclone config，按提示操作： <br/>

-   输入 n，新建 remote <br/>
-   输入 remote 名称，例如 koofr <br/>
-   在存储类型列表中找到并输入对应数字选择 Koofr（或直接输入 koofr） <br/>
    -   provider：输入 koofr（或选择 Koofr） <br/>
    -   user：输入 Koofr 注册邮箱 <br/>
    -   password：登录 Koofr 后，进入 Preferences，点击为应用生成专用密码，然后粘贴到配置菜单里 <br/>
    -   其他选项保持默认（直接 Enter 即可） <br/>
-   最后输入 q 退出配置 <br/>


## 检测 {#检测}

使用 `rclone lsd koofr:/` 看是否能正常列出 Koofr 根目录的文件/文件夹。 <br/>


## 备份 {#备份}

由于我以前已经做了数据备份，这次是备份到异地。因此编写了一个脚本，把三个服务器备份到 koofr 上，并且尽可能的减少上传流量，只对变化的文件重新上传。脚本如下： <br/>

```shell
#!/bin/bash
# Koofr rclone 备份脚本

TODAY=$(date +%Y%m%d)

SOURCE_ROOT="/mnt/disk/backups"
REMOTE_ROOT="koofr:/Backup"

SERVERS=(
  "serverA"
  "serverB"
  "serverC"
)

BASE_PARAMS="--fast-list --skip-links --local-no-check-updated --no-update-modtime"

if [ -t 1 ]; then
    PROGRESS_PARAM="--progress"
else
    PROGRESS_PARAM="--stats=0 --stats-one-line --verbose"
fi

for SERVER in "${SERVERS[@]}"; do
    LOCAL_PATH="$SOURCE_ROOT/$SERVER/$TODAY/"
    REMOTE_PATH="$REMOTE_ROOT/$SERVER/"

    echo "=== 正在同步 $SERVER ($TODAY) ==> 远端目录: $REMOTE_PATH ==="

    /usr/bin/rclone sync "$LOCAL_PATH" "$REMOTE_PATH" \
        $BASE_PARAMS \
        $PROGRESS_PARAM
done
```

这个脚本我设置了两套参数，一套用于命令行模式，会显示进度，方便观察；另一套用于 cron 执行，精简输出，避免进度刷满日志。 <br/>

