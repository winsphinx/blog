+++
title = "Automatically Creating PDF from LaTeX with Github Actions"
date = 2021-04-12T18:02:00+08:00
lastmod = 2021-05-08T17:55:39+08:00
tags = ["LaTeX", "CI"]
categories = ["技术"]
draft = false
+++

自从体验了 Github Actions，感觉非常好用。之前介绍过使用 Appveyor 来生成 PDF[^1]，现在介绍下使用 Github Actions 来生成 PDF，并发布到 release 的步骤。
[^1]:  [Automatically Creating PDF from LaTeX with Appveyor]({{< relref "automatically-creating-pdf-from-latex-with-appveyor" >}})

<!--more-->

例子如下：

```yaml
name: Build LaTeX

on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

jobs:
  build:

    runs-on: ubuntu-latest  # 目前只能在linux下

    steps:
    - name: Set up Git repository
      uses: actions/checkout@v2

    - name: Build LaTeX
      uses: xu-cheng/latex-action@v2
      with:
        root_file: fei.tex
        latexmk_use_xelatex: true  # 为了支持中文，使用xelatex

    - name: Create GitHub release
      uses: marvinpinto/action-automatic-releases@latest
      with:
        repo_token: "${{ secrets.GITHUB_TOKEN }}"
        automatic_release_tag: latest
        prerelease: false
        files:
          filename.pdf  # 生成的 pdf，发布到 release
```
