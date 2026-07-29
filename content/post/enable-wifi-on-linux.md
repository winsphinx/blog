+++
title = "为 Linux 开启 WiFi"
date = 2026-06-28T18:24:00+08:00
lastmod = 2026-07-29T18:25:34+08:00
tags = ["linux"]
categories = ["技术"]
draft = false
+++

当时为了省电，我把 armbian 的 WiFi 关了，最近有一次有线网络断了，想登录到系统内，想了好多办法，折腾了很久才连上了。痛定思痛，想着如果有一个无线网作为备用通道，也不至于那么麻烦。于是决定再次开启 WiFi。 <br/>

<!--more-->


## 查看硬件模块 {#查看硬件模块}

使用 `rfkill list all` 查看模块是否被 block，如果看到 Wireless LAN 被 blocked。先使用 `rfkill unblock wifi` 解锁。 <br/>


## 查看无线网络 {#查看无线网络}

使用 `nmcli radio wifi` 检查无线是否被禁用，如果被禁用，则使用 `nmcli radio wifi on` 启用它。 <br/>


## 连接无线网络 {#连接无线网络}

先使用 `nmcli device wifi list` 查看无线网络，然后使用命令 `nmcli device wifi connect "WiFi名字" password "WiFi 密码"` 来接入 Wifi。 <br/>

