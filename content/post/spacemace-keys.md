+++
title = "Spacemace Keys"
date = 2021-09-23T19:10:00+08:00
lastmod = 2022-03-01T19:44:41+08:00
tags = ["emacs"]
categories = ["技术"]
draft = false
+++

整理了 Spacemacs 的一些常用键。 <br/>

<!--more-->


## git {#git}

`SPC g s` <br/>

| 快捷键 | 描述                                    |
|-----|---------------------------------------|
| `s`   | stage（光标对应文件上）， 或直接在文件上 `spc g S` |
| `u`   | unstage（光标对应文件上） ，或直接在文件上 `spc g U` |
| `c c` | commit                                  |
| `l l` | log                                     |
| `t t` | tag                                     |
| `P m` | push                                    |
| `P T` | push tag                                |
| `d d` | diff                                    |
| `d s` | diff stage                              |
| `d u` | diff unstage                            |
| `d r` | diff range                              |
| `b c` | new branch                              |
| `b b` | switch branch                           |
| `m m` | merge (如：先 b b 到 master，再 m m 选 dev 分支) |
| `f u` | fetch                                   |
| `F u` | pull                                    |
| `y r` | ref                                     |


## ranger {#ranger}

`SPC a t r r` <br/>

| 快捷键    | 描述              |
|--------|-----------------|
| `?`       | 帮助              |
| `j/k`     | 下移/上移         |
| `h/l`     | 上级/下级         |
| `gh`      | HOME 目录         |
| `f`       | 打开文件          |
| `+`       | 创建目录          |
| `;C`      | 复制              |
| `R`       | 重命名/移动       |
| `D`       | 删除              |
| `;d ;x`   | 标记删除，然后执行 |
| `t`       | 标记              |
| `v`       | 反向标记          |
| `;U`      | 取消标记          |
| `S`       | 打开 Shell        |
| `=`       | 比较              |
| `C-c C-e` | 进入编辑模式（如多个文件重命名） |
| `C-C C-c` | 结束编辑模式      |
| `C-c C-k` | 退出编辑模式      |
| `B`       | 书签              |
| `m` _     | 给目录定义快捷键  |
| `um` _    | 取消快捷键        |
| `'` _     | 跳转到定义快捷键的目录 |
| `zP`      | 切换 ranger/deer 模式 |


## deft {#deft}

`SPC a r d` <br/>

| 快捷键      | 描述                                                  |
|----------|-----------------------------------------------------|
| `C-c C-q`   | 退出                                                  |
| `C-c C-c`   | 清空搜索关键字                                        |
| `C-c C-g`   | 刷新搜索结果                                          |
| `C-c C-l`   | 使用 minibuffer 编辑搜索关键字，在这里可以使用 M-p 和 M-n 来遍历之前搜索过的关键字。 |
| `C-c C-t`   | 切换搜索方式为渐进式搜索/正则搜索，默认 Deft 使用渐进搜索 |
| `C-p / C-n` | 定位到上一个/下一个文件处                             |
| `RET`       | 打开/新建文件                                         |
| `C-c C-r`   | 文件重命名                                            |
| `C-c C-d`   | 删除文件                                              |
| `C-c C-n`   | 快速创建文件                                          |
| `C-c C-m`   | 创建文件，但会提示输入文件名                          |


## python {#python}

| 快捷键                  | 描述        |
|----------------------|-----------|
| `spc f f`               | 打开 py 文件 |
| `spc m c c`             | 直接运行    |
| `spc m l`               | live mode   |
| `SPC m r i`             | 清理无效 import |
| `c-c c-p` 或 `spc m s i` | 进入 ipython |


## ein {#ein}

| 快捷键        | 描述              |
|------------|-----------------|
| `SPC a t i r` | 启动 ein          |
| `SPC a t i o` | 打开 ein          |
| `SPC a t i s` | 结束 ein          |
| `RET`         | 执行当前 cell     |
| `C-RET`       | （插入模式下）执行当前 cell |
| `S-RET`       | （插入模式下）执行并新建 cell |
| `, .`         | transient         |


## gist {#gist}

| 快捷键      | 描述                 |
|----------|--------------------|
| `SPC g g l` | gist 列表            |
| `SPC g g b` | 以当前 buffer 创建 gist |
| `SPC g g B` | 以当前 buffer 创建私有 gist |
| `SPC g g r` | 以当前区域创建 gist  |
| `SPC g g R` | 以当前区域创建私有 gist |
| `b` 或 `o`  | 打开                 |
| `+`         | 增加                 |
| `-`         | 删除                 |
| `f`         | 抓取                 |
| `y`         | 复制链接             |
| `/`         | 搜索                 |
| `g r`       | 刷新                 |


## easy-motion {#easy-motion}

| 快捷键              | 描述           |
|------------------|--------------|
| `g s s`             | 两键定位（支持中文） |
| `g s spc`           | 多键定位（本 buffer） |
| `g s /` 或 `spc j j` | 多键定位（全 buffer） |


## expand-region {#expand-region}

`SPC v` <br/>

| 快捷键 | 描述 |
|-----|----|
| v   | 选择更多 |
| V   | 选择更少 |
| e   | 编辑 |
| r   | 复位 |


## imenu {#imenu}

| 快捷键                | 描述 |
|--------------------|----|
| `SPC j i`             | 跳转目录 |
| `SPC b i` 或 `SPC T i` | 显示目录 |


## eshell {#eshell}

| 快捷键 | 描述       |
|-----|----------|
| s   | git status |
| d   | 打开目录   |
| e   | 打开文件   |
| z   | 跳转近期目录 |


## bookmark {#bookmark}

| 快捷键    | 描述     |
|-----------|----------|
| `C-x r m` | 设置书签 |
| `C-x r b` | 跳转书签 |
| `C-x r l` | 列出书签 |
