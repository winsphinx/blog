+++
title = "xray"
date = 2024-08-08T19:20:00+08:00
lastmod = 2025-07-08T21:06:47+08:00
tags = ["linux", "network", "xray"]
categories = ["技术"]
draft = false
+++

Xray 是 V2Ray 的一个分支，具有更高的性能（如大连接情况下）、更多的功能（如 XTLS）。 <br/>

经过各种组合验证，最后我采用的是“VLESS-Vision-REALITY”的方案来实现，其优势有： <br/>

-   TCP 比 UDP 更稳定； <br/>
-   vless 比 vmess 更轻量简洁，传输效率更高； <br/>
-   reality 相比 tls 无需注册域名，更省事； <br/>

记录如下： <br/>

<!--more-->


## server {#server}

server 的 config.json： <br/>

```json
{
  "log": {
    "loglevel": "warning"
  },
  "routing": {
    "domainStrategy": "IPIfNonMatch",
    "rules": [
      {
        "type": "field",
        "outboundTag": "block",
        "ip": [
          "geoip:private"
        ]
      }
    ]
  },
  "inbounds": [
    {
      "protocol": "vless",
      "listen": "0.0.0.0",
      "port": __(1)__,
      "settings": {
        "clients": [
          {
            "id": "__(2)__",
            "flow": "xtls-rprx-vision"
          }
        ],
        "decryption": "none"
      },
      "streamSettings": {
        "network": "tcp",
        "security": "reality",
        "realitySettings": {
          "dest": "__(3)__:443",
          "serverNames": [
            "__(3)__",
            "__(3')__"
          ],
          "privateKey": "__(4)__",
          "shortIds": [
            "__(5)__"
          ]
        }
      },
      "sniffing": {
        "enabled": true,
        "destOverride": [
          "http",
          "tls",
          "quic"
        ]
      }
    }
  ],
  "outbounds": [
    {
      "tag": "direct",
      "protocol": "freedom"
    },
    {
      "tag": "block",
      "protocol": "blackhole"
    }
  ]
}
```

其中： <br/>

-   (1) 服务端的侦听端口 <br/>
-   (2) UUID，可以用 `xray uuid` 来生成 <br/>
-   (3) 回落的域名，用于伪装[^1] <br/>

[^1]: 该网站用于伪装，当认证不通过时，会显示该网站，让人以为服务器上运行的是一个网站。网站的选择有一定要求：首先进入待测网页，按下 F12 键，转到“安全性”选项卡，在“连接”下出现“TLS 1.3，X25519”字样即代表网页支持 TLSv1.3 协议、并且使用的是 x25519 证书；其次转到“控制台”选项卡，输入命令 `window.chrome.loadTimes()`​，查看 npnNegotiatedProtocol 的值是否为 h2，如果是的话就代表使用的是 H2 协议。 <br/>

-   (3') 伪装网站的其他地址[^2] <br/>

[^2]: serverName 列表，暂不支持 \* 通配符，在 Chrome 里输入待测试的网址，按下 F12 键，转到“安全性”选项卡，刷新一下，查看“主要来源（安全）”，填证书中 SAN 的值，有多条就填多条。 <br/>

-   (4) 长 ID，用 `xray x25519` 生成一对密钥，填 "Private key" 的值 <br/>
-   (5) 短 ID，用 `openssl rand -hex 8` 生成 <br/>


## client {#client}

client 的 config.json： <br/>

```json
{
    "log": {
        "loglevel": "warning"
    },
    "routing": {
        "domainStrategy": "IPIfNonMatch",
        "rules": [
            {
                "type": "field",
                "outboundTag": "direct",
                "domain": [
                    "geosite:cn"
                ]
            },
            {
                "type": "field",
                "outboundTag": "direct",
                "ip": [
                    "geoip:cn",
                    "geoip:private"
                ]
            }
        ]
    },
    "inbounds": [
        {
            "protocol": "socks",
            "listen": "0.0.0.0",
            "port": __(6)__
        },
        {
            "protocol": "http",
            "listen": "0.0.0.0",
            "port": __(6')__
        }
    ],
    "outbounds": [
        {
            "tag": "proxy",
            "protocol": "vless",
            "settings": {
                "vnext": [
                    {
                        "address": "__(7)__",
                        "port": __(1)__,
                        "users": [
                            {
                                "id": "__(2)__",
                                "flow": "xtls-rprx-vision",
                                "encryption": "none"
                            }
                        ]
                    }
                ]
            },
            "streamSettings": {
                "network": "tcp",
                "security": "reality",
                "realitySettings": {
                    "serverName": "__(3)__",
                    "publicKey": "__(4')__",
                    "shortId": "__(5)__",
                    "fingerprint": "chrome"
                }

            }
        },
        {
            "tag": "direct",
            "protocol": "freedom"
        }
    ]
}
```

其中： <br/>

-   (6) 客户端的侦听端口 socks 协议 <br/>
-   (6') 客户端的侦听端口 http 协议，给某些不支持 socks 的服务用 <br/>
-   (7) 服务器地址 <br/>
-   (4') 长 ID，填与服务端对应的 "Public  key" 的值

