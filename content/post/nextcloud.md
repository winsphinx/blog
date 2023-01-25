+++
title = "NextCloud"
date = 2023-01-25T11:52:00+08:00
lastmod = 2025-07-09T18:34:11+08:00
tags = ["Docker", "NextCloud"]
categories = ["技术"]
draft = false
+++

本文介绍了如何利用 docker 安装 NextCloud。后端数据库使用的是 MariaDB。 <br/>

<!--more-->


## 准备网络 {#准备网络}

在 docker 中网络分为四种模式（可以使用​`docker network ls`​查看）： <br/>

| 模式      | 含义                              |
|---------|---------------------------------|
| bridge    | 默认，每个容器分配 IP，并将容器连接到 docker0 虚拟网桥 |
| host      | 每个容器使用 host 主机的 IP 和端口 |
| container | 和指定的容器共享 IP 和端口        |
| none      | 不分配网络设置                    |

   因为 NextCloud 和 MariaDB 两个容器需要互通，因此需要将两者连接在同一个网络中，虽然同在默认的 bridge 中，相互能 ping 通 IP，但是为了直接使用容器名调用，需要新建一个网络[^1]，名称为 nextcloud： <br/>
[^1]: 从 Docker 1.10 版本开始，docker daemon 实现了一个内嵌的 DNS server，使容器可以直接通过容器名称通信，只要在创建容器时使用 `--name` 为容器命名即可。但是使用时 Docker DNS 有个限制：只能在 user-defined 网络中使用。即，默认的 bridge 网络是无法使用 DNS 的，所以需要自定义网络。 <br/>

```shell
docker network create nextcloud
```


## 安装容器 {#安装容器}

这里选用的 linuxserver 的镜像，相比官方的镜像多了一些性能的优化和额外的功能。 <br/>

首先安装 MariaDB： <br/>

```shell
docker run -d \
  --name=mariadb \
  --network nextcloud \
  --restart unless-stopped \
  -e PUID=1000 \
  -e PGID=1000 \
  -e MYSQL_ROOT_PASSWORD=MY_ROOT_PASSWORD \
  -e MYSQL_DATABASE=nextcloud \
  -e MYSQL_USER=nextcloud \
  -e MYSQL_PASSWORD=MY_USER_PASSWORD \
  -e TZ=Asia/Shanghai \
  -v ~/NextCloud/mariadb:/config \
  lscr.io/linuxserver/mariadb:latest
```

然后安装 NextCloud： <br/>

```shell
docker run -d \
  --name=nextcloud \
  --network nextcloud \
  --restart unless-stopped \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Asia/Shanghai \
  -e MYSQL_HOST=mariadb \
  -e MYSQL_DATABASE=nextcloud \
  -e MYSQL_USER=nextcloud \
  -e MYSQL_PASSWORD=MY_USER_PASSWORD \
  -p 7788:443 \
  -v ~/NextCloud/config:/config \
  -v ~/NextCloud/data:/data \
  lscr.io/linuxserver/nextcloud:latest
```


## 配置数据库 {#配置数据库}

按照上述脚本，应该已经在 MariaDB 中创建了一个数据库，名称是 nextcloud，以及相应的用户 nextcloud。如果有需要也可以手动创建和修改。 <br/>

```shell
# 进入mariadb的docker
docker exec -it mariadb /bin/sh
# 在docker内部登录数据库
mariadb -u root -p<MY_ROOT_PASSWORD>;
# 创建用户
create user 'nextcloud'@'%' identified by 'my_password';
# 创建数据库
create database nextcloud
  character set = 'utf8'
  collate = 'utf8bm4_general_ci';
```


## 附记：GUI 方式安装 {#附记-gui-方式安装}

如果偏好图形化界面，可以通过 GUI 来操作。 <br/>

首先是安装 portainer： <br/>

```shell
docker run -d \
  --name portainer \
  --restart=always \
  -p 9443:9443 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

然后在浏览器登录<https://ip:9443>, 按照界面提示登录系统、创建网络、安装容器。 <br/>

在 portainer 中用 stack 来安装，此时会自动创建网络： <br/>

```yaml
services:
  nextcloud:
    container_name: nextcloud
    image: lscr.io/linuxserver/nextcloud:latest
    restart: unless-stopped
    ports:
      - "7788:443"
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
      - MYSQL_HOST=mariadb
      - MYSQL_DATABASE=nextcloud
      - MYSQL_USER=nextcloud
      - MYSQL_PASSWORD=MY_USER_PASSWORD
    volumes:
      - ./NextCloud/config:/config
      - ./NextCloud/data:/data
    depends_on:
      - mariadb

  mariadb:
    container_name: mariadb
    image: lscr.io/linuxserver/mariadb:latest
    restart: unless-stopped
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
      - MYSQL_ROOT_PASSWORD=MY_ROOT_PASSWORD
      - MYSQL_DATABASE=nextcloud
      - MYSQL_USER=nextcloud
      - MYSQL_PASSWORD=MY_USER_PASSWORD
    volumes:
      - ./NextCloud/mariadb:/config
```

数据库也可以通过 adminer 来操作。 <br/>

```shell
docker run -d \
  --name=adminer \
  --network nextcloud \
  -p 8088:8080 \
  -e ADMINER_DEFAULT_SERVER=mariadb \
  adminer
```

然后在浏览器中打开<http://ip:8088>, 来创建数据库和用户。记得格式选择 `utf8bm4-general-ci`​。 <br/>


## 配置 NextCloud {#配置-nextcloud}

在浏览器登录<https://ip:7788>, 设置管理员用户名和密码，在数据库选项中选择 MariaDB，填写数据库用户名、密码、数据库名称、数据库容器名:端口（按照第二步这些已经能自动配置完成），确定即可完成。 <br/>


### SSL 证书问题（已解决） {#ssl-证书问题-已解决}

对于 https 证书不安全的提示，用以下命令可以生成自签名证书来解决： <br/>

```shell
openssl req -x509 -out localhost.crt -keyout localhost.key \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
```

其中的 `localhost` 用主机名替换，主机名用 `hostname` 获取。 <br/>


### HSTS 问题（已解决） {#hsts-问题-已解决}

在检查系统时会提示“HSTS 配置错误”。 <br/>


### 问题解决 {#问题解决}

以上两个问题，是有网络环境导致。需要开启 HTTPS 代理，并启用 HSTS 就可解决。最终采用了 Nginx Proxy Manager 实现。

