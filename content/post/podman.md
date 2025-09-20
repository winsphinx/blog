+++
title = "Podman"
date = 2025-09-19T21:14:00+08:00
lastmod = 2025-09-20T18:43:48+08:00
tags = ["Docker", "podman"]
categories = ["技术"]
draft = false
+++

Podman 是一个开源的容器引擎工具，由 Red Hat 开发，主要用于在 Linux 系统上构建、运行和管理容器镜像。它是 Docker 的一个轻量级替代品，支持 OCI（Open Container Initiative）标准容器格式。 <br/>

它有以下特点： <br/>

-   无守护进程：不像 Docker 需要一个后台 daemon 进程，Podman 以用户级进程运行，减少了复杂性和安全风险。 <br/>
-   Rootless 支持：可以以非 root 用户身份运行容器，提高安全性，避免特权容器带来的潜在问题。 <br/>
-   兼容 Docker：Podman 的命令行接口（CLI）与 Docker 高度兼容，许多 docker 命令可以直接用 podman 替换（如 podman run、podman build）。 <br/>
-   Pod 支持：受 Kubernetes 启发，可以管理多个容器的“Pod”，便于编排。 <br/>
-   其他功能：支持容器镜像构建、推送、拉取；集成 systemd 用于容器服务管理；适用于开发、测试和生产环境。 <br/>

{{< figure src="/ox-hugo/podman.png" >}} <br/>

可以看到： <br/>

-   docker 需要开启 dockerd 的守护进程，与高级容器进行时 containerd 通信，再调用低级容器进行时 runc。 <br/>
-   podman 没有守护进程，直接调用 runc，从而与内核交互，管理容器。 <br/>
-   k8s 可以与支持 CRI 标准接口的进程通信，如既可以 containerd 通信，也可以与最新的 CRIO 通信。 <br/>

podman 的大部分命令和 docker 一致[^1]，甚至可以直接用 `alias docker=podman` 创建别名。本文记录一些与 docker 不同的特性。 <br/>
[^1]: 在改写 docker 命令时要注意一点，podman 需要显式调用 dockerhub 镜像，毕竟不是一家子。如果是官方镜像，则 docker.io/library/，非官方镜像加 docker.io/。 <br/>

<!--more-->


## 创建 pod {#创建-pod}

pod 是来自 k8s 的概念，它由若干个相互关联的容器构成。同一个 pod 里的容器，IP 地址相同，共享挂载卷和命名空间。 <br/>

以下以创建一个多媒体 pod 为例，它包含三个容器：qbittorrent 用于下载，radarr 用于管理电影，sonarr 用于管理剧集。 <br/>

首先，创建一个 pod： <br/>

```shell
# 创建
podman pod create --name multimediacenter -p 8988:8988 -p 7878:7878 -p 8989:8989

# 查看
podman pod list

# 停止/启动
podman stop/start multimediacenter
```

然后，将三个容器加入到 pod（提前创建好相应目录）： <br/>

```shell
# 加入qbittorrent
podman run -d \
       --pod multimediacenter \
       --name qbittorrent \
       --restart=unless-stopped \
       -e TZ=Asia/Shanghai \
       -e UMASK_SET=022 \
       -e WEBUI_PORT=8988 \
       -v $HOME/config/qbittorrent:/config \
       -v $HOME/Downloads:/downloads \
       docker.io/linuxserver/qbittorrent:latest

# 加入radarr
podman run -d \
       --pod multimediacenter \
       --name radarr \
       --restart=unless-stopped \
       -e TZ=Asia/Shanghai \
       -v $HOME/config/radarr:/config \
       -v $HOME/Downloads:/downloads \
       -v /mnt/disk/Media/movies:/movies \
       docker.io/linuxserver/radarr:latest

# 加入sonarr
podman run -d \
       --pod multimediacenter \
       --name sonarr \
       --restart=unless-stopped \
       -e TZ=Asia/Shanghai \
       -v $HOME/config/sonarr:/config \
       -v $HOME/Downloads:/downloads \
       -v /mnt/disk/Media/series:/tv \
       docker.io/linuxserver/sonarr:latest

# 查看
podman ps --all --pod  # 简写成 -ap
```


## 保存 pod {#保存-pod}

podman 可以把配置好的 pod 导出成文件，供后续使用。一般导出成 k8s 兼容的格式，也可以直接用于 k8s。 <br/>

```shell
# 导出
podman generate kube multimediacenter > multimediacenter.yaml

# 导入
podman play kube multimediacenter.yaml
```


## 自启动 pod {#自启动-pod}

由于 podman 没有守护进程，如果要实现开机自启动，可以使用以下方式： <br/>

```shell
# 创建文件
podman generate systemd --new --files --name multimediacenter

# 创建服务
mkdir -p ~/.config/systemd/user/
cp *.service ~/.config/systemd/user/

# 启动服务
systemctl --user daemon-reload
systemctl --user enable --now pod-multimediacenter.service
loginctl enable-linger $(whoami)
```


## 自动更新镜像 {#自动更新镜像}

当镜像有更新时，如果希望运行的容器保持更新，docker 通常需要外部工具来实现，而 podman 有内置的自动更新机制，只要在创建容器时按需加上自动更新标识 `--label io.containers.autoupdate=registry` ： <br/>

```shell
# 加上自动更新标识
podman run -d \
       --pod multimediacenter \
       --name qbittorrent \
       --restart=unless-stopped \
       --label io.containers.autoupdate=registry \
       -e TZ=Asia/Shanghai \
       -e UMASK_SET=022 \
       -e WEBUI_PORT=8988 \
       -v $HOME/config/qbittorrent:/config \
       -v $HOME/Downloads:/downloads \
       docker.io/linuxserver/qbittorrent:latest

# 参照上一步生成服务
podman generate systemd --new --files --name multimediacenter
cp *.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now pod-multimediacenter.service

# 启用自动更新服务
systemctl --user enable podman-auto-update.timer
systemctl --user start podman-auto-update.timer

# 验证
podman auto-update --dry-run
```


## <span class="org-todo todo TODO">TODO</span> 一个问题 {#一个问题}

在创建 systemd 服务文件是， `--new` 参数的作用是：它根据当前的 pod **被创建时** 的命令和参数来生成服务，如镜像名称、端口映射、挂载卷等。而不加 `--new` 参数，则仅根据 **当前正在运行** 的 Pod 的状态，如容器名称、镜像、挂载卷等信息来生成一个 systemd 文件，它不会尝试记录或重现创建命令。 <br/>

即，不加 `--new` 参数生成的服务文件，对应运行的容器 ID，仅对于运行的容器有效，如果该容器被删除后，则无法启动。然而，对于自动更新时来说，当前运行的容器会被删除，重新创建一个新版本的容器来替代，这时是必须需要 `--new` 参数的。于是便产生了一个逻辑冲突： <br/>

设想这样的场景：从网上找到一个 yaml 配置文件，它配置了自动更新标识。如果用 `podman play kube` 导入运行，此时由于本地没有相关的创建命令，因此在 `podman generate kube` 时使用 `--new` 会报错: <br/>

```text
Error: cannot use --new on pod "...": no create command found
```

那么这样的 pod 如何实现开机自启动呢？ <br/>

