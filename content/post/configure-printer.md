+++
title = "配置打印机"
date = 2021-02-16T18:21:00+08:00
lastmod = 2022-01-29T18:37:39+08:00
tags = ["printer", "Windows", "linux"]
categories = ["技术"]
draft = false
+++

入手了一台 REDMI AX6 路由器后，突然发现，现在换个路由器不仅仅需要配置路由器本身，还有一系列的设备都需要重新配置。 <br/>

<!--more-->


## 配置路由器 {#配置路由器}

直接用电脑搜索对应的 WIFI 登录，这时候不需要密码，然后按照提示配置账号和密码，再重新设定 WIFI SSID，由于 AX6 支持 2.4G 和 5G，所以配了两个。重启路由器后顺利登录新建的 WIFI，路由器配置完成。 <br/>

配置难度：超简单 <br/>


## 配置手机电脑电视机 {#配置手机电脑电视机}

连入网路，输入密码，事就这样成了。 <br/>

配置难度：傻瓜式 <br/>


## 配置其他智能家电 {#配置其他智能家电}

用手机进 APP 后，逐个连接配置扫地机器人、智能台灯、网络存储等设备，事就这样成了。 <br/>

这里学到了一个小知识：我一直以为 windows 的映射网络驱动器时，自带的 samba 是不支持主机名解析的，之前一直配置的是静态 IP。这次试了一下主机名居然也连上了，不知是不是这几年来 Windows 10 版本更新的原因，还是由于网络存储的固件升级了。 <br/>

配置难度：费时间 <br/>


## 配置打印机 {#配置打印机}

> 闷头一通乱打，小怪全部清场；天空一声巨响，BOSS 闪亮登场。 <br/>

——配置 Lenovo LJ2268W 打印机花了不少时间，也费了不少脑细胞。特此记录一下： <br/>

-   由于 WIFI 换了，连不上打印机，因此首先需要重置打印机。 <br/>
    -   首先按住按钮 6 秒，关机。 <br/>
    -   翻起上盖，进入重置模式，再按住按钮，先是红灯闪烁，然后变成橙色，重置完成，这时会自动打印出一张配置清单。 <br/>
    -   盖好盖子，再按照清单的步骤逐项配置，最重要的是将网络连上。 <br/>
    -   连上 WIFI 后，用浏览器登录打印机的 IP，进入 web 配置页面。 <br/>
    -   为了后续能顺利使用，将打印机的 IP 改成固定 IP 模式，要不然每次打印机重启后 IP 变动，就会找不到打印机。既可以在打印机的配置页面里设置静态 IP，也可以在路由器的 DHCP 配置里设置静态 IP。 <br/>
-   安装驱动程序： <br/>
    -   Windows 下直接使用官方的安装包，由于懒得找 USB 连接线，直接采用 WIFI 安装方式，一路下一步顺利安装完成。 <br/>
    -   Linux（manjaro）中，步骤如下： <br/>
        -   安装 cups（Common Unix Printing System） <br/>

            ```shell
                  sudo yay -S cups
                  sudo yay -S manjaro-printer system-config-printer # 可选
            ```
        -   启动服务 <br/>

            ```shell
                  sudo systemctl disable --now org.cups.cupsd.socket
                  sudo systemctl disable --now org.cups.cupsd.service
                  sudo systemctl disable --now org.cups.cupsd.path
                  sudo systemctl enable --now cups.service
                  sudo systemctl enable --now cups.socket
                  sudo systemctl enable --now cups.path

                  sudo systemctl list-units -a | grep -i cups # 检查运行状态
            ```
        -   正常来说这时候就可以打印了。如果不成功，则需要手动配置： <br/>
            -   进入 cups 的配置页面<http://localhost:631>，用 web 方式添加打印机。 <br/>
            -   也可以用 `system-config-printer` 进入 `Print Settings` 使用图形界面配置。 <br/>
    -   手机（Android）中，步骤如下： <br/>
        -   在电脑浏览器用 Web 方式登录打印机的 IP 地址，在“远程打印”标签页中，选择“更新二维码并打印”，打印出最新的二维码。 <br/>
        -   手机上安装 App，扫码连接。 <br/>

配置难度：费脑子 <br/>