+++
title = "aria2"
date = 2021-03-17T20:16:00+08:00
lastmod = 2021-03-17T20:19:11+08:00
tags = ["Windows", "linux"]
categories = ["技术"]
draft = false
+++

> aria2 是一个自由、开源、轻量级多协议和多源的命令行下载工具。它支持 HTTP/HTTPS、FTP、SFTP、 BitTorrent 和 Metalink 协议。aria2 可以通过内建的 JSON-RPC 和 XML-RPC 接口来操纵。

<!--more-->


## aria2 特性 {#aria2-特性}

-   支持 HTTP/HTTPS GET
-   支持 HTTP 代理
-   支持 HTTP BASIC 认证
-   支持 HTTP 代理认证
-   支持 FTP （主动、被动模式）
-   通过 HTTP 代理的 FTP（GET 命令行或者隧道）
-   分段下载
-   支持 Cookie
-   可以作为守护进程运行。
-   支持使用 fast 扩展的 BitTorrent 协议
-   支持在多文件 torrent 中选择文件
-   支持 Metalink 3.0 版本（HTTP/FTP/BitTorrent）
-   限制下载、上传速度


## aria2 使用 {#aria2-使用}

-   下载单个文件

    ```sh
      aria2c LINK
    ```
-   下载多个文件

    ```sh
      aria2c -Z LINK1 LINK2
      aria2c -Z -P LINK{1,2}  # 用 -P扩展
    ```
-   下载更名

    ```sh
      aria2c LINK -o NAME
    ```
-   限速下载

    ```sh
      aria2c --max-download-limit=500k LINK
    ```
-   续传

    ```sh
      aria2c -c LINK
    ```
-   按列表文件下载

    ```sh
      aria2c -i LISTFILE
    ```
-   多连接下载

    ```sh
      aria2c -xN LINK
    ```
-   多线程下载

    ```sh
      aria2c -sN LINK
    ```
-   下载 BitTorrent 种子文件、磁力链接

    ```sh
      aria2c filename.torrent
      aria2c 'magnet:metalink'
    ```
-   下载 BitTorrent 种子文件、磁力链接中的某个/某些文件

    ```sh
      aria2c -S filename.torrent  # 先获取文件列表
      aria2c --select-file=1-3,6 filename.torrent  # 下载其中编号为1，2，3，6的文件
    ```
