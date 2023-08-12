+++
title = "Build Docker with Github Actions"
date = 2023-08-12T15:54:00+08:00
lastmod = 2023-08-12T16:09:00+08:00
tags = ["Docker", "CI"]
categories = ["技术"]
draft = false
+++

本文介绍两种利用 Github Actions 生成 Docker 镜像的方法。 <br/>

<!--more-->


## 在 DockerHub {#在-dockerhub}

这个镜像会生成在<https://hub.docker.com> ，这是大多数的选择。 <br/>

**注意点**​： <br/>

-   需要项目仓库的 Secrets - Actions 中，新建两个变量 `DOCKERHUB_USERNAME`​、​`DOCKERHUB_PASSWORD`​，其值分别是 DockerHub 的用户名和密码； <br/>
-   DockerHub 不会自动使用 Github 的 README，如果需要显示它，要额外增加一个 Action。 <br/>

<!--listend-->

```yaml
name: Build and Push Docker Image

on:
  push:
    branches:
      - master

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_PASSWORD }}

      - name: Build and Push Docker Image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: Username/Imagename:latest

      - name: Docker Hub Description
        uses: peter-evans/dockerhub-description@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_PASSWORD }}
          repository: Username/Imagename
```


## 在 Github {#在-github}

这个镜像会生成在<https://ghcr.io> ，可以通过 GitHub 项目的 _Packages_ 访问，与 GitHub 的关联会更紧密，比如能自动使用 GitHub 的 README，以及版本管理功能。 <br/>

**注意点**​： <br/>

-   需要在项目仓库的 Settings - Actions - General 中，打开 `Read adnd write permission`​。 <br/>

<!--listend-->

```yaml
name: Build and Push Docker Image

on:
  push:
    branches:
      - master

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and Push Docker Image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ghcr.io/Username/Imagename:latest
```

