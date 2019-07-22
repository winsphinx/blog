+++
title = "Automatically Deploying Hugo Blog with Travis-CI"
date = 2019-07-22T21:29:00+08:00
lastmod = 2019-11-29T20:19:43+08:00
tags = ["CI", "hugo", "blog"]
categories = ["技术"]
draft = false
+++

本文介绍了使用 Travis CI 来部署 Hugo 博客的一个方法。

<!--more-->


## 设置代码仓库 {#设置代码仓库}

-   采用同一个 repo，创建两个分支：
    -   master 作为内容仓库
    -   gh-pages 作为发布页面
-   创建 .gitignore，内容为：

<!--listend-->

```text
public/*
themes/*
resources/*
```


## 创建新的 Token {#创建新的-token}

-   在 GitHub 上申请一个新的 [personal access token](https://github.com/settings/tokens/new)：
    -   Token description 也就是 Token 的名字，可以随便填
    -   勾选上 repo 下的所有项目，别的项目都不要选
    -   点 Generate token 生成 Token
-   记下 Token 的值，因为离开这个页面之后就没有机会再次查看了


## 设置 Travis CI {#设置-travis-ci}

-   登录[Travis CI](https://travis-ci.org/account/repositories)，选择对应的 repo
-   点 setting，填写 Environment Variables：
    -   Name 填写：GITHUB\_TOKEN
    -   Value 填写：刚刚在 GitHub 申请到的 Token 的值
-   点 Add 完成添加


## 编写 .travis.yml {#编写-dot-travis-dot-yml}

```yaml
language: go
# 分支白名单限制：只有 master 分支的提交才会触发构建
branches:
  only:
    - master
install:
  # 安装最新的 hugo
  - go get github.com/gohugoio/hugo
  # 安装主题
  - git clone <THEME_REPO>
script:
  # 运行 hugo 命令
  - hugo
after_script:
  # 部署
  - cd ./public
  - git init
  - git config user.name "<NAME>"
  - git config user.email "<MAIL>"
  - git add .
  - git commit -m "Update Blog By TravisCI With Build $TRAVIS_BUILD_NUMBER"
  # Github Pages
  - git push --force "https://$GITHUB_TOKEN@${GH_REF}" master:gh-pages
  # - git push --quiet "https://$GITHUB_TOKEN@${GH_REF}" master:gh-pages --tags
env:
 global:
   # Github Pages
   - GH_REF: github.com/<USER_NAME>/<REPO_NAME>
deploy:
  provider: pages # 重要，指定这是一份 github pages 的部署配置
  skip-cleanup: true # 重要，不能省略
  local-dir: public # 静态站点文件所在目录
  target-branch: gh-pages # 要将静态站点文件发布到哪个分支
  github-token: $GITHUB_TOKEN # 重要，$GITHUB_TOKEN 是变量，需要在 GitHub 上申请、再到配置到 Travis
  # fqdn:  # 如果是自定义域名，此处要填
  keep-history: true # 是否保持 target-branch 分支的提交记录
  on:
    branch: master # 博客源码的分支
```
