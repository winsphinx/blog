+++
title = "rsync"
date = 2024-04-14T09:14:00+08:00
lastmod = 2025-07-08T21:14:07+08:00
tags = ["rsync", "linux"]
categories = ["技术"]
draft = false
+++

rsync 是一个非常强大的文件同步工具，下面整理了几个常用的参数。 <br/>

<!--more-->


## 常用参数 {#常用参数}

-   `-a` (archive mode): <br/>
    保持文件的属性不变,包括权限、时间戳等。 <br/>
    ```shell
      rsync -a /source /destination
    ```
-   `-r` (recursive): <br/>
    递归复制子目录。 <br/>
    ```shell
      rsync -r /source /destination
    ```
-   `-z` (compress): <br/>
    传输过程中压缩数据,可以减少传输时间。 <br/>
    ```shell
      rsync -az /source /destination
    ```
-   `-v` (verbose): <br/>
    显示详细的传输过程。 <br/>
    ```shell
      rsync -avz /source /destination
    ```
-   `-n` (dry-run): <br/>
    模拟执行操作,但不实际传输文件。 <br/>
    ```shell
      rsync -avzn /source /destination
    ```
-   `-P` (partial + progress): <br/>
    断点续传,并显示传输进度。 <br/>
    ```shell
      rsync -avzP /source /destination
    ```
-   `--delete`: <br/>
    删除目标目录中存在但源目录中不存在的文件。 <br/>
    ```shell
      rsync -avz --delete /source /destination
    ```
-   `--exclude`: <br/>
    排除某些文件或目录不进行同步。 <br/>
    ```shell
      rsync -avz --exclude='*.tmp' /source /destination
    ```
-   `--include`: <br/>
    包含某些文件或目录进行同步。 <br/>
    ```shell
      rsync -avz --include='*.txt' --exclude='*' /source /destination
    ```
-   `--backup`: <br/>
    备份目标目录中已存在的文件。 <br/>
    ```shell
      rsync -avz --backup /source /destination
    ```

