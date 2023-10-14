+++
title = "LVM"
date = 2023-09-16T15:27:00+08:00
lastmod = 2025-07-08T21:09:08+08:00
tags = ["linux", "LVM"]
categories = ["技术"]
draft = false
+++

在某服务器上，我用 `fdisk -l` 查看为硬盘容量为 3T，但用 `df` 查看只有 200G。这是什么原因呢？ <br/>

经分析，​`fdisk -l` 命令显示的是硬盘分区表中的分区大小，而 `df` 命令显示的是文件系统大小，中间还涉及了 LVM。 <br/>

总的流程是，先用 fdisk 分区，再用 LVM 分卷，再建文件系统。 <br/>

<!--more-->


## fdisk {#fdisk}

fdisk 是一个常用的磁盘分区工具，可以用来创建、删除、调整磁盘分区。 <br/>


### 查看磁盘分区信息 {#查看磁盘分区信息}

使用 fdisk 命令查看磁盘分区信息。例如，查看 /dev/sda 磁盘的分区信息： <br/>

```shell
fdisk -l /dev/sda
```


### 创建新分区 {#创建新分区}

使用 fdisk 命令创建新分区。例如，创建一个新的主分区： <br/>

```shell
fdisk /dev/sda
n
p
```

这个命令会进入 fdisk 的交互模式，按照提示输入分区的起始扇区和结束扇区即可。 <br/>


### 删除分区 {#删除分区}

使用 fdisk 命令删除分区。例如，删除 /dev/sda1 分区： <br/>

```shell
fdisk /dev/sda
d
1
```

这个命令会进入 fdisk 的交互模式，输入要删除的分区号即可。 <br/>


### 调整分区大小 {#调整分区大小}

使用 fdisk 命令调整分区大小。例如，将 /dev/sda1 分区的大小增加 10GB： <br/>

```shell
fdisk /dev/sda
d
1
n
p
1
2048
+10G
```

这个命令会进入 fdisk 的交互模式，先删除原来的分区，然后创建一个新的分区，按照提示输入分区的起始扇区和结束扇区即可。 <br/>


### 保存分区信息 {#保存分区信息}

使用 fdisk 命令保存分区信息。例如，保存对 /dev/sda 的分区修改： <br/>

```shell
fdisk /dev/sda
w
```


## LVM {#lvm}

LVM（Logical Volume Manager）是一种逻辑卷管理器，它可以将多个物理硬盘上的分区合并成一个或多个逻辑卷，从而提供更灵活的存储管理方式。 <br/>


### 创建物理卷 {#创建物理卷}

使用 pvcreate 命令创建物理卷。例如，创建 /dev/sdb1 分区为物理卷： <br/>

```shell
pvcreate /dev/sdb1
```


### 创建卷组 {#创建卷组}

使用 vgcreate 命令创建卷组。例如，创建名为 myvg 的卷组，将 /dev/sdb1 分区加入卷组： <br/>

```shell
vgcreate myvg /dev/sdb1
```


### 创建逻辑卷 {#创建逻辑卷}

使用 lvcreate 命令创建逻辑卷。例如，创建名为 mylv 的逻辑卷，大小为 10GB： <br/>

```shell
lvcreate -L 10G -n mylv myvg
```


### 格式化逻辑卷 {#格式化逻辑卷}

使用 mkfs 命令格式化逻辑卷。例如，将 mylv 逻辑卷格式化为 ext4 文件系统： <br/>

```shell
mkfs.ext4 /dev/myvg/mylv
```


### 挂载逻辑卷 {#挂载逻辑卷}

使用 mount 命令挂载逻辑卷。例如，将 mylv 逻辑卷挂载到 /mnt/mylv 目录： <br/>

```shell
mount /dev/myvg/mylv /mnt/mylv
```


### 调整逻辑卷大小 {#调整逻辑卷大小}

使用 lvresize 命令调整逻辑卷大小。例如，将 mylv 逻辑卷扩大到 20GB： <br/>

```shell
lvresize -L 20G /dev/myvg/mylv
```


### 删除逻辑卷 {#删除逻辑卷}

使用 lvremove 命令删除逻辑卷。例如，删除名为 mylv 的逻辑卷： <br/>

```shell
lvremove /dev/myvg/mylv
```


## resize2fs {#resize2fs}

resize2fs 是一个用于调整 ext2/ext3/ext4 文件系统大小的命令。它可以将文件系统扩大或缩小到指定的大小。 <br/>


### 检查文件系统 {#检查文件系统}

```shell
resize2fs -p /dev/sda1
```

这个命令会检查 /dev/sda1 分区的文件系统是否有错误。 <br/>


### 扩大文件系统大小 {#扩大文件系统大小}

```shell
resize2fs /dev/sda1
```

这个命令会将 /dev/sda1 分区的文件系统扩大到分区的最大可用空间。 <br/>

```shell
resize2fs /dev/sda1 10G
```

这个命令会将 /dev/sda1 分区的文件系统扩大到 10GB。 <br/>


### 缩小文件系统大小 {#缩小文件系统大小}

```shell
resize2fs /dev/sda1 5G
```

这个命令会将 /dev/sda1 分区的文件系统缩小到 5GB。

