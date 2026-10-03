+++
title = "为一个 Docker 应用加上访问密码"
date = 2026-08-08T18:08:00+08:00
lastmod = 2026-10-05T17:56:09+08:00
tags = ["Docker"]
categories = ["技术"]
draft = false
+++

我搭建了一个 Docker Web App，想要在访问时做个简单的认证。要实现这个目的，最简单的方法是用“反向代理 + Basic Auth”，即在 app 上面套一层 caddy[^1]作为代理。这样简单、安全、灵活，且不修改原有代码，适合生产部署。 <br/>

[^1]: nginx 也一样可行，不过 caddy 的配置写起来更简单。 <br/>

<!--more-->


## 生成密码 {#生成密码}

如果是本地安装的 caddy，直接使用 `caddy hash-password –plaintext "密码"` 即可。 <br/>
如果是 docker 安装的 caddy，使用 `docker run –rm caddy:2 caddy hash-password –plaintext "密码"` 来生成密码。 <br/>
这时候会得到一个类似 `$2a$14$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` 格式的密码。 <br/>


## 编写配置文件 {#编写配置文件}


### .env {#dot-env}

```text
BASIC_AUTH_USER=username
BASIC_AUTH_HASH='$2a$14$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
```


### docker-compose.yml {#docker-compose-dot-yml}

```yaml
services:
  app:
    image: foo
    container_name: foo  # 假设这个app端口是8080，由于属于同一个网络中的容器间访问，因此不需要要暴露端口
    restart: unless-stopped

   caddy:
    depends_on:
      - app
    image: caddy:2-alpine
    container_name: caddy-proxy
    ports:
      - 80:80
      - 443:443
      - 443:443/udp  # HTTP/3 可选
    environment:
      - BASIC_AUTH_USER=${BASIC_AUTH_USER}
      - BASIC_AUTH_HASH=${BASIC_AUTH_HASH}
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - ./data:/data
      - ./config:/config
    restart: unless-stopped
```


### Caddyfile {#caddyfile}

```text
your.domain.com {
    basic_auth {
        {$BASIC_AUTH_USER} {$BASIC_AUTH_HASH}
    }
    reverse_proxy app:8080
}
```

