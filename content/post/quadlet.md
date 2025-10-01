+++
title = "Quadlet"
date = 2025-10-01T13:09:00+08:00
lastmod = 2025-11-05T21:00:20+08:00
tags = ["podman"]
categories = ["技术"]
draft = false
+++

在上一篇遗留了[一个问题]({{< relref "podman#一个问题" >}})，查了一些资料后，发现可以用 Quadlet 来处理。 <br/>

Quadlet 是 Podman 4.4 版本引入的扩展，它用简单的文本文件来定义和启动容器、Pod（容器组）或其他资源。它支持四种主要文件类型：.container、.pod、.volume 和 .network。 <br/>

<!--more-->

以下通过 quanlet 实现一个 wordpress 的应用，它包括一个 Pod，两个容器：mariadb 实现数据库、wordpress 实现前端，以及两个命名卷分别存储对应的容器。 <br/>

Quadlet 文件，全局配置存储在 `/etc/containers/systemd/` 目录，用户级配置在 `~/.config/containers/systemd` 目录。 <br/>


## 首先定义相应的资源 {#首先定义相应的资源}


### wordpress.pod {#wordpress-dot-pod}

```ini
[Unit]
Description=WordPress Pod

[Pod]
PodName=wordpress
PublishPort=8088:80
```

该文件定义了 pod，其中： <br/>

-   `PublishPort=` 字段暴露了相应端口，端口映射必须在 pod 级实现，而不是容器级，否则外部无法访问。 <br/>


### wordpress-db.volume {#wordpress-db-dot-volume}

```ini
[Unit]
Description=WordPress DB Volume

[Volume]
VolumeName=wordpress-db
```

该文件定义了一个命名卷，用于存储数据库。 <br/>


### wordpress-ui.volume {#wordpress-ui-dot-volume}

```ini
[Unit]
Description=WordPress UI Volume

[Volume]
VolumeName=wordpress-ui
```

该文件定义了另一个命名卷，用于存储前端。 <br/>


### wordpress-db.container {#wordpress-db-dot-container}

```ini
[Unit]
Description=WordPress DB Container
BindsTo=wordpress-pod.service
Requires=wordpress-db-volume.service
After=wordpress-db-volume.service

[Container]
Image=docker.io/library/mariadb:latest
ContainerName=wordpress-db
Pod=wordpress.pod
Environment=MARIADB_DATABASE=wordpress
Environment=MARIADB_USER=wordpress
Environment=MARIADB_PASSWORD=wordpress
Environment=MARIADB_RANDOM_ROOT_PASSWORD=yes
Volume=wordpress-db:/var/lib/mysql
AutoUpdate=registry
```

该文件定义了 mariadb 数据库容器。其中： <br/>

-   `BindsTo=` 绑定到对应的 pod <br/>
-   `Required=` 和 `After=` 保证了容器的依赖关系和启动顺序 <br/>
-   `AutoUpdate=` 启用了自动更新 <br/>


### wordpress-ui.container {#wordpress-ui-dot-container}

```ini
[Unit]
Description=WordPress UI Container
BindsTo=wordpress-pod.service
Requires=wordpress-ui-volume.service
After=wordpress-ui-volume.service
Requires=wordpress-db.service
After=wordpress-db.service

[Container]
Image=docker.io/library/wordpress:latest
ContainerName=wordpress-ui
Pod=wordpress.pod
Environment=WORDPRESS_DB_HOST=wordpress-db
Environment=WORDPRESS_DB_USER=wordpress
Environment=WORDPRESS_DB_PASSWORD=wordpress
Environment=WORDPRESS_DB_NAME=wordpress
Volume=wordpress-ui:/var/www/html
AutoUpdate=registry

[Install]
WantedBy=default.target
```

该文件定义了 wordpress 前端容器。它依赖于上述资源。其中： <br/>

-   `WantedBy=` 字段用于实现开机自启动，因为这是最上游的资源，它会拉起其他资源。当然也可以每个资源都加上这一字段。 <br/>


