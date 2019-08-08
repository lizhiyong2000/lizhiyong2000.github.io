---
layout: "post"
title: "Centos7软件安装"
date: "2019-04-02 16:21"
categories: Linux
description: Centos7软件安装
tags: Linux
---

* content
{:toc}

<div class="postImg" style="background-image:url(http://carforeasy.cn/共享VPN连接访问VPN网络-04322f2e.png)"></div>
> “公司内网VPN连接程序未提供Mac、Linux系统下的客户端，对于需要使用Mac、Linux进行的开发任务，可以通过安装Windows虚拟机，将虚拟机中VPN网络连接共享给宿主机进行访问。”



## 1. 网络配置

### 1.1 设置静态IP
```shell
vi /etc/sysconfig/network-scripts/ifcfg-ens33
```

```ini
BOOTPROTO="static"
ONBOOT="yes"
IPADDR=192.168.30.201
GATEWAY=192.168.30.254  
NETMASK=255.255.255.0  
DNS1=202.96.209.5
DNS2=202.96.209.133
```

### 1.2 添加DNS
```shell
nmcli con

nmcli con mod ens33 ipv4.dns "202.96.209.5 202.96.209.133 8.8.8.8 8.8.4.4"
```

### 1.3 关闭firewall

```shell
systemctl stop firewalld
systemctl disable firewalld
```
## 2. 软件源及工具

### 2.1 替换使用阿里镜像
```
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup

wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
```

```shell
yum clean all
yum makecache
yum update
```
### 2.2 安装yum工具

```shell
yum install -y yum-utils
```

### 2.3 安装OpenJDK

```shell
yum install -y java-1.8.0-openjdk-devel.x86_64
```

### 2.4 安装Python

```shell
yum install epel-release

yum update

yum install -y python36
```

### 2.5 安装OpenResty

```shell
yum-config-manager --add-repo https://openresty.org/yum/cn/centos/OpenResty.repo

yum install openresty

systemctl enable openresty
systemctl start openresty
```


### 2.6 安装Redis

```shell
yum install centos-release-scl

yum -y install redis

systemctl enable redis
systemctl start redis
```

### 2.7 安装MySQL
```shell
curl -LO http://dev.mysql.com/get/mysql57-community-release-el7-11.noarch.rpm

yum localinstall mysql57-community-release-el7-11.noarch.rpm

yum install mysql-community-server

systemctl enable mysqld
systemctl start mysqld

```


使用root进入mysql后，修改root密码，创建新的用户：

```
set global validate_password_policy=0;
set global validate_password_length=6;

alter user 'root'@'localhost' identified by '123456';

CREATE USER 'user123'@'%' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON * . * TO 'user123'@'%';
FLUSH PRIVILEGES;

```



### 2.8 NTP
```shell
yum install ntp
systemctl enable ntpd
systemctl start ntpd
timedatectl set-timezone Asia/Shanghai
timedatectl set-ntp yes

```

### 2.9 Docker

```shell
yum install -y yum-utils device-mapper-persistent-data lvm2

yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

yum install docker-ce


usermod -aG docker $(whoami)

systemctl enable docker.service

systemctl start docker.service
```

### 2.10 docker-compose

```shell
yum install epel-release

yum install -y python-pip

pip install docker-compose

```

## 参考链接


[CentOS 7 下 Yum 安装 MySQL 5.7](https://qizhanming.com/blog/2017/05/10/how-to-yum-install-mysql-57-on-centos-7)
