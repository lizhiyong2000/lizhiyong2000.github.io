---
layout: "post"
title: "Linux常用包管理系统及命令总结.md"
date: "2019-04-23 10:34"
---




## 3. 软件包安装

###  3.1 apt

###  3.2 dpkg

### 3.3 yum

自动搜索最快镜像插件：   yum install yum-fastestmirror
安装yum图形窗口插件：    yum install yumex
查看可能批量安装的列表： yum grouplist

1 安装
yum install 全部安装
yum install package1 安装指定的安装包package1
yum groupinsall group1 安装程序组group1

2 更新和升级
yum update 全部更新
yum update package1 更新指定程序包package1
yum check-update 检查可更新的程序
yum upgrade package1 升级指定程序包package1
yum groupupdate group1 升级程序组group1

3 查找和显示
yum info package1 显示安装包信息package1
yum list 显示所有已经安装和可以安装的程序包
yum list package1 显示指定程序包安装情况package1
yum groupinfo group1 显示程序组group1信息yum search string 根据关键字string查找安装包

4 删除程序
yum remove &#124; erase package1 删除程序包package1
yum groupremove group1 删除程序组group1
yum deplist package1 查看程序package1依赖情况

5 清除缓存
yum clean packages 清除缓存目录下的软件包
yum clean headers 清除缓存目录下的 headers
yum clean oldheaders 清除缓存目录下旧的 headers
yum clean, yum clean all (= yum clean packages; yum clean oldheaders) 清除缓存目录下的软件包及旧的headers

### 3.4 rpm

1.查看有没安装某个rpm包(支持模糊匹配)

rpm -aq |grep openresty

rpm -q openresty-1.13.6.2-1.el7.centos.x86_64

2.查看rpm包安装的文件与目录（多了一个l）

rpm -ql openresty-1.13.6.2-1.el7.centos.x86_64