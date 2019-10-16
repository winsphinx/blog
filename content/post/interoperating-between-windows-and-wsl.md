+++
title = "Interoperating between Windows and WSL"
date = 2019-10-16T18:48:00+08:00
lastmod = 2021-02-24T20:14:09+08:00
tags = ["WSL", "Windows"]
categories = ["技术"]
draft = false
+++

本文简单介绍了 Windows 与 WSL(Windows Subsystem for Linux)之间的互操作。

<!--more-->


## Run WSL from Windows {#run-wsl-from-windows}

1.  Run Windows Command Prompt(CMD or PowerShell).
2.  Simply add `wsl` before Windows command.

    ```sh
       wsl sudo apt update
    ```
3.  Mix WSL and Windows commands.

    ```sh
       wsl ls -la | findstr "foo"
       dir | wsl grep foo
    ```


## Run Windows Tools from WSL {#run-windows-tools-from-wsl}

1.  Run Linux Shell(Bash or others).
2.  Simply run windows application with extension `.exe` .

    ```sh
       notepad.exe
    ```
3.  Mix WSL and Windows commands.

    ```sh
       $ ls -la | findstr.exe "foo"
       $ cmd.exe /c dir | grep foo
    ```
