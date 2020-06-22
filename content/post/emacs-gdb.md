+++
title = "Emacs GDB"
date = 2020-04-15T21:17:00+08:00
lastmod = 2020-04-15T21:23:32+08:00
tags = ["emacs"]
categories = ["技术"]
draft = false
+++

Use Emacs GDB to debug c/c++ programs.

<!--more-->


## Prepare: Compile {#prepare-compile}

Compile c/cpp with option `-g`:

**gcc prog.c -g -o proc**

or in Makefile:

**CFLAGS="-g" ./configure && make**


## Start: Run gdb {#start-run-gdb}


### Run gdb {#run-gdb}

`M-x gdb` to select a file.


### Set mode {#set-mode}

`gdb-mamy-windows` to switch single/multi windows mode.

`gdb-restore-windows` to restore windows.


## Debug: Set breakpoint {#debug-set-breakpoint}


### Set/Remove breakpoint {#set-remove-breakpoint}

`C-x C-a C-b` or `gud-break` to set a breakpoint.

`C-x C-a C-d` or `gud-remove` to remove a breakpoint.


### Run {#run}

`gud-go` to run, and stop on the breakpoint.


### Next/Step {#next-step}

`C-x C-a C-n` or `gud-next` to run a function.

`C-x C-a C-s` or `gud-step` to run into a function.

`C-x C-a C-f` or `gud-finish` to finish a function.

`C-x C-a C-u` or `gud-until` to run until the cursor line.

`C-x C-a C-r` or `gud-cont` to continue to run.


## View: Watch variables {#view-watch-variables}


### In the default locals buffer {#in-the-default-locals-buffer}

If not shown, `gdb-display-locals-buffer` to toggle.


### In the speedbar buffer {#in-the-speedbar-buffer}

`C-x C-a C-w` or `gud-watch` to add a variables.


### On mouse over {#on-mouse-over}

If not shown, `gud-tooltip-mode` to toggle.


## IO: Set IO or redirect {#io-set-io-or-redirect}


### Default IO buffer {#default-io-buffer}

`gdb-use-separate-io-buffer` to toggle.


### Redirect to files {#redirect-to-files}

In **gdb** buffer type: \*run < file.in > file.out
