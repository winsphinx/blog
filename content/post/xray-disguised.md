+++
title = "xray 的伪装"
date = 2026-11-05T18:51:00+08:00
lastmod = 2026-11-06T18:57:49+08:00
tags = ["network", "xray", "linux"]
categories = ["技术"]
draft = false
+++

xray 需要监听 443 端口，如果之前有网站运行在服务器上，此时就会发生端口冲突。最简单的解决办法就是让 xray 监听其他常用端口（如 22、3389、8443），但不够完美。而网上的方案[^1]是针对 TLS，不适合我所用的 reality。经过一系列实验，完成了 reality 下的 xray 伪装，实现 443 端口的共用。 <br/>
[^1]: <https://xtls.github.io/document/level-1/fallbacks-with-sni.html#caddy-%E9%85%8D%E7%BD%AE> <br/>

<!--more-->


## 架构 {#架构}

网上那个方案是用 xray 内置的 fallback 实现伪装和分流的，而 fallback 只对 TLS 有效。因此我用 nginx 来实现分流，用 caddy 来实现隐蔽。此外，我当前的[xray](#xray)是正常运行的，因此希望能尽量保持原来架构，尽可能少的改动来实现我的目的。 <br/>

```text
:443 ── 分流器（只偷看 ClientHello 的 SNI，原样转发字节流）
          ├─ SNI = <serverName> ──► Xray REALITY 入站（reality中实际配置的serverName）
          └─ 其他 SNI / 无 SNI  ──► Caddy（TLS 仍由它自己终止）
```

即，当有 443 的访问时，分流器 nginx 看一下 SNI，如果和 xray 配的一致，送到 xray 代理；如果不一致，送到 caddy 走反代。为了后续方便迁移，我用了三个 docker 来实现。 <br/>


## nginx {#nginx}

它是唯一对公网开 443 的服务，xray 和 caddy 都退到容器内网，使用容器名访问。 <br/>


### nginx 的 docker compose {#nginx-的-docker-compose}

```yaml
services:
  nginx:
    image: nginx:alpine
    container_name: nginx
    restart: unless-stopped
    ports:
      - 443:443
    volumes:
      - ./config/nginx.conf:/etc/nginx/nginx.conf:ro
    networks:
      - network

networks:
  network:
    name: proxy
    external: true
```


### nginx.conf {#nginx-dot-conf}

```cfg
worker_processes auto;
error_log /var/log/nginx/error.log warn;

events {
    worker_connections 1024;
}

stream {
    resolver 127.0.0.11 valid=30s;

    map $ssl_preread_server_name $backend {
        <SNI>       xray:443;
        default     caddy:443;
    }

    server {
        listen 443;
        ssl_preread on;
        proxy_protocol on;
        proxy_pass $backend;
        proxy_connect_timeout 5s;
        proxy_timeout 24h;
    }
}
```

两个细节： <br/>

-   `resolver 127.0.0.11` 是 docker 内置 DNS， `proxy_pass` 用变量时必须靠它运行时解析服务名； <br/>
-   `proxy_timeout 24h` 是因为 stream 默认只给 10 分钟，不改的话长连接会被分流器掐掉； <br/>
-   `proxy_protocol on` 是为了实现能在 xray 的日志里看到真实客户端 IP 地址，否则会传递容器的私网地址。 <br/>


## caddy {#caddy}

为什么有了 nginx 做反代，还要用 caddy？一是 nginx 的功能不如 caddy 强大，特别是 caddy 可以自动申请、自动续期站点的证书；二是 nginx 只有基础的压缩模块。 <br/>
反过来，只用 caddy 做分流，那么需要对官方的 caddy 自行编译，增加 layer4 插件，不方便随时更新维护。 <br/>


### caddy 的 docker compose {#caddy-的-docker-compose}

```yaml
services:
  caddy:
    image: caddy:latest
    container_name: caddy
    restart: unless-stopped
    ports:
      - 80:80
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - ./data:/data
      - ./config:/config
    networks:
      - network

networks:
  network:
    name: proxy
    external: true
```

保留 80 端口给自动申请证书使用。 <br/>


### Caddyfile {#caddyfile}

```cfg
{
    default_sni example.com

    servers {
        listener_wrappers {
            proxy_protocol {
                allow 172.16.0.0/12
            }
            tls
        }
    }
}

:443 {
    redir https://example.com{uri} permanent
}
```

在原 Caddyfile 文件最前面插入以上三块内容： <br/>

-   `default_sni` 用来实现当不带 SNI 的连接进来时，默认添加一个 SNI，这样当访问服务器时，避免出现 `ERR_SSL_PROTOCOL_ERROR` 的错误； <br/>
-   `listener_wrappers` 是只信任容器进来的 PROXY 头里的源 IP；不在名单里的来源不拒连，只是不认它自报的 IP（默认 `fallback_policy IGNORE` ），没发头的当普通直连； <br/>
-   `redir` 是为了实现真正跳转到目标网址，这样更真实：比如当访问 server 的 443 端口时，就会认为这是一个博客网站。 <br/>


## xray {#xray}

xray 只要在 server 端稍作修改，client 端不用调整。 <br/>


### xray 的 docker compose {#xray-的-docker-compose}

由于和前两个容器在同一个网络，因此连端口都不需要暴露，直接通过容器名访问。 <br/>

```yaml
services:
  xray:
    image: ghcr.io/xtls/xray-core:latest
    container_name: xray
    restart: unless-stopped
    volumes:
      - ./log:/var/log/xray
      - ./config:/usr/local/etc/xray
    networks:
      - network

networks:
  network:
    name: proxy
    external: true
```


### config.json {#config-dot-json}

在 streamSettings 节里面添加，这是配合 nginx 的参数，能在日志里显示客户端的真实 IP。 <br/>

```json
"sockopt": {
  "acceptProxyProtocol": true
}
```

