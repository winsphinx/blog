+++
title = "折腾 MPD"
date = 2023-10-05T19:06:00+08:00
lastmod = 2025-07-08T21:30:11+08:00
tags = ["music", "linux", "Docker", "mpd"]
categories = ["技术"]
draft = false
+++

mpd[^1]（Music Player Daemon），是一种音乐播放器守护进程，它可以在后台运行，不需要图形界面，可以通过网络或本地连接控制它。 <br/>
[^1]: <https://www.musicpd.org/> <br/>

mpd 支持多种音频格式，包括 MP3、FLAC、AAC、WAV 等，可以通过插件扩展其功能。mpd 可以通过各种客户端控制，如 mpc[^2]、ncmpc[^3]、Cantata[^4] 等。 <br/>
[^2]: <https://www.musicpd.org/clients/mpc/> <br/>
[^3]: <https://www.musicpd.org/clients/ncmpc/> <br/>
[^4]: <https://github.com/CDrummond/cantata> <br/>

<!--more-->


## 服务端 {#服务端}

mpd 的安装可以直接用软件包管理方式来安装，不过安装完后的配置还是要花一点时间。我的配置文件简化后如下： <br/>

```text
music_directory     "~/Music"
playlist_directory  "~/Music/playlists"
db_file             "~/.config/mpd/database"
log_file            "~/.config/mpd/log"
pid_file            "~/.config/mpd/pid"
state_file          "~/.config/mpd/state"
sticker_file        "~/.config/mpd/sticker.sql"


auto_update    "yes"                # auto update database

audio_output {
    type        "httpd"
    name        "HTTP Stream"
    encoder     "lame"              # optional, vorbis or lame
    port        "8000"
#   bind_to_address    "0.0.0.0"    # optional, IPv4 or IPv6
##  quality        "5.0"            # do not define if bitrate is defined
    bitrate        "128"            # do not define if quality is defined
    format         "44100:16:1"
    max_clients    "0"              # optional 0=no limit
}

audio_output {
    type          "pulse"
    name          "Pulse Output"
    mixer_type    "software"
}
```

把这个 mpd.conf 文件 放在 ~/.config/mpd/ 下，并用 touch 建好对应的文件。然后运行一下 mpd 看看能不能顺利启动。一般错误有以下几个原因： <br/>

-   上述新建的文件没对应或者访问权限问题 <br/>
-   端口 6600 被占用，用 `ss -tpl | grep 6600` 查看 <br/>
-   用户名、用户组不匹配 <br/>
-   `audio_output` 配置不正确 <br/>

等 mpd 命令行启动正确后，用 `mpd --kill` 杀掉进程，使用 `systemctl` 启动。 <br/>

```shell
systemctl --user enable mpd.socket
systemctl --user start mpd.socket
```

mpd.socket 会监听 6600 端口，来触发 mpd.service，启动 mpd 播放音乐。 <br/>


## 客户端 {#客户端}

最基础的客户端是 mpc，常用的一些命令有： <br/>

-   mpc ls               # 查看音乐库 <br/>
-   mpc add              # 把音乐加进队列 <br/>
-   mpc clear            # 清空队列 <br/>
-   mpc play|pause|stop  # 播放|暂停|停止音乐 <br/>
-   mpc next|prev        # 下一首|上一首音乐 <br/>
-   mpc lsplaylists      # 查看歌单 <br/>
-   mpc save|load|rm X   # 保存|加载|删除歌单 <br/>
-   mpc search|find      # 模糊|精确查找音乐 <br/>

举一个复杂点的例子：查找歌手为“班得瑞”的音乐，加入播放队列，并保存为“Bandari.m3u”的歌单方便今后使用： <br/>

```shell
mpc search artist "bandari" | mpc add | mpc save Bandari
```

如果觉得 mpc 纯命令行不方便，可以使用 TUI 的 ncmpc、GUI 的 Cantata、等等，它有各种各样的客户端[^5]，总有一款适用个性化的使用场景。 <br/>
[^5]: <https://wiki.archlinux.org/title/Music_Player_Daemon#Clients> <br/>


## 番外 {#番外}

我的使用场景是在一台服务器上存放了很多音乐，为了方便在其他的电脑手机等各种设备接入播放，又不想在每个设备安装客户端，最简单的也最一致的操作方式，就是使用浏览器播放，因此经过一番折腾，最终选用了 myMPD[^6]。采用了 Docker 的安装方式，与软件作者给出的不同，我的 docker-compose.yml 如下： <br/>
[^6]: <https://github.com/jcorporation/myMPD> <br/>

```yaml
services:
  myMPD:
    image: ghcr.io/jcorporation/mympd/mympd
    container_name: mympd
    environment:
      - UMASK_SET=022
      - MYMPD_SSL=false
      - MYMPD_HTTP_PORT=80
    ports:
      - 18000:80
    volumes:
      - $XDG_RUNTIME_DIR/mpd/socket:/run/mpd/socket
      - $HOME/Music/:/music/:ro
      - $HOME/Music/playlists/:/playlists/:ro
      - $HOME/Docker/myMPD/workdir:/var/lib/mympd/
      - $HOME/Docker/myMPD/cachedir:/var/cache/mympd/
    restart: unless-stopped
```

在 myMPD 的设置-特性中，启用本地播放，就可以在浏览器中方便的管理、控制和播放音乐了。

