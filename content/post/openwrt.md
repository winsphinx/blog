+++
title = "OpenWrt in Hyper-V"
date = 2022-11-11T11:11:00+08:00
lastmod = 2023-02-24T17:49:48+08:00
tags = ["Windows", "OpenWrt"]
categories = ["技术"]
draft = false
+++

OpenWrt 是一个相对 mini 的 Linux 发行版，通常作为路由器的系统。本文简单介绍在虚拟机上安装 OpenWrt。 <br/>

<!--more-->


## 下载与编译 {#下载与编译}

从 <https://github.com/openwrt/openwrt> 下载后，执行以下命令更新包： <br/>

```shell
./scripts/feeds update -a
./scripts/feeds install -a
```

更新 package，否则 luci 等 package 通过 make menuconfig 不能显示。 <br/>
使用命令开始编译： <br/>

```shell
make menuconfig
```

选择 `Target System` 为 x86，​`Subtarget` 选择 Generic 或者 x86-64 均可。 <br/>

目标文件格式 `Target Images` 根据虚拟机平台选择，这里选择 Hyper-V(VHDX)。 <br/>

选择 `luci`​，随后就会有 GUI 配置页面。其他按需配置。 <br/>

编译注意用非 root 用户编译，​`make V=99` 开始编译，第一次编译会比较慢，因为要下载开源包。编译完成后会在 bin 目录生成 vhdx 文件，该文件可以 hyper-V 中加载运行。 <br/>


## 设置与运行 {#设置与运行}

在 Hyper-V 中，新建一个虚拟机，选第一代，虚拟文件选上面生成的 vhdx 文件。 <br/>

建立虚拟机后，设置网络使用内部网络，并开启“启用 MAC 欺骗”。再取消“自动检查点”，设置为“始终自启动”。 <br/>

启动虚拟机，编辑 `/etc/config/networks` 文件，设置 `lan` 字段中的 IP 为本网段的 IP。使用 `service network restart` 重启服务，或者直接 `reboot` 重启系统。 <br/>

最后使用浏览器打开此 IP，进入 openwrt 设置页面。如果无法打开，可能是没有安装 `uhttpd` ，手工安装并启动一下： <br/>

```shell
opkg update
opkg install uhttpd
service uhttpd enable
service uhttpd start
```

