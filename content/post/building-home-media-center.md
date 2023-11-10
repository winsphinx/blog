+++
title = "搭建家庭多媒体中心"
date = 2023-11-10T20:10:00+08:00
lastmod = 2024-07-18T18:53:30+08:00
tags = ["Docker"]
categories = ["技术"]
draft = false
+++

近期用一组 Docker 搭建了家庭多媒体中心，在此做个记录。 <br/>

<!--more-->


## qBittorrent {#qbittorrent}

qBittorrent 作为下载工具是必不可少的。下载目录和其他 docker 统一映射在一起，用于共享。此外，相关 docker 都加入了同一个 network，便于互相访问。 <br/>

```yaml
services:
  qbittorrent:
    image: linuxserver/qbittorrent
    container_name: qbittorrent
    restart: unless-stopped
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
      - UMASK_SET=022
      - WEBUI_PORT=8988
    volumes:
      - ./config:/config
      - $HOME/Downloads:/downloads
    ports:
      - 8988:8988
    networks:
      - network

networks:
  network:
    name: multimediacenter
```

在选项中，监听端口设为随机，防止运营商封锁。 <br/>


## prowlarr {#prowlarr}

prowlarr 用来搜索资源，经一段时间使用后，个人感觉它比 Jackett 好用。同时，作为强迫症患者，也是为了使得这些 docker 凑成 `*arr` 系列。:smile: <br/>

```yaml
services:
  prowlarr:
    container_name: prowlarr
    image: lscr.io/linuxserver/prowlarr
    restart: unless-stopped
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
    volumes:
      - ./config:/config
    ports:
      - 9696:9696
    networks:
      - network

networks:
  network:
    name: multimediacenter
```

在索引器中添加 Indexers。我加了 TheRARBG 和 ThePirateBay。 <br/>

在 settings - apps 中，添加 radarr 和 sonarr，同步模式为完全同步，这样 radarr 和 sonarr 就能使用 prowlarr 来搜索资源了。 <br/>


## radarr {#radarr}

radarr 用来管理电影，设置好格式后，会根据要求自动下载。 <br/>

```yaml
services:
  radarr:
    container_name: radarr
    image: lscr.io/linuxserver/radarr
    restart: unless-stopped
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
    volumes:
      - ./config:/config
      - $HOME/Downloads:/downloads
      - $HOME/Videos/movies:/movies
    ports:
      - 7878:7878
    networks:
      - network

networks:
  network:
    name: multimediacenter
```

首先在 settings - indexers 中，检查一下上述 prowlarr 中选定的源是否已经存在。 <br/>

其次在 media managerment 中，设置允许重命名，radarr 会按统一格式处理文件名，方便管理。 <br/>

然后在 profile 中设置影片质量，我用 HD1080，进一步设置最高格式为 Blueray，（网速更好、存储更大，可以设更高）。这样当一个影片片源更新后，会自动下载更贵质量的来替换。 <br/>

还要在 download 中，设置好 qBittorrent，并测试通过，后续才能调用 qBittorrent 来下载。 <br/>

最后，还可以在 metadata 中增加刮削器，给影片添加信息。 <br/>


## sonarr {#sonarr}

sonarr 用来管理电视剧，主要是美剧。当剧集有新增时会自动下载，即自动追剧。 <br/>

```yaml
services:
  sonarr:
    container_name: sonarr
    image: lscr.io/linuxserver/sonarr
    restart: unless-stopped
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
    volumes:
      - ./config:/config
      - $HOME/Downloads:/downloads
      - $HOME/Videos/series:/tv
    ports:
      - 8989:8989
    networks:
      - network

networks:
  network:
    name: multimediacenter
```

sonarr 的设置和 radarr 的设置非常类似，不再赘述。稍有不同的是 sonarr 对于已经播出的电视剧不会自动下载，需要手工下载。 <br/>


## homarr {#homarr}

homarr 作为导航页，方便作为各个 docker 页面的入口，而且也有监控的功能。 <br/>

```yaml
services:
  homarr:
    image: ghcr.io/ajnart/homarr:latest
    container_name: homarr
    restart: unless-stopped
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
      - PASSWORD=12345wsdlh
    volumes:
      - ./configs:/app/data/configs
      - ./icons:/app/public/icons
      - ./data:/data
      - /var/run/docker.sock:/var/run/docker.sock:ro
    ports:
      - 7575:7575
    networks:
      - network

networks:
  network:
    name: multimediacenter
```

首先把用到的 docker 页面添加进来，再也不用记 IP 加端口访问了，点击图标即可。 <br/>

然后可以添加日历组件，会在日历中自动关联 sonarr 和 radarr 的更新日期，方便查看。 <br/>

还可以添加下载组件，观察 qBittorrent 的下载速度。以及种子组件，观看每个任务的下载进度。 <br/>


## alist {#alist}

上述几个组件已经完成了一条龙：在 radarr 或 sonarr 中搜索资源，通过 prowlarr 返回查询结果，使用 qBittorrent 下载，然后自动整理。在本地播放没有问题，但要让电视机或其他电脑来方便的观看，采用 alist 聚合资源更加便利。 <br/>

```yaml
services:
  alist:
    image: xhofe/alist-aria2
    container_name: alist
    restart: unless-stopped
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
    volumes:
      - ./data:/opt/alist/data
    ports:
      - 5244:5244
    networks:
      - network

networks:
  network:
    name: multimediacenter
```

在 alist 管理的存储界面中，添加本地挂载。建议电影和电视剧分两个目录挂载，方便分类观看。我在电视上安装了 kodi，使用的是 alist 的 webdav 链接。 <br/>


## ChineseSubFinder {#chinesesubfinder}

中文字幕是观看非母语影视不可缺少的一个环节，所以自动下载字幕非常有必要。 <br/>

```yaml
services:
  chinesesubfinder:
    image: allanpk716/chinesesubfinder
    container_name: chinesesubfinder
    restart: unless-stopped
    environment:
      - PUID=1000
      - PGID=1000
      - PERMS=true
      - TZ=Asia/Shanghai
      - UMASK=022
    volumes:
      - ./config:/config
      - $HOME/Videos:/media
    ports:
      - 19035:19035
      - 19037:19037
    networks:
      - network

networks:
  network:
    name: multimediacenter
```

第一次启动这个容器耗时比较久，起来后的设置倒是简单，配置正确的媒体路径就基本上不用管了。只不过有很多字幕还是缺失，这大概不是目前技术能解决的问题了。 <br/>

