+++
title = "Docker"
date = 2023-05-03T09:33:00+08:00
lastmod = 2023-06-03T09:33:41+08:00
tags = ["virtualization", "docker"]
categories = ["技术"]
draft = false
+++

Docker，一句话概括，将应用以及依赖打包到一个可移植的镜像中，从而实现虚拟化。 <br/>

<!--more-->


## 安装并启动 Docker {#安装并启动-docker}

```shell
yay -S docker
sudo systemctl start docker
```

为了方便普通用户使用时不必用 sudo 权限，将该用户加入 docker 组： <br/>

```shell
sudo groupadd docker
sudo gpasswd -a ${USER} docker
sudo systemctl restart docker
```


## Docker 命令 {#docker-命令}

Docker 有新版的命令，虽然键入的字符会多一点，却更好记——其命令格式为 `docker 对象 操作` 。对象有：container、image、network、volume 等，操作包括：ls、rm、prune、create、run、stop 等。如： <br/>

```shell
docker container ls  # 查看容器，旧版命令为 container ps
docker image ls  # 查看镜像，旧版命令为 docker images
```

{{< figure src="/ox-hugo/docker.jpg" >}} <br/>