## 然后生成相应的服务 {#然后生成相应的服务}

先重新加载 systemd 来生成相关服务： `systemctl --user daemon-reexec && systemctl --user daemon-reload` <br/>

再用 `systemctl --user list-unit-files | grep wordpress` 列出对应的服务，它们位于 `/run/user/($UID)/systemd/generator/` 目录。正常的话，会显示如下： <br/>

```text
wordpress-db-volume.service                                    generated -
wordpress-db.service                                           generated -
wordpress-pod.service                                          generated -
wordpress-ui-volume.service                                    generated -
wordpress-ui.service                                           generated -
```

不正常的话，可以使用生成器 `/usr/lib/systemd/user-generators/podman-user-generator --user --dryrun`&nbsp;[^1]尝试生成并查看错误。 <br/>
[^1]: 生成器可能在其他位置，通过 `find /usr/lib/systemd/ -name "*-user-generator" 2>/dev/null | grep podman` 查找。 <br/>

然后使用 `systemctl --user start wordpress-ui.service` 启动服务。因为这个服务处于最上游，它会自动启动依赖服务。最后使用 `systemctl --user status wordpress-ui.service` 查看服务状态。 <br/>

使用 `podman ps -ap` 查看： <br/>

```text
CONTAINER ID  IMAGE                               COMMAND               CREATED      STATUS      PORTS                           NAMES            POD ID        PODNAME
0c4238d0ab09                                                            8 hours ago  Up 8 hours  0.0.0.0:8088->80/tcp            wordpress-infra  f5d74fdea66c  wordpress
3f943e724192  docker.io/library/mariadb:latest    mariadbd              8 hours ago  Up 8 hours  0.0.0.0:8088->80/tcp, 3306/tcp  wordpress-db     f5d74fdea66c  wordpress
1d0a81791a2c  docker.io/library/wordpress:latest  apache2-foregroun...  8 hours ago  Up 8 hours  0.0.0.0:8088->80/tcp            wordpress-ui     f5d74fdea66c  wordpress
```

其中的名称为 `wordpress-infra` 的容器为自动生成的架构容器，用来提供共享的基础资源。它是 Pod 的核心，名称是自动生成的，不可修改。 <br/>

此外，对于 rootless 用户，确保已经启用了 linger 功能： `loginctl enable-linger $USER` 以允许容器在用户登出后继续运行。 <br/>


## 实现自动更新容器 {#实现自动更新容器}

Podman 有一个专门的 Systemd 服务来处理自动更新，名为 podman-auto-update.timer。 <br/>

-   启用并启动定时器： `systemctl --user enable --now podman-auto-update.timer` <br/>
-   检查定时器状态:  `systemctl --user status podman-auto-update.timer` <br/>
-   查看定时器服务状态，它会记录自动更新的状态:  `systemctl --user status podman-auto-update.service` <br/>


## 附 1. podman 镜像配置 {#附-1-dot-podman-镜像配置}

全局配置在 `/etc/containers/registries.conf` ，用户配置在 `~/.config/containers/registries.conf` ，内容如下： <br/>

```cfg
# 取消默认搜索地址
unqualified-search-registries = ["docker.io"]

# 自定义仓库
[[registry]]
# 仓库前缀
prefix = "docker.io"
# 镜像地址
location = "docker.m.daocloud.io"
# 允许http
insecure = true
```

使用 `podman auto-update --dry-run` 命令手工验证。 <br/>


## 附 2. podman 卷管理 {#附-2-dot-podman-卷管理}

命名卷是 Podman 管理的独立存储单元，默认存储在 `/var/lib/containers/storage/volumes/` (系统级)，或 `~/.local/share/containers/storage/volumes/` (用户级)。 <br/>

优点是数据更隔离，不直接暴露宿主机文件系统。数据持久化，即使容器删除，卷仍保留。 <br/>

缺点是不易直接编辑（需 `podman volume mount` 或容器内访问），备份需用 `podman volume export` 。

