+++
title = "tmux"
date = 2024-03-28T19:31:00+08:00
lastmod = 2025-07-08T21:12:07+08:00
tags = ["tmux", "linux"]
categories = ["技术"]
draft = false
+++

tmux（也称为终端多路复用器）是一个在终端窗口中创建和管理多个终端会话的工具。它允许您在单个终端窗口中同时运行多个终端会话或窗格，并在它们之间轻松切换。 <br/>

<!--more-->

tmux 的主要功能包括： <br/>


## 会话（Sessions） {#会话-sessions}

可以创建、重命名、关闭会话，以及在不同会话之间切换。每个会话可以包含多个窗口和窗格。会话可以在后台运行，即使您断开连接也可以保持会话状态。 <br/>
最简单的方式直接创建，默认的会话名称是 `0` ，再次创建则编号顺延： <br/>

```shell
tmux
```

如果需要指定会话名称创建： <br/>

```shell
tmux new-session -s <name>
```

要更改会话名称： <br/>

```shell
tmux rename-session -t <old-name> <new-name>
```

要重新进入某个会话： <br/>

```shell
tmux attach -t <name>
```

要删除某个会话： <br/>

```shell
tmux kill-session -t <name>
```


## 窗口（Windows） {#窗口-windows}

每个会话可以包含多个窗口，每个窗口都可以分割为多个窗格。您可以在窗口之间切换，创建新窗口，关闭窗口等。 <br/>

```text
<prefix> s        # 选择session
<prefix> $        # 重命名当前session
<prefix> C-z      # 挂起session
<prefix> d        # 分离session
<prefix> (        # 切换上一个session
<prefix> )        # 切换下一个session
<prefix> c        # 创建window
<prefix> w        # 选择window
<prefix> ,        # 重命名当前window
<prefix> &        # 关闭当前 window
<prefix> 数字键   # 根据编号（0-9）选择相应window
<prefix> '        # 输入名称或者数字选择window，因为当大于9时无法直接输入
```


## 窗格（Panes） {#窗格-panes}

窗格是窗口的分割部分，允许您在同一个窗口中同时查看多个终端。您可以水平或垂直分割窗格，并在窗格之间移动。 <br/>

```text
<prefix> !        # 把pane提升为window
<prefix> "        # 垂直分割window
<prefix> %        # 水平分割window
<prefix> o        # 轮选pane
<prefix> f        # 选择pane
<prefix> 方向键   # 根据方向键选择相应pane
<prefix> z        # 放大/缩小pane
<prefix> x        # 关闭当前pane
<prefix> q        # 显示pane编号
```


## 配置和插件 {#配置和插件}

tmux 可以通过配置文件进行自定义设置，您可以根据自己的需求定制 tmux 的外观、行为和功能。 <br/>

```text
# options
set -g prefix C-b
set -g prefix2 C-a

set -g mouse on
set -g mode-keys vi
set -g set-clipboard on

# keys
bind r source-file ~/.tmux.conf

bind - split-window -v
bind | split-window -h

bind -T copy-mode-vi v send -X begin-selection
bind -T copy-mode-vi C-v send -X rectangle-toggle
bind -T copy-mode-vi y send -X copy-selection-and-cancel
bind -T copy-mode-vi Escape send -X cancel

# plugins

## tmux plugin manager
set -g @plugin 'tmux-plugins/tpm'

## theme
set -g @plugin 'dracula/tmux'
set -g @dracula-show-powerline true
set -g @dracula-show-empty-plugins false
set -g @dracula-show-left-icon 'session'
set -g @dracula-plugins 'cpu-usage network network-bandwidth continuum time git attached-clients'
set -g @dracula-cpu-usage-label ' '
set -g @dracula-cpu-display-load true
set -g @dracula-network-bandwidth 'eth0'
set -g @dracula-network-bandwidth-interval 0
set -g @dracula-network-bandwidth-show-interface true
set -g @dracula-time-format '%b-%d %H:%M'
set -g @dracula-clients-minimum 2

## <prefix> + P to start/stop logging, + alt-p to capture screen, + alt-P to save history
set -g @plugin 'tmux-plugins/tmux-logging'

## persist tmux sessions after computer restart
set -g @plugin 'tmux-plugins/tmux-resurrect'
set -g @resurrect-capture-pane-contents 'on'

## automatically saves sessions every 15 minutes
set -g @plugin 'tmux-plugins/tmux-continuum'
set -g @continuum-save-interval '15'
set -g @continuum-restore 'on'

## automatically resize focus pane
set -g @plugin 'graemedavidson/tmux-pane-focus'
set -g @pane-focus-size '62'
set -g @pane-focus-direction '+'

## run all plugins
run '~/.tmux/plugins/tpm/tpm'
```

这是我的配置文件，调整了一些常用键，启用了鼠标（虽然我是键盘党，但也不排斥鼠标，毕竟选择窗口、拖动窗口大小之类的操作，用鼠标是最方便的，这也是在上面我没提到此类快捷键的原因），安装了主题和插件。其中： <br/>

-   tmux plugin manager 来管理插件: <br/>
    ```text
      <prefix> I        # 安装插件
      <prefix> U        # 升级插件
      <prefix> alt+u    # 清理插件
    ```
-   tmux-logging 用来记录 tmux 的文本： <br/>
    ```text
      <prefix> P        # 按一次开始记录当前pane，再按一次停止
      <prefix> alt+p    # 获取当前pane当前内容，相当于截屏
      <prefix> alt+P    # 获取当前pane全部内容，包括历史内容
    ```
-   tmux-resurrect 和 tmux-continuum 用来保存和恢复会话，这样即使重启了机器，打开 tmux 后 session 仍然和之前一样。 <br/>


## 其他 {#其他}

其他一些命令有： <br/>

```text
<prefix> [        # 进入复制模式，用光标定位到起点，按空格开始，移动光标选择，按回车结束
<prefix> ]        # 进入粘贴模式
<prefix> =        # 选择剪切板条目
<prefix> :        # 进入命令行
## 一些有用的命令行
break-pane (breakp)        # 把一个pane拆分为window
join-pane (joinp) -s 编号  # 把编号所在的window合并到当前window
join-pane (joinp) -t 编号  # 把当前window合并到编号所在的window
```

