+++
title = "Vagrant"
date = 2023-04-28T18:18:00+08:00
lastmod = 2023-04-28T18:50:39+08:00
tags = ["virtualization", "vagrant"]
categories = ["技术"]
draft = false
+++

Vagrant，一句话概括，即快速部署虚拟机的工具。 <br/>

<!--more-->


## 安装 vagrant {#安装-vagrant}

根据不同的操作系统平台，在 <https://www.vagrantup.com/> 选择相应版本安装。 <br/>


## 使用 vagrant {#使用-vagrant}


### 命令 {#命令}

-   下载虚拟机 <br/>
    ```shell
      vagrant box add <name>     # 添加镜像
      vagrant box list           # 查看镜像
      vagrant box remove <name>  # 删除镜像
    ```
    可以在 <https://app.vagrantup.com/boxes/search> 查找需要的虚拟机，提前下载。如果不下载的话，在后面用 up 启动的时候也会自动下载。 <br/>
-   初始化虚拟机 <br/>
    ```shell
      vagrant init <name>
    ```
-   启动虚拟机 <br/>
    ```shell
      vagrant up
    ```
    不同的系统有其对应默认的虚拟机，但也可以用 `--provider` 指定，如 hyperv、libvirt、virtualbox、VMware 等。 <br/>
-   重载虚拟机 <br/>
    ```shell
      vagrant reload
    ```
    在修改 vagrantfile 配置文件后需要重启生效。 <br/>
-   查看虚拟机 <br/>
    ```shell
      vagrant status
    ```
-   登录虚拟机 <br/>
    ```shell
      vagrant ssh
      vagrant rdp
    ```
    根据不同的虚拟机的操作系统，选用不同方式登录。 <br/>
-   停开虚拟机 <br/>
    ```shell
      vagrant suspend  # 挂起
      vagrant resume   # 恢复
      vagrant halt     # 关机
    ```
-   销毁虚拟机 <br/>
    ```shell
      vagrant destory
    ```


## 自定义 Vagrantfile {#自定义-vagrantfile}

使用 `vagrant init` 会生成一个 Vagrantfile。 <br/>

```text
# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure("2") do |config|
  # The most common configuration options are documented and commented below.
  # For a complete reference, please see the online documentation at
  # https://docs.vagrantup.com.

  # Every Vagrant development environment requires a box. You can search for
  # boxes at https://vagrantcloud.com/search.
  config.vm.box = "centos-7"

  # Disable automatic box update checking. If you disable this, then
  # boxes will only be checked for updates when the user runs
  # `vagrant box outdated`. This is not recommended.
  # config.vm.box_check_update = false

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine. In the example below,
  # accessing "localhost:8080" will access port 80 on the guest machine.
  # NOTE: This will enable public access to the opened port
  # config.vm.network "forwarded_port", guest: 80, host: 8080

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine and only allow access
  # via 127.0.0.1 to disable public access
  # config.vm.network "forwarded_port", guest: 80, host: 8080, host_ip: "127.0.0.1"

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  # config.vm.network "private_network", ip: "192.168.33.10"

  # Create a public network, which generally matched to bridged network.
  # Bridged networks make the machine appear as another physical device on
  # your network.
  # config.vm.network "public_network"

  # Share an additional folder to the guest VM. The first argument is
  # the path on the host to the actual folder. The second argument is
  # the path on the guest to mount the folder. And the optional third
  # argument is a set of non-required options.
  # config.vm.synced_folder "../data", "/vagrant_data"

  # Provider-specific configuration so you can fine-tune various
  # backing providers for Vagrant. These expose provider-specific options.
  # Example for VirtualBox:
  #
  # config.vm.provider "virtualbox" do |vb|
  #   # Display the VirtualBox GUI when booting the machine
  #   vb.gui = true
  #
  #   # Customize the amount of memory on the VM:
  #   vb.memory = "1024"
  # end
  #
  # View the documentation for the provider you are using for more
  # information on available options.

  # Enable provisioning with a shell script. Additional provisioners such as
  # Ansible, Chef, Docker, Puppet and Salt are also available. Please see the
  # documentation for more information about their specific syntax and use.
  # config.vm.provision "shell", inline: <<-SHELL
  #   apt-get update
  #   apt-get install -y apache2
  # SHELL
end
```

除去注释，实际仅为三行内容： <br/>

```text
Vagrant.configure("2") do |config|
  config.vm.box = "centos-7"
end
```

它是一个采用 ruby 语法的配置文件。HH 如果需要更多的调整，则需要变更其他配置。 <br/>

-   config.vm.network：可以配置网络，如端口转发、私有网络、公有网络； <br/>
-   config.vm.syncedfolder：可以配置同步目录； <br/>
-   config.vm.provider：可以调整虚机类型； <br/>
-   config.vm.provision：可以构造自动任务。 <br/>

