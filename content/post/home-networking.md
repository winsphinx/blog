+++
title = "Home Networking"
date = 2024-07-17T18:50:00+08:00
lastmod = 2025-04-15T17:57:19+08:00
tags = ["linux", "network"]
categories = ["技术"]
draft = false
+++

我有一个海外 VPS 主机用于实现“各种功能”，又购买了一个小主机 armbian 用于[搭建家庭多媒体中心]({{< relref "building-home-media-center" >}})。我还有一个硬盘盒，通过其自带 samba 服务接入 armbian。此外还加了一个移动硬盘挂载到 armbian 下。组网架构图如下。 <br/>

![](/ox-hugo/homenetworking.png) <br/>
以下是各个设备的详细配置： <br/>

<!--more-->


## armbian {#armbian}


### 安装 docker {#安装-docker}

鉴于目前 docker 镜像无法下载的现状，修改 `/etc/docker/daemon.json` 文件，多加几个镜像总有能用的： <br/>

```json
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://hub.uuuadc.top",
    "https://dockerhub.jobcher.com",
    "https://dockerhub.icu",
    "https://dockerproxy.com",
    "https://docker.io",
    "https://huecker.io",
    "https://dockerhub.timeweb.cloud"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "10"
  }
}
```

然后 `systemctl daemon-reload && systemctl restart docker` 更新并重启 docker 服务。 <br/>


### 安装 frp 实现内网穿透 {#安装-frp-实现内网穿透}

因为是家庭宽带是 NAT，所以需要使用 frp 将内网穿透到公网。具体实现见之前 [frp]({{< relref "frp" >}}) 一文。 <br/>


### 安装 ddclient {#安装-ddclient}

因为 IPv6 是公网地址，可以直接使用，所以使用 ddclient 实现动态域名解析。我使用的是<https://dynv6.com/> ，在上面创建一个域名，然后在本地的配置文件 `/etc/ddclient.conf` 如下： <br/>

```shell
daemon=15m
ssl=yes
usev6=if, if=eth0

protocol=dyndns2
server=dynv6.com
login=none
password=TOKEN
example.dynv6.net
```

然后用 systemctl enable 和 start 该服务。也可以使用 <https://dash.cloudflare.com/> 实现，相应的配置改为： <br/>

```shell
daemon=15m
ssl=yes
usev6=if, if=eth0

protocol=cloudflare, \
zone=mydomain.com,   \
ttl=1,               \
login=token,         \
password=TOKEN       \
example.mydomain.com
```

这样，后续直接用域名可以方便操作。如：ssh example.dynv6.net 就可以直接登录。 <br/>


### 挂载 samba 服务 {#挂载-samba-服务}

在 `/etc/fstab` 增加一行，实现开机自动挂载 samba： <br/>

```text
//AirDisk/NewDisk-A /mnt/samba cifs _netdev,nofail,x-systemd.automount,username=AirDisk,password=PASSWORD,uid=root,gid=root,iocharset=utf8,file_mode=0777,dir_mode=0777 0 0
```

其中，​`_netdev`​参数指示该设备为网络设备，将在网络连接后挂载；​`nofail`​参数当挂载失败后不影响系统继续启动。 <br/>


### 挂载硬盘 {#挂载硬盘}

通过 USB 连接移动硬盘，然后是格式化和分区： <br/>

```shell
fdisk -l  # 查看对应的硬盘设备，我这里是/dev/sda
fdisk /dev/sda  # 分区，p 打印分区表，n 创建新分区，w 写入分区表并退出，我创建了/dev/sda1
mkfs.btrfs /dev/sda1  # 格式化成btrfs 文件系统
mkdir /mnt/disk  # 创建挂载目录
mount /dev/sda1 /mnt/disk  # 挂载硬盘
```

为了今后开机自动挂载，在 `/etc/fstab/` 增加一行： <br/>

```text
/dev/sda1 /mnt/disk btrfs defaults,nofail,noatime,compress=zstd 0 0
```

由于 btrfs 支持透明压缩，因此加上​`compress=zstd`​参数开启该功能。 <br/>


### 设置备份 {#设置备份}

写一个脚本，实现每日自动备份文件到 samba 目录。 <br/>

