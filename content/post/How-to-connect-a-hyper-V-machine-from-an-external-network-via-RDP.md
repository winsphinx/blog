+++
title = "从外部网络通过远程桌面访问 hyper-V 的虚拟机"
date = 2025-07-27T16:15:00+08:00
lastmod = 2025-07-30T18:26:16+08:00
tags = ["network"]
categories = ["技术"]
draft = false
+++

因网络安全的要求，一部分软件无法安装在宿主机，于是我用 hyper-V 建了一台虚拟机，将这些软件安装在里面。在宿主机访问虚拟机虽然方便，但外部要访问虚拟机时又不想通过宿主机操作，于是就有了下面的方案。 <br/>

<!--more-->


## 准备条件 {#准备条件}

-   Hyper-V 网络是 NAT Mode，已经得到私网地址，能正确连接到网络。（因为如果 Bridge Mode 有公网地址，就可以直连了，没必要通过宿主机转发。） <br/>
-   虚拟机已启用远程桌面，开启 RDP 服务，默认端口 3389，但也会被限制，后续改成 33389。 <br/>
-   在宿主机打开“服务”，确认“IP Helper”服务状态为“正在运行”。 <br/>
-   在宿主机选用一个未使用的端口用于转发，如 33389。 <br/>


## 对虚拟机的操作 {#对虚拟机的操作}


### 配置防火墙 {#配置防火墙}

启用远程桌面后正常情况下，防火墙规则会自动创建，3389 会自动打开。但由于 3389 端口受限，手动调整方法如下： <br/>
打开“高级安全 Windows Defender 防火墙”，创建入站规则： <br/>

-   选择“端口” &gt; “TCP” &gt; 指定端口“33389”。 <br/>
-   选择“允许连接”。 <br/>
-   适用范围包括“专用”和“公用”网络。 <br/>
-   命名规则，例如“RDP Access”。 <br/>


### 修改注册表 {#修改注册表}

导航到注册表： <br/>
`HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp` <br/>
找到​`PortNumber`​，修改为 33389。 <br/>


## 对宿主机的操作 {#对宿主机的操作}


### 配置转发 {#配置转发}

使用管理员权限打开终端，输入： <br/>

```shell
netsh interface portproxy add v4tov4 listenaddress=HOST_IP listenport=33389 connectaddress=VM_IP connectport=33389
```

检查一下： <br/>

```shell
netsh interface portproxy show v4tov4
```


### 配置防火墙 {#配置防火墙}

打开“高级安全 Windows Defender 防火墙”，创建入站规则： <br/>

-   在“入站规则”上右键，选择“新建规则”。 <br/>
-   选择“端口” &gt; “TCP” &gt; 指定端口“33389”。 <br/>
-   选择“允许连接”。 <br/>
-   适用范围选择“公用”网络（因为涉及公网访问）。 <br/>
-   命名规则，例如“RDP Port Forwarding”。 <br/>

