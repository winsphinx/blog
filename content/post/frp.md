+++
title = "frp"
date = 2024-02-11T09:54:00+08:00
lastmod = 2025-07-08T21:27:09+08:00
tags = ["network", "Docker", "frp"]
categories = ["技术"]
draft = false
+++

由于 IPv4 地址的短缺，工作环境从原来的独立公网 IP 地址改变成了 NAT 内网。为方便远程访问，实践了一下 frp[^1] 内网穿透，记录如下： <br/>
[^1]: frp 是一个使用 go 语言开发的反向代理服务，可用于内网穿透，支持 tcp, udp 协议。项目地址为<https://github.com/fatedier/frp> <br/>

<!--more-->


## frps {#frps}

frps 是服务器端的程序。配置文件[^2]如下： <br/>

```toml
bindAddr = "0.0.0.0"
bindPort = xxx

auth.method = "token"
auth.token = "my_token"

webServer.addr  = "0.0.0.0"
webServer.port  = yyy
webServer.user = "user"
webServer.password = "password"
```

使用​`frps -c frps.toml`​启动服务，在浏览器登录 <http://server_ip:yyy> 可以查看 frp 的运行情况。防火墙要放行上述端口 xxx、yyy。 <br/>
[^2]: frp 的配置文件曾经为 ini 格式，现官方推荐使用 toml 格式。 <br/>


## frpc {#frpc}

frpc 是客户端的程序。配置文件如下： <br/>

```toml
serverAddr = "SERVER_IP"
serverPort = xxx

auth.method = "token"
auth.token = "my_token"

[[proxies]]
name = "rdp_win"
type = "tcp"
localIP = "192.168.1.1"
localPort = 3389
remotePort = nnn
transport.useEncryption = true
transport.useCompression = true

[[proxies]]
name = "ssh_linux"
type = "tcp"
localIP = "192.168.1.2"
localPort = 22
remotePort = mmm
```

使用​`frpc -c frpc.toml`​启动客户端，之后就可以通过​​`SERVER_IP:端口`​访问相应业务。如访问​`ssh server -p mmm`​，实际访问的就是​`ssh 192.168.1.2`​。其中： <br/>

-   客户端 token 必须与服务器端一致才能正确连接； <br/>
-   在服务器端的防火墙要放行上述端口 nnn、mmm； <br/>
-   如果在局域网内有多个主机，可以只在其中一台上配置客户端，通过指定地址来实现多个主机的穿透； <br/>
-   每一个代理业务配置一个 proxies 字段，其下的 name 作为区别标识，必须唯一； <br/>
-   默认关闭传输数据加密和压缩，按需配置​`transport.useEncryption`​、​`transport.useCompression`​来开启。 <br/>


## service {#service}

上述使用的是命令行开启服务，为方便起见可配置成自启动模式。 <br/>

-   在 Linux 下可以使用 systemd 将其配置为服务，从而用 systemd 命令来方便地管理。以 frps 为例，frpc 类似参考： <br/>

<!--listend-->

```shell
$ sudo vim /etc/systemd/system/frps.service
```

内容为： <br/>

```text
[Unit]
# 服务名称，可自定义
Description = frp server
After = network.target syslog.target
Wants = network.target

[Service]
Type = simple
Restart=on-failure
RestartSec=5s
ExecStart = /path/to/frps -c /path/to/frps.toml

[Install]
WantedBy = multi-user.target
```

-   在 Windows 下，可以用开机启动脚本，或者将其注册为系统服务来实现。 <br/>

<!--listend-->

```shell
sc.exe create fprc binPath= "/path/to/frpc.exe -c /path/to/frpc.toml" DisplayName= "frp client"
```

sc 的配置比较容易出错，Windows 下更简单方便地注册、管理服务，推荐使用 NSSM[^3]。 <br/>
[^3]: NSSM 的项目地址为 <https://nssm.cc/> <br/>


## docker {#docker}

还可以用 docker 方式安装[^4]，以 frps 举例，frpc 可参考修改： <br/>
[^4]: docker 镜像分别在 <https://hub.docker.com/r/snowdreamtech/frps> 和 <https://hub.docker.com/r/snowdreamtech/frpc> <br/>

```yaml
services:
  frps:
    image: snowdreamtech/frps
    container_name: frps
    network_mode: host
    restart: unless-stopped
    volumes:
      - ./config:/etc/frp
```

配置文件存放在 config 下的 frps.toml。