```shell
#!/bin/bash

set -euo pipefail

# 设置变量
SOURCE_DIRS=("$HOME" "/etc")
DEST_DIR="/mnt/disk/backup/armbian/"
TMP_BACKUP="/tmp/backup_$(date +'%Y%m%d%H%M%S').tar.gz"
EXPIRED_DAYS=7

# 使用 tar 创建备份
tar -caf $TMP_BACKUP --absolute-names --transform "s|^/||" ${SOURCE_DIRS[@]} || true

# 使用 rsync 将备份同步到备份目录
rsync -avzh --remove-source-files $TMP_BACKUP $DEST_DIR

# 在备份目录上删除旧备份
cd $DEST_DIR && (ls -t | tail -n +$[EXPIRED_DAYS+1] | xargs --no-run-if-empty rm -rvf)
```

然后使用 `crontab -e` 增加定时计划： <br/>

```shell
4 4 * * * /root/scripts/backup.sh  # 每天4:04执行备份
```

补充更新采用 rsync 增量备份的脚本： <br/>

```shell
#!/bin/bash

set -euo pipefail

# 设置变量
SOURCE_DIRS=("$HOME" "/etc")
DEST_DIR="/mnt/disk/backup/armbian/"
TODAY=$(date +'%Y%m%d')
YESTERDAY=$(date -d "yesterday" +'%Y%m%d')
EXPIRED_DAYS=7

echo "### Starting backup..."
for SOURCE_DIR in "${SOURCE_DIRS[@]}"; do
    rsync -avzh --delete --link-dest="$DEST_DIR$YESTERDAY" "$SOURCE_DIR" "$DEST_DIR$TODAY"
done

echo "### Data transferred. Deleting expired files..."
cd "$DEST_DIR" && find . -maxdepth 1 -mtime +"$EXPIRED_DAYS" -exec rm -rvf {} \+

echo "### Job done!"
```


## VPS {#vps}


### 创建 ssh 主机 {#创建-ssh-主机}

为了便于使用，在 ~~/.ssh~/config 中增加： <br/>

```text
Host armbianv4
  HostName localhost
  Port 50005
Host armbianv6
  HostName example.dynv6.net
  Port 22
```

其中，v4 采用的是 frp 内网映射的端口实现转发，v6 使用的是 ddclient 映射的域名。 <br/>


### 设置 v2ray {#设置-v2ray}

小流量自用，不深入研究了，就用 vmess+TCP。采用 docker 搭建： <br/>

```yaml
services:
  v2ray:
    image: teddysun/v2ray
    container_name: v2ray
    restart: unless-stopped
    environment:
      - PUID=0
      - PGID=0
      - TZ=Asia/Shanghai
    volumes:
      - ./config:/etc/v2ray
    ports:
      - xxxx:xxxx
    networks:
      - network

networks:
  network:
    name: v2ray
```

服务端的配置文件如下： <br/>

```json
{
    "log": {
        "loglevel": "warning"
    },
    "routing": {
        "domainStrategy": "IPIfNonMatch",
        "rules": [
            {
                "type": "field",
                "outboundTag": "block",
                "ip": [
                    "geoip:cn",
                    "geoip:private"
                ]
            }
        ]
    },
    "inbounds": [
        {
            "protocol": "vmess",
            "listen": "0.0.0.0",
            "port": xxxx,
            "settings": {
                "clients": [
                    {
                        "id": "UUID"
                    }
                ]
            },
            "streamSettings": {
                "network": "tcp"
            }
        }
    ],
    "outbounds": [
        {
            "protocol": "freedom",
            "tag": "direct"
        },
        {
            "protocol": "blackhole",
            "tag": "block"
        }
    ]
}
```

客户端的配置文件如下： <br/>

```json
{
    "log": {
        "loglevel": "warning"
    },
    "routing": {
        "domainStrategy": "IPIfNonMatch",
        "rules": [
            {
                "type": "field",
                "outboundTag": "direct",
                "domain": [
                    "geosite:cn"
                ]
            },
            {
                "type": "field",
                "outboundTag": "direct",
                "ip": [
                    "geoip:cn",
                    "geoip:private"
                ]
            }
        ]
    },
    "inbounds": [
        {
            "protocol": "socks",
            "port": yyyy,
            "settings": {
                "auth": "noauth",
                "udp": true
            }
        }
    ],
    "outbounds": [
        {
            "protocol": "vmess",
            "settings": {
                "vnext": [
                    {
                        "address": "IP",
                        "port": xxxx,
                        "users": [
                            {
                                "id": "UUID"
                            }
                        ]
                    }
                ]
            },
            "streamSettings": {
                "network": "tcp"
            },
            "tag": "proxy"
        },
        {
            "protocol": "freedom",
            "tag": "direct"
        }
    ]
}
```


