+++
title = "fail2ban"
date = 2025-01-15T18:40:00+08:00
lastmod = 2025-07-08T21:25:13+08:00
tags = ["linux", "network", "fail2ban"]
categories = ["技术"]
draft = false
+++

近日发现很多对于端口的扫描，虽然由于 ufw 的拦截并不能进入，但还是想用 fail2ban 来封禁这些 IP，减少被扫描的次数。因此增加了更多的 jail 配置。 <br/>

<!--more-->


## jail {#jail}

编辑 `/etc/fail2ban/jail.d/defaults-debian.conf` 文件，定义从哪里读取，以及对应操作： <br/>

```text
[DEFAULT]
banaction = ufw
bantime = 10m
banTime.increment = true

[sshd]
enabled = true

[ufw]
enabled = true
filte = ufw
action = iptables-allports
logpath = /var/log/ufw.log
maxretry = 1
```


## filter {#filter}

编辑 `/etc/fail2ban/filter.d/ufw.conf` 文件，定义正则表达式模板： <br/>

```text
[Definition]
failregex = [UFW BLOCK].+SRC=<HOST> DST
ignoreregex =
```


## action {#action}

`/etc/fail2ban/action.d/ufw.conf` 这个文件是现成的不需要改动，直接拿来用。

