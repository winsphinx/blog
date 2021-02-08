+++
title = "Emacs 多点编辑"
date = 2021-02-08T17:59:00+08:00
lastmod = 2022-05-02T11:27:41+08:00
tags = ["emacs"]
categories = ["技术"]
draft = false
+++

Emacs 可以方便地对单文件实现多点编辑，也可以对多个文件同时多点编辑。 <br/>

<!--more-->


## 单文件编辑 {#单文件编辑}

光标放在要编辑的内容上，用 `SPC s e` (`M-x evil-iedit-state/iedit-mode`)进入 `iedit` 编辑模式。 <br/>


### 选择模式 {#选择模式}

| 按键  | 动作      |
|-----|---------|
| `ESC` | 退出编辑模式 |
| `TAB` | 切换选中  |
| `n`   | 选择下一个 |
| `N`   | 选择前一个 |
| `0`   | 跳到当前选中的头部 |
| `$`   | 跳到当前选中的尾部 |
| `gg`  | 跳到最先一个 |
| `G`   | 跳到最后一个 |
| `L`   | 限定在当前行 |
| `F`   | 限定在当前函数 |
| `J`   | 增加选中下一行 |
| `K`   | 增加选中上一行 |
| `V`   | 隐藏不相关的行 |


### 编辑模式 {#编辑模式}

| 按键  | 动作  |
|-----|-----|
| `A`   | 追加编辑 |
| `I`   | 插入编辑 |
| `S`   | 替换编辑 |
| `D`   | 删除内容 |
| `p`   | 粘贴内容 |
| `U`   | 转换为大写 |
| `C-U` | 转换为小写 |


## 多文件编辑 {#多文件编辑}

-   首先需要安装 `grep`, `rg`[^1], `ag`[^2], `ack`[^3], `pt`[^4] 等任意一个搜索工具。 <br/>


### Helm {#helm}

-   使用 `SPC s s` (`M-x helm-swoop`)查找，还可以进一步： <br/>
    -   用 `SPC s b` (`M-x spacemacs/helm-buffers-smart-do-search`)在同一 buffer 中查找； <br/>
    -   用 `SPC s d` (`M-x spacemacs/helm-dir-smart-do-search`)在同一目录下查找； <br/>
    -   用 `SPC s p` 或 `SPC /` (`M-x spacemacs/helm-project-smart-do-search`)在同一项目中查找； <br/>
    -   用 `SPC s f` (`M-x spacemacs/helm-files-smart-do-search`)在指定文件中查找。 <br/>
-   将查找结果用 `C-c C-e` 导出到单独 buffer <br/>
    -   在这个新 buffer 中使用 `SPC s e`​，将这个 buffer 当作单文件，按照上面的方法继续编辑。当然还可以用其他各种方式编辑； <br/>
    -   在编辑完成后用 `C-c C-c` 保存，或 `C-c C-k` 取消编辑。 <br/>


### ivy {#ivy}

-   使用 `C-s` 或者 `SPC s s` 或者 `M-x counsel-{grep|rg|ag|ack|pt}` 同样可以查找出多个匹配； <br/>
-   将查找结果用 `C-c C-o` 导出到单独 buffer，再用 `C-x C-q` 进入编辑模式； <br/>
    -   在这个新 buffer 中使用 `SPC s e`​，将这个 buffer 当作单文件，按照上面的方法继续编辑。当然还可以用其他各种方式编辑； <br/>
    -   在编辑完成后用 `C-c C-c` 保存，或 `C-c C-k` 取消编辑。 <br/>

[^1]: <https://github.com/BurntSushi/ripgrep> <br/>
[^2]: <https://github.com/ggreer/the_silver_searcher> <br/>
[^3]: <https://github.com/beyondgrep/ack3> <br/>
[^4]: <https://github.com/monochromegane/the_platinum_searcher> <br/>