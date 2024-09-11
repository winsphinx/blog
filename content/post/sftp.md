+++
title = "sftp"
date = 2024-10-06T19:56:00+08:00
lastmod = 2025-07-08T21:32:02+08:00
tags = ["linux", "network", "sftp"]
categories = ["技术"]
draft = false
+++

现要建一个 sftp 服务器，其要求为： <br/>

-   sftp 登录后自动跳转到 `/sftp/$USER/upload` 目录，直接上传 <br/>
-   对应用户 sftp 登录到对应用户目录，不能访问其他用户目录 <br/>

<!--more-->

为实现上述需求，方案如下： <br/>


## 创建用户和组 {#创建用户和组}

以创建一个用户组 sftpgrp，以及两个用户 sftp1、 sftp2 为例: <br/>

```shell
groupadd sftpgrp
adduser sftp1 -G sftpgrp
adduser sftp2 -G sftpgrp
passwd sftp1
passwd sftp2
```


## 创建目录 {#创建目录}

创建相应用户目录，并设置权限 <br/>

```shell
mkdir -p /sftp/sftp{1..2}/upload
chown -R sftp1:sftp1 /sftp/sftp1
chown -R sftp2:sftp2 /sftp/sftp2
chmod -R 770 /sftp/sftp{1..2}
```


## 修改配置 {#修改配置}

编辑 `/etc/ssh/sshd_config` 文件，注释掉自带的 `Subsystem sftp /usr/libexec/openssh/sftp-server` 这行，添加以下内容： <br/>

```shell
Subsystem sftp internal-sftp -d %u/upload
Match Group sftpgrp
        ChrootDirectory /sftp
```

最后重启 sshd 即可。 <br/>

```shell
systemctl restart sshd.service
```

