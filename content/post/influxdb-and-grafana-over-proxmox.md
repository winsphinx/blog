+++
title = "InfluxDB and Grafana over Proxmox"
date = 2025-11-01T13:32:00+08:00
lastmod = 2025-11-06T20:18:39+08:00
tags = ["proxmox", "influxDB", "grafana"]
categories = ["技术"]
draft = false
+++

Proxmox 虽然自带系统性能监控，但没法长期保存，故此我采用了 InfluxDB 和 Grafana 的组合来监控 VM 和 LXC。 <br/>

首先我创建了一台 LXC 来作为基座，使用的是 Alpine Linux，它占用资源非常少，1核+512M 内存足够，实占 3%CPU，60%MEM。 <br/>

<!--more-->


## InfluxDB {#influxdb}


### 安装 {#安装}

由于 Alpine Linux 仓库里没有 InfluxDB，而 InfluxDB 官方主推是 3.x 版本，因此需要在 [GitHub](https://github.com/influxdata/influxdb/releases/tag/v2.7.12) 自行下载。然后解压并配置可执行文件路径： <br/>

```shell
tar -zxvf influxdb2-2.7.12_linux_amd64.tar.gz -C /opt
mv /opt/influxdb2-2.7.12/ /opt/influxdb2
ln -s /opt/influxdb2/usr/bin/influxd /usr/local/bin/influxd
```


### 创建数据与配置目录 {#创建数据与配置目录}

```shell
mkdir -p /var/lib/influxdb
mkdir -p /etc/influxdb
```


### 测试启动 {#测试启动}

```shell
influxd --bolt-path /var/lib/influxdb/influxd.bolt \
        --engine-path /var/lib/influxdb/engine \
        --http-bind-address :8086
```

浏览器访问 <http://<服务器ip>:8086>, 首次会要求设置用户名、密码、组织和 bucket，并记下密钥。这些信息后面 Proxmox 要用到。 <br/>


### 创建服务 {#创建服务}

测试正常后，在 /etc/init.d/influxdb 写入： <br/>

```shell
#!/sbin/openrc-run

name="influxdb"
description="InfluxDB time series database"

command="/usr/local/bin/influxd"
command_args="--bolt-path /var/lib/influxdb/influxd.bolt --engine-path /var/lib/influxdb/engine --http-bind-address :8086"
command_background="yes"
pidfile="/run/${RC_SVCNAME}.pid"

depend() {
    need net
}
```

然后赋权并启动服务： <br/>

```shell
chmod +x /etc/init.d/influxdb
rc-update add influxdb default
rc-service influxdb start
```


## Proxmox {#proxmox}


### 配置信息 {#配置信息}

在 Proxmox 的 `指标服务器` 中，添加 InfluxDB，其中：服务器填写 LXC 的地址，端口填 8086，协议是 HTTP，组织、插槽和令牌根据上面信息填写。 <br/>


## Grafana {#grafana}


### 安装与配置 {#安装与配置}

Alpine Linux 仓库有 Grafana，可以直接安装： <br/>

```shell
apk add grafana
```


### 修改配置 {#修改配置}

修改 `/etc/conf.d/grafana` 其中一行，使其能通过外部访问： <br/>

```shell
cfg:server.http_addr=0.0.0.0
```

如果要启用 HTTPS 访问，还要修改 `/etc/grafana.ini` 中的一些参数（密钥文件生成见附 1）： <br/>

```shell
...
[server]
# Protocol (http, https, h2, socket)
protocol = https
...
# https certs & key file
cert_file = /etc/ssl/grafana.crt
cert_key = /etc/ssl/grafana.key
```


### 启动服务 {#启动服务}

```shell
rc-update add grafana default
rc-service grafana start
```

浏览器访问 <http://<服务器ip>:3000>, 默认用户名、密码均为 admin，首次会要求更新密码。 <br/>


### 添加数据源 {#添加数据源}

在 Connections - Data sources 选择 InfluxDB，自定义一个名字，URL 设置成<http://localhost:3000>, 选择 Basic auth，用户名留空，密码设置前述的令牌，Database 设置前述的 bucket。点击 Save&amp;Test 显示绿色即为配置正常。 <br/>


### 配置面板 {#配置面板}

在 Dashboard 中，选择导入模板，ID 为 10048，数据源选上述创建的名字即可。 <br/>


## 附 1 生成密钥文件 {#附-1-生成密钥文件}

使用自签名证书来启用 HTTPS 访问，具体步骤如下： <br/>

```shell
openssl req -x509 -newkey rsa:2048 -keyout grafana.key -out grafana.crt -days 365 -nodes -subj "/C=CN/ST=State/L=City/O=Organization/CN=grafana.local"
chown grafana:grafana grafana.crt grafana.key
chmod 644 grafana.crt
chmod 600 grafana.key
```

然后放到相应目录，与 `/etc/grafana.ini` 配置一致。 <br/>


## 附 2 使用域名访问 {#附-2-使用域名访问}

为了避免使用 IP 地址访问，套上了 CloudFlare，具体步骤如下： <br/>
首先，创建一条 DNS 记录，为它绑定一个域名； <br/>
然后，在规则选项中，创建一条 Origin Rule：当“主机名 等于 本域名”时，目标端口改写到 3000。 <br/>

