+++
title = "Block IP for Docker"
date = 2024-05-11T18:30:00+08:00
lastmod = 2025-07-08T21:28:32+08:00
tags = ["linux", "Docker"]
categories = ["技术"]
draft = false
+++

用 docker 搭建了一个[frp]({{< relref "frp" >}})，但最近发现有很多不明 IP 的访问，虽然并未造成安全问题，总归是不胜其扰，遂打算编个程序 block 这些 IP。 <br/>

<!--more-->


## 思路 {#思路}

起初考虑使用[frptables](https://github.com/zngw/frptables)这个项目，但由于我采用的是 docker 部署，需要将这个工具放在 docker 内部，这样至少有两个不便： <br/>

-   一是要考虑 docker 权限，要么开启特权模式(`--privileged`)，要么设置主机网络模式(`--host`)，反而增加了风险； <br/>
-   二是不方便后续升级更新，一旦 docker 更新，所有操作都需要重新安装一遍。 <br/>

于是排除了这一方案，不过这个项目给了我一些启发，我用 shell 脚本自己实现了一个。 <br/>


## 实现 {#实现}

写一个 shell 脚本​`block-ip.sh`​，从 docker 日志中获取 IP 地址，如果是中国的地址则不拦截，不是中国的地址且不在 iptables 中的则实施拦截。为了监控 log 变更，还需要使用 inotify-tools 中的​`inotifywait`​。 <br/>

```shell
#!/bin/bash

# 白名单 IP 地址列表
WHITELIST=("0.0.0.0" "172.*" "192.168.*")

# 启动 docker logs -f 命令，并将日志输出重定向到临时文件
TMPFILE=$(mktemp -t block.unwanted.ip.XXXXXX) || exit 1
docker logs -f frps > $TMPFILE 2>/dev/null &

# 检查 docker logs 命令是否成功启动
if [ $? -ne 0 ]; then
    echo "无法启动 docker logs 命令。"
    exit 1
fi

# 获取 docker logs 命令的进程 ID
DOCKER_PID=$!

# 函数：清理环境
cleanup() {
    echo "运行结束，正在清理..."
    kill -9 $DOCKER_PID 2>/dev/null
    rm -f $TMPFILE 2>/dev/null
    exit 1
}

# 捕获 Ctrl+C 信号
trap cleanup INT

# 日志函数，输出到终端和文件
LOG_FILE="/var/log/block_ip.log"

log() {
    local msg=$1
    echo "$(date '+%F %T.%3N') $msg" | tee -a $LOG_FILE
}

log "开始运行..."

# 使用 inotifywait 监视临时文件的变化
while inotifywait -qq -e modify $TMPFILE; do
    # 在文件发生变化时执行操作
    # 获取最新的 Docker 日志中的 IP 地址
    ip=$(tail -n 1 $TMPFILE | grep -oE '((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3})')

    # 检查 IP 地址是否在白名单中
    in_whitelist=false
    for white_ip in ${WHITELIST[@]}; do
        if [[ $ip == $white_ip ]]; then
            in_whitelist=true
        log "IP地址 $ip 在白名单列表，不进行拦截。"
            break
        fi
    done

    if [[ -n $ip ]] && ! $in_whitelist; then
        # 检查 IP 地址是否已经存在于 iptables 规则中
        is_existing=$(iptables -C DOCKER-USER -s $ip -j DROP 2>&1 | grep -o $ip)

        if [[ -n $is_existing ]]; then
            log "IP地址 $ip 已做拦截，无需重复添加。"
        else
            # 获取 IP 地址归属国家
            ip_country=$(curl -s https://ipinfo.io/${ip}/country)

            if [[ $ip_country == "CN" ]]; then
                log "IP地址 $ip 属于中国，不进行拦截。"
            else
                iptables -I DOCKER-USER -s $ip -j DROP
                log "IP地址 $ip 来自 $ip_country，添加到拦截规则。"
            fi
        fi
    fi
done
```


## 运行 {#运行}


### 直接启动 {#直接启动}

用​​`./block-ip.sh`​执行，或者用 nohup 后台执行。 <br/>

```shell
nohup ./block-ip.sh > /dev/null 2>&1 &
# 可简写成
nohup ./block-ip.sh &> /dev/null &
```


### 以服务方式启动 {#以服务方式启动}

新建​`/etc/systemd/system/block-ip.service` <br/>

```shell
[Unit]
Description=block daemon
After=syslog.target  network.target
Wants=network.target

[Service]
Type=simple
ExecStart=/usr/local/block.sh
Restart= always
RestartSec=1min

[Install]
WantedBy=multi-user.target
```


## 其他 {#其他}

-   这个思路可以扩展到其他用途，只要能匹配到正则式，就可以实施拦截。 <br/>
-   对于在​`/var/log/block-ip.log`​日志文件，考虑用 logrotate 处理。 <br/>
-   也考虑使用 fail2ban 的自定义规则实现。 <br/>


## 补充 {#补充}

随着被拦截的 IP 越来越多，iptables 防火墙的效率会降低，有必要隔一段时间一波，脚本如下： <br/>

```shell
#!/bin/bash

# 使用 awk 计数并删除规则
count=$(iptables-save | grep 'DOCKER-USER -s' | awk '
{
    # 打印删除命令
    gsub(/^-A/, "iptables -D")
    print
    # 执行删除命令
    system($0)
    # 增加计数器
    count++
}
END {
    # 输出计数器
    print count
}')

# 输出删除的规则数量
echo -e "已删除：\n$count 条规则"
```

