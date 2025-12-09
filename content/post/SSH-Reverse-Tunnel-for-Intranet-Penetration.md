+++
title = "用 SSH 反向代理实现内网穿透"
date = 2025-12-08T19:23:00+08:00
lastmod = 2026-01-03T18:15:35+08:00
draft = false
+++

今天折腾了以下用 SSH 反向代理实现内网穿透，这个方法配置简单，修改方便，还能断线自动重连。记录如下： <br/>

<!--more-->


## 准备 {#准备}

前提条件是一台内网的机器 A，一台公网的机器 B，A 能访问 B。不安装 FRP 等其他工具，仅仅使用系统内置的 SSH 来实现。 <br/>
先在 A 机器生成一个密钥，并传送到 B 机器： <br/>

```shell
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_tunnel -C "tunnel-2025"
ssh-copy-id -i ~/.ssh/id_ed25519_tunnel root@B_IP
```

验证可以不用密码而是通过密钥登录。 <br/>


## 配置 {#配置}


### 编辑配置 {#编辑配置}

在 A 机器上编辑或创建 `~/.ssh/config`​，权限设 600。 <br/>

```ini
Host ssh-tunnel
    # ==================== 基本连接信息 =====================
    HostName xx.xx.xx.xx              # B机器的 IP 或域名
    User root                         # B机器的 SSH 用户名
    Port 22                           # B机器的 SSH 端口
    IdentityFile ~/.ssh/id_ed25519_tunnel
    IdentitiesOnly yes

    # ==================== 保活与复用 =======================
    ServerAliveInterval 60
    ServerAliveCountMax 3
    ExitOnForwardFailure no
    BatchMode yes

    # ==================== 要暴露的所有端口 =================
    # 格式：RemoteForward  公网端口   内网机器:内网端口
    RemoteForward 2222 localhost:22
    RemoteForward xxxx localhost:yyyy
    # ......
```


### 编辑服务 {#编辑服务}

创建 `/etc/systemd/system/tunnel.service` <br/>

```shell
[Unit]
Description=SSH Tunnel Daemon
After=network.target
Wants=network.target

[Service]
User=YOUR_USERNAME
Group=YOUR_GROUP

ExecStart=/usr/bin/ssh -CNT ssh-tunnel  # ssh-tunnel 和配置文件中Host定义一致

Restart=always
RestartSec=5s
SuccessExitStatus=255  # 确保能自动重连

[Install]
WantedBy=multi-user.target
```

然后启动服务： <br/>

```shell
sudo systemctl daemon-reload
sudo systemctl start tunnel.service
sudo systemctl status tunnel.service
```

这时，可以在 B 机器上用 `netstat -a` 看到代理的端口即为正常运行。 <br/>

作为验证，可以查询 `netstat -tupl | grep 2222` 端口所在的进程号，然后 `kill -9 <PID>` 杀掉进程，几秒后再次查看端口，会发现已经重连。在 B 机器上看服务状态也有重连的记录。 <br/>

比较方便的是，配置完成后 A 机器不需要 root 权限可以直接修改 `~/.ssh/config` 配置文件，因为它位于本用户 HOME 目录下。改完后，有 root 权限可以直接重启服务，没 root 权限可以在 B 机器上踢线，会重启服务。 <br/>

