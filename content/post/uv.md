+++
title = "uv"
date = 2025-06-28T08:44:00+08:00
lastmod = 2025-07-08T21:17:34+08:00
tags = ["Python", "uv"]
categories = ["技术"]
draft = false
+++

uv 是一个 Python 包管理和虚拟环境工具。我用了一下觉得非常方便，特将使用流程记录如下： <br/>

<!--more-->


## 创建项目 {#创建项目}

首先根据需要的项目名称，执行： <br/>

```shell
uv init project_name
```

会生成一系列项目文件。包括主程序 maim.py，以及版本控制和环境设置的文件。 <br/>


## 创建虚拟环境 {#创建虚拟环境}

为了避免多个项目冲突，把各个项目的库文件隔离，建议创建虚拟环境。执行： <br/>

```shell
cd project_name
uv venv
```

默认路径为 .venv。也可以​`uv venv --python 3.11`​，会自动安装并创建相应版本的虚拟环境。 <br/>


## 添加/删除包 {#添加-删除包}

根据项目需要，添加/删除库文件，执行： <br/>

```shell
uv add package_name
uv remove package_name
```

会把用到的包信息记录在 pyproject.toml 文件中。如果这个包只在开发环境下使用，使用​`uv add --dev package_name`​则发布时不会把它打包进去。 <br/>


## 处理依赖 {#处理依赖}

要查看包之间的依赖关系，执行： <br/>

```shell
uv tree
```

会用树状列出依赖关系。 <br/>


## 同步 {#同步}

在其他电脑可以下载该项目后，需要同步用到的库文件等环境，执行： <br/>

```shell
uv sync
```

会把相应的包安装到虚拟环境下。 <br/>


## 更新 {#更新}

需要更新项目的库文件时，执行： <br/>

```shell
uv sync --upgrade
```

会自动修改库文件的版本信息。 <br/>


## 运行 {#运行}

在运行时，不再需要进入虚拟环境，只需要执行： <br/>

```shell
uv run main.py
```

就会自动调用虚拟环境，无需手动激活。这一步真的非常方便。 <br/>


## 工具 {#工具}

对于全局性工具，比如 pytest 所有项目都可能涉及，就最好把它作为工具安装，执行： <br/>

```shell
uv tool install pytest  # 安装
uv tool uninstall pytest  # 卸载
uv tool list  # 查看
uv tool upgrade pytest  # 升级单个包
uv tool upgrade --all  # 全部升级
```

就可以在全局直接运行 pytest。 <br/>

