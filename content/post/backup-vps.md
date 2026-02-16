+++
title = "Backup VPS"
date = 2026-02-14T19:47:00+08:00
lastmod = 2026-04-03T19:03:14+08:00
tags = ["linux", "network"]
categories = ["技术"]
draft = false
+++

前不久因 CloudCone VPS 故障[^1]，导致我的 VPS 无法使用。万幸的是我一直有[设置备份]({{< relref "home-networking#设置备份" >}})，恢复一下数据都还在。看来数据备份的确很重要，按照 3-2-1 原则[^2]，我再增加一个备份方式，增加一层保险。 <br/>
[^1]: <https://status.cloudcone.com/incidents/346624> <br/>
[^2]: 即：至少保留 3 份完整的数据副本，至少处于 2 种不同类型的存储介质 上，至少 1 份备份要放在异地。 <br/>

<!--more-->

之前的脚本是从 VPS 推送到备份服务器，这次的脚本是从备份服务器向远程拉取。 <br/>


## 准备 {#准备}

先配置无密码 ssh 登录成功。 <br/>


## 脚本 {#脚本}

```shell
#!/bin/bash

set -euo pipefail

REMOTE_SOURCE_DIRS=("/root" "/etc")
LOCAL_DEST_BASE="/mnt/disk/backups"

REMOTE_HOST="remote_host"
SSH_PORT=22
SSH_USER="root"

DEST_DIR="${LOCAL_DEST_BASE}/${REMOTE_HOST}"

TODAY=$(date +'%Y%m%d')
YESTERDAY=$(date -d "yesterday" +'%Y%m%d')
EXPIRED_DAYS=7

echo "## [$(date +'%Y-%m-%d %H:%M:%S')] Starting backup from [${REMOTE_HOST}]..."

mkdir -p "${DEST_DIR}"

for REMOTE_SRC in "${REMOTE_SOURCE_DIRS[@]}"; do
  rsync -avzh --ignore-missing-args --delete --link-dest="${DEST_DIR}/${YESTERDAY}/" -e "ssh -p ${SSH_PORT}" "${SSH_USER}@${REMOTE_HOST}:${REMOTE_SRC}" "${DEST_DIR}/${TODAY}/"
done

echo "## [$(date +'%Y-%m-%d %H:%M:%S')] Data transferred. Deleting expired files..."
find "${DEST_DIR}" -maxdepth 1 -daystart -mtime +"${EXPIRED_DAYS}" -exec rm -rvf {} \+

echo "## [$(date +'%Y-%m-%d %H:%M:%S')] Job done!"
```

