+++
title = "Automatically Creating PDF from LaTeX with Appveyor"
date = 2019-11-29T20:16:00+08:00
lastmod = 2022-05-02T11:06:05+08:00
tags = ["LaTeX", "CI"]
categories = ["技术"]
draft = false
+++

本文介绍了使用 Appveyor CI 自动从 \\(\LaTeX\\) 生成 PDF 并发布到 Github Release 的两个方法。 <br/>

<!--more-->


## 创建密钥 {#创建密钥}

首先在<https://github.com/settings/tokens>上创建密钥。根据 github 仓库的权限的不同，最小权限可设为 `repo` 或 `public_repo`​。 <br/>


## 编写 appveyor.yml {#编写-appveyor-dot-yml}

本来使用 windows 的镜像加上 `choco install miktex` 来生成是最简单的，而且对中文的支持很好。 <br/>

```yaml
version: '1.0.{build}'
skip_tags: true

install:
  - ps: choco install -y miktex
  - cmd: refreshenv

build_script:
  - cmd: pdflatex  --synctex=1 -interaction=nonstopmode -file-line-error -recorder  FILENAME.tex
  - cmd: pdflatex  --synctex=1 -interaction=nonstopmode -file-line-error -recorder  FILENAME.tex
  - cmd: pdflatex  --synctex=1 -interaction=nonstopmode -file-line-error -recorder  FILENAME.tex

artifacts:
  - path: FILENAME.pdf
    name: FILENAME

deploy:
  description: ''
  provider: GitHub
  auth_token:
    secure: YOUR_AUTH_TOKEN
  artifact: essays.pdf
  force_update: true
  draft: false
  prerelease: false
  appveyor_repo_tag: false
```

但是非常遗憾的是<https://chocolatey.org>上的 MiKTex 安装包的版本老是滞后，经常导致安装失败。经过多次试验，采用 Ubuntu 镜像来安装 Texlive，再使用 xelatex 来支持中文。 <br/>

```yaml
version: '1.0.{build}'
skip_tags: true

image:
  - Ubuntu

install:
  - sh: sudo apt-get update -y
  - sh: sudo apt-get install texlive-lang-all texlive-latex-extra texlive-xetex -y

build_script:
  - sh: xelatex FILENAME.tex
  - sh: xelatex FILENAME.tex
  - sh: xelatex FILENAME.tex

artifacts:
  - path: FILENAME.pdf
    name: FILENAME

deploy:
  description: ''
  provider: GitHub
  auth_token:
    secure: YOUR_AUTH_TOKEN
  artifact: essays.pdf
  force_update: true
  draft: false
  prerelease: false
  appveyor_repo_tag: false
```