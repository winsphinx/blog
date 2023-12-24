+++
title = "Windows 下端口转发"
date = 2023-12-24T07:19:00+08:00
lastmod = 2024-02-12T07:57:46+08:00
tags = ["network", "Docker", "WSL", "Windows"]
categories = ["技术"]
draft = false
+++

如图，在 Windows 下安装了一个 WSL 子系统，在 WSL 下运行了一个 Docker，外部网络如果需要访问该 docker，这时候需要用到 Windows 的端口转发。 <br/>

{{< figure src="/ox-hugo/windows.png" >}} <br/>

<!--more-->


## 在 WSL 映射 docker 端口 {#在-wsl-映射-docker-端口}

使用 docker -p 来映射，如把 docker 应用的 1111 映射到 WSL 的 2222 端口（为了明显辨别，本例中特意区分端口）： <br/>

```shell
docker run -p 2222:1111 docker_image_name
```


## 在 Windows 映射 WSL 端口 {#在-windows-映射-wsl-端口}

使用 WSL 的 ip -a 查看本机 WSL 的地址，假设为 2.2.2.2，此时访问 2.2.2.2:2222 即为该 docker 的应用。然后将对 Windows 的 3333 端口的访问转发到 2.2.2.2:2222。 <br/>

```shell
netsh interface portproxy add v4tov4 listenaddress=* listenport=3333 connectaddress=2.2.2.2 connectport=2222 protocol=tcp
```

还有开启 Windows 防火墙，开放 3333 端口： <br/>

```shell
netsh advfirewall firewall add rule name="win_to_wsl" dir=in action=allow protocol=TCP localport=3333
```

此时，外部访问 Windows 的 IP:3333，则转发到 2.2.2.2:2222，就可以访问 docker app 了。 <br/>


## 附：删除映射和防火墙规则 {#附-删除映射和防火墙规则}

如果不再需要，删除的命令如下： <br/>

```shell
# 查看全部转发的代理
netsh.exe interface portproxy show all
# 删除相应的端口和防火墙规则名称
netsh interface portproxy delete v4tov4 listenport=2222 listenaddress=* protocol=tcp
netsh advfirewall firewall delete rule name="win_to_wsl"
```

