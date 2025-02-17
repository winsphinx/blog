+++
title = "VPS 被挖矿了"
date = 2025-02-11T19:32:00+08:00
lastmod = 2025-07-08T21:16:28+08:00
tags = ["linux", "docker", "VPS"]
categories = ["技术"]
draft = false
+++

本文记载了一次我的 VPS 被攻击的经历。 <br/>

<!--more-->


## 现象 {#现象}

我的 vps 在使用中感觉很卡，仔细一看，cpu 负载一直在 100%，用 top 查看没有异常进程，但总数明显不正常，应该是相关进程被隐藏了。 <br/>


## 处理 {#处理}

由于系统卡得几乎无法操作，也就没法安装杀毒软件或其他工具。正在束手无策之际，突然想起之前有个 glances 的 docker 在运行，打开 glances 的页面，果然发现一个进程占了 70~80% 的 cpu 负荷。 <br/>

用 `systemctl status PID`​，显示了详细信息，其中包含了文件路径，于是去删除了相关文件，再 `kill -9 PID` 杀掉进程。 <br/>

又查了 `crontab -l`​，里面被添加了开机启动（@reboot 开头的行），又相应删了这些文件。 <br/>

然后又凭感觉连猜带蒙的删了一些相关文件，感觉差不多了，重启。进来后觉得还是卡，但实际 cpu 负荷并不高，可能是心理作用吧，洁癖，还是重装吧。 <br/>


## 分析 {#分析}

一直在思考 vps 怎么会被挖矿，平时也没安装乱七八糟的东西，更何况也没怎么跑大型的应用。 <br/>

然后突然想起，为了监控远程 docker，我开了允许远程访问 docker。具体操作参考[^1]。 <br/>
[^1]: <https://docs.docker.com/engine/daemon/remote-access/> <br/>

这样带来很危险的后果，只要被扫描到端口，就可以实现攻击，完全不设防。 <br/>


### 攻击示例 {#攻击示例}

简单地举个例子： <br/>

```shell
# 攻击者使用无认证的 2375 端口远程连接 Docker 并修改 /etc/hosts
docker -H tcp://<your-server-ip>:2375 run --rm \
  -v /etc/hosts:/etc/hosts \
  alpine sh -c "echo '1.2.3.4 example.com' >> /etc/hosts"
```

这样子，还有什么不能改的呢？ <br/>


## 整改 {#整改}

有两个方案： <br/>


### 套上 TLS {#套上-tls}


#### 生成服务器 TLS 证书 {#生成服务器-tls-证书}

```shell
sudo mkdir -p /etc/docker/certs
sudo openssl genrsa -aes256 -out /etc/docker/certs/ca-key.pem 4096
sudo openssl req -new -x509 -days 365 -key /etc/docker/certs/ca-key.pem -sha256 -out /etc/docker/certs/ca.pem
sudo openssl genrsa -out /etc/docker/certs/server-key.pem 4096
sudo openssl req -subj "/CN=$(hostname)" -new -key /etc/docker/certs/server-key.pem -out /etc/docker/certs/server.csr
sudo openssl x509 -req -days 365 -sha256 -in /etc/docker/certs/server.csr -CA /etc/docker/certs/ca.pem -CAkey /etc/docker/certs/ca-key.pem -CAcreateserial -out /etc/docker/certs/server-cert.pem
sudo chmod 600 /etc/docker/certs/*
```


#### 修改 /etc/docker/daemon.json {#修改-etc-docker-daemon-dot-json}

```json
{
  "tls": true,
  "tlsverify": true,
  "tlscacert": "/etc/docker/certs/ca.pem",
  "tlscert": "/etc/docker/certs/server-cert.pem",
  "tlskey": "/etc/docker/certs/server-key.pem",
  "hosts": [
    "unix:///var/run/docker.sock",
    "tcp://0.0.0.0:2376"
  ]
}
```


#### 重启 docker {#重启-docker}

```shell
sudo systemctl daemon-reload
sudo systemctl restart docker
```


#### 生成客户端证书 {#生成客户端证书}

```shell
openssl genrsa -out client-key.pem 4096
openssl req -new -key client-key.pem -sha256 -out client.csr
openssl x509 -req -days 365 -sha256 -in client.csr -CA ca.pem -CAkey ca-key.pem \
-CAcreateserial -out client-cert.pem
```


#### 客户端连接 {#客户端连接}

```shell
docker --tlsverify \
  --tlscacert=/path/to/ca.pem \
  --tlscert=/path/to/client-cert.pem \
  --tlskey=/path/to/client-key.pem \
  -H=tcp://<服务器IP>:2376 info
```


### 使用 Docker Socket Proxy {#使用-docker-socket-proxy}

使用 tecnativa/docker-socket-proxy 作为代理，限制 API 权限。 <br/>

```shell
docker run -d \
  --name docker_proxy \
  -p 2375:2375 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e CONTAINERS=1 \
  -e IMAGES=1 \
  -e SERVICES=0 \
  tecnativa/docker-socket-proxy
```


#### 验证 {#验证}

```shell
# 使用 curl 进行 API 测试：
curl http://localhost:2375/containers/json
# 仅返回正在运行的容器列表。

# 尝试删除容器：
curl -X DELETE http://localhost:2375/containers/<container-id>
# 提示被拒绝。
```


## 总结 {#总结}

-   以上两个方案，第二个方法更方便也更安全，也是我最后采用的方案。 <br/>
-   对于网上的技术资料方案，即使是正规网站，也要切实理解后再实施。

