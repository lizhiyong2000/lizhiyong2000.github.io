---
layout: "post"
title: "VirtualBox复制虚拟机"
date: "2019-04-25 09:57"
categories: VirtualBox
description: VirtualBox复制虚拟机
tags: VirtualBox Centos
---

* content
{:toc}

<div class="postImg" style="background-image:url(http://carforeasy.cn/virtualbox复制虚拟机-bd89b5c3.png)"></div>
> “VirutalBox是一款开源的虚拟机软件，使用起来比较简单，能跨平台使用，比起VMWare Workstation来说更适合个人开发者使用。通常在使用VirtualBox搭建集群环境的过程中需要使用多台虚拟机，这时候就需要使用VirtualBox提供的虚拟机复制功能了，本文将介绍两种虚拟机的复制方式。”





##虚拟机复制

VirutalBox软件自身提供了复制虚拟机的功能，从当前已有的虚拟机可以通过菜单方便的进行虚拟机的复制。另外，如果仅有虚拟机硬盘文件（vdi），也可以直接从硬盘文件创建新的虚拟机进行复制，下面将分别介绍这两种方法。

###通过复制菜单复制

通过菜单进行复制和我们在系统中复制文件差不多，在已有的虚拟机上右键点击，选择“复制”，按照步骤进行即可。

![](http://carforeasy.cn/virtualbox复制虚拟机-7027b022.png)

复制时可以选择复制类型，通常选择完全复制。

![](http://carforeasy.cn/virtualbox复制虚拟机-64114788.png)


###通过VDI硬盘文件复制

在仅有VDI硬盘文件时，也是可以进行虚拟机复制的。通过创建新的虚拟机，然后挂载复制的VDI硬盘文件即可。不过，在挂载硬盘前需要对复制的硬盘重新设置UUID，不然会因为UUID重复而导致硬盘无法挂载。
+ 新建虚拟机
![](http://carforeasy.cn/virtualbox复制虚拟机-74a7971f.png)

+ 虚拟机路径
![](http://carforeasy.cn/virtualbox复制虚拟机-2dd23ce9.png)

+ 选择硬盘文件
![](http://carforeasy.cn/virtualbox复制虚拟机-e48a94ba.png)

+ 添加硬盘（此时硬盘文件还未复制，等后面复制好再添加）
![](http://carforeasy.cn/virtualbox复制虚拟机-5d1e01a8.png)

+ 复制硬盘
![](http://carforeasy.cn/virtualbox复制虚拟机-851b94d5.png)

+ 重新设置UUID
![](http://carforeasy.cn/virtualbox复制虚拟机-aae0af55.png)

+ 以下为以上步骤操作动画：
![](http://carforeasy.cn/virtualbox复制虚拟机-2d11ca57.gif)


##虚拟机系统修改（centos为例）
虚拟机复制完成后，由于主机名和IP地址都是相同的配置，通常需要进行修改。
###修改主机名
```shell
hostnamectl set-hostname newhost
```
###修改ip地址
修改 /etc/sysconfig/network-scripts/ifcfg-enpn0s3 进行修改。

###文件系统修复
对系统进行修改后会出现文件系统错误，无法启动，进入修复模式后进行修复。
```shell
xfs_repair -L /dev/mapper/centos-root
```
![](http://carforeasy.cn/virtualbox复制虚拟机-99afaeb2.gif)

## 参考链接
[virtualbox复制虚拟机](http://frainmeng.github.io/2015/11/04/virtualbox%E5%A4%8D%E5%88%B6%E8%99%9A%E6%8B%9F%E6%9C%BA/)
[Centos 7 LVM xfs文件系统修复](https://www.mgcn2.com/zhishi/linux/2649.html)
