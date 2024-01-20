+++
title = "VPS"
date = 2024-01-20T17:57:00+08:00
lastmod = 2025-07-08T21:10:41+08:00
tags = ["VPS", "linux"]
categories = ["技术"]
draft = false
+++

购买了一台 VPS，安装成 ubuntu 系统，配置了一些安全措施，记录如下： <br/>

<!--more-->


## 禁用 root 账号 {#禁用-root-账号}

首先确保有另一个具有管理员权限的用户账号可以用来管理系统，然后用以下命令禁用 root 账号： <br/>

```shell
sudo usermod -p '!' root  # 禁用root账号
sudo usermod -p '' root   # 启用root账号
```


## 配置 public key {#配置-public-key}

不使用账号-密码方式登录，而是使用公钥-私钥模式。 <br/>

```shell
ssh-copy-id -i ~/.ssh/id_rsa.pub user@host
```

使用 -i 参数指定本地的​`~/.ssh/id_rsa.pub`​的公钥增加到远程主机的​`~/.ssh/authorized_keys`​文件中。 <br/>


## 锁定 ssh {#锁定-ssh}

修改 ssh 的配置，以下参数分别为：启用密钥登录 ssh，禁用密码登录 ssh，禁用 root 账号登录 ssh。 <br/>

```shell
vim /etc/ssh/sshd_config
PubkeyAuthentication yes
PasswordAuthentication no
PermitRootLogin no
```


## 安装 fail2ban {#安装-fail2ban}

Fail2ban 是一个用来监控登录尝试的 daemon ，可以有效侦测和防止可疑行为的发生。 <br/>

```shell
apt install fail2ban
systemctl enable fail2ban.service
systemctl start fail2ban.service
fail2ban-client status
fail2ban-client set ssh banip x.x.x.x
fail2ban-client set ssh unbanip x.x.x.x
```

通过 `/var/log/fail2ban.log` 和 `auth.log` 查看日志。 <br/>


## 设置 ufw {#设置-ufw}

ubuntu 内置了 ufw。 <br/>

```shell
ufw enable
ufw allow 22
ufw allow 80
ufw allow 443
ufw status
```

