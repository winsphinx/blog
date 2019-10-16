+++
title = "Interoperating between Windows and WSL"
date = 2019-10-16T18:48:00+08:00
lastmod = 2022-05-02T10:15:49+08:00
tags = ["WSL", "Windows"]
categories = ["技术"]
draft = false
+++

本文简单介绍了 Windows 与 WSL(Windows Subsystem for Linux)之间的互操作。 <br/>

<!--more-->


## Run WSL from Windows {#run-wsl-from-windows}

1.  Run Windows Command Prompt(CMD or PowerShell). <br/>
2.  Simply add `wsl` before Windows command. <br/>

    ```shell
       wsl sudo apt update
    ```
3.  Mix WSL and Windows commands. <br/>

    ```shell
       wsl ls -la | findstr "foo"
       dir | wsl grep foo
    ```


## Run Windows Tools from WSL {#run-windows-tools-from-wsl}

1.  Run Linux Shell(Bash or others). <br/>
2.  Simply run windows application with extension `.exe`. <br/>

    ```shell
       notepad.exe
    ```
3.  Mix WSL and Windows commands. <br/>

    ```shell
       $ ls -la | findstr.exe "foo"
       $ cmd.exe /c dir | grep foo
    ```