### 挂载 sshfs {#挂载-sshfs}

在 VPS 上为了方便，我把 armbian 的常用目录映射到了 VPS。同样是在 `/etc/fstab` 增加： <br/>

```text
sshfs#armbianv6:/root/Downloads/ /root/Downloads/ fuse defaults,user,allow_other,reconnect,delay_connect,ConnectTimeout=30,ServerAliveInterval=30 0 0
sshfs#armbianv6:/mnt/disk/Media/ /mnt/disk/Media/ fuse defaults,user,allow_other,reconnect,delay_connect,ConnectTimeout=30,ServerAliveInterval=30 0 0
sshfs#armbianv6:/mnt/disk/Music/ /mnt/disk/Music/ fuse defaults,user,allow_other,reconnect,delay_connect,ConnectTimeout=30,ServerAliveInterval=30 0 0
```

由于前面在 armbian 上开启了 IPv6 的 DDNS，故此直接使用 armbianv6。 <br/>


### 设置备份 {#设置备份}

写一个脚本，实现每日自动备份文件到远程。 <br/>

```shell
#!/bin/bash

set -euo pipefail

# 设置变量
SOURCE_DIRS=("$HOME" "/etc")
DEST_DIR="/mnt/disk/backup/ubuntu/"
REMOTE_HOST="armbianv6"
SSH_PORT=22
TMP_BACKUP="/tmp/backup_$(date +'%Y%m%d%H%M%S').tar.gz"
EXPIRED_DAYS=7

# 使用 tar 创建备份
tar -caf $TMP_BACKUP --absolute-names --transform "s|^/||" ${SOURCE_DIRS[@]} || true

# 使用 rsync 将备份同步到远程服务器
rsync -avzh --remove-source-files -e "ssh -p $SSH_PORT" $TMP_BACKUP root@$REMOTE_HOST:$DEST_DIR

# 在远程服务器上删除旧备份
ssh -p $SSH_PORT root@$REMOTE_HOST "cd $DEST_DIR && (ls -t | tail -n +$[EXPIRED_DAYS+1] | xargs --no-run-if-empty rm -rvf)"
```

【附注】如果不能使用密钥方式登录 ssh，则可以使用 `sshpass` 工具来传递密码。相应的命令改写成： <br/>

```shell
sshpass -p 'PASSWORD' rsync -avhP --remove-source-files -e "ssh -p $SSH_PORT" $TMP_BACKUP root@$REMOTE_HOST:$DEST_DIR
sshpass -p 'PASSWORD' ssh -p $SSH_PORT root@$REMOTE_HOST "cd $DEST_DIR && (ls -t | tail -n +8 | xargs --no-run-if-empty rm -rvf)"
```

然后使用 `crontab -e` 增加定时计划： <br/>

```shell
4 4 * * * /root/scripts/backup.sh  # 每天4:04执行备份
```

补充更新采用 rsync 增量备份的脚本： <br/>

```shell
#!/bin/bash

set -euo pipefail

# 设置变量
SOURCE_DIRS=("$HOME" "/etc")
DEST_DIR="/mnt/disk/backup/ubuntu/"
REMOTE_HOST="armbianv6"
SSH_PORT=22
TODAY=$(date +'%Y%m%d')
YESTERDAY=$(date -d "yesterday" +'%Y%m%d')
EXPIRED_DAYS=7

echo "### Starting backup..."
for SOURCE_DIR in "${SOURCE_DIRS[@]}"; do
    rsync -avzh --delete --link-dest="$DEST_DIR$YESTERDAY" -e "ssh -p $SSH_PORT" "$SOURCE_DIR" "root@$REMOTE_HOST:$DEST_DIR$TODAY"
done

echo "### Data transferred. Deleting expired files..."
ssh -p "$SSH_PORT" "root@$REMOTE_HOST" "cd $DEST_DIR && find . -maxdepth 1 -mtime +$EXPIRED_DAYS -exec rm -rvf {} \+"

echo "### Job done!"
```

