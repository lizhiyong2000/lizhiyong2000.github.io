---
layout: "post"
title: "Linux常用命令记录"
date: "2019-02-15 14:35"
---

## 1. 基础命令

### 1.1 find命令


### 1.2 grep命令

### 1.3 awk命令
+ 根据关键字找出进程并kill
```shell
ps -ef | grep -E "zookeeper" | grep -v 'grep' | awk '{print $2}' | xargs kill -s 9
```


## 1.4 sed命令
+ 替换跨行内容

```shell
:t
/\/\*/,/\*\// {
/\*\//!{ $!{ N; bt } }
s/\/\*.*\*\///;
}
```

## 2. 网络配置

### 2.1 ip命令

### 2.2 ss命令

### 2.3 iptables命令
+ 添加端口映射
```shell
sudo iptables -t nat -A PREROUTING -d 192.168.2.42 -p tcp --dport 32717 -j DNAT --to-destination 192.168.2.26:32717
sudo iptables -t nat -A POSTROUTING -d 192.168.2.26 -p tcp --dport 32717 -j SNAT --to 192.168.2.42


sudo iptables -t nat -A PREROUTING -d 192.168.2.42 -p tcp --dport 32727 -j DNAT --to-destination 192.168.2.26:32727
sudo iptables -t nat -A POSTROUTING -d 192.168.2.26 -p tcp --dport 32727 -j SNAT --to 192.168.2.42


sudo iptables -t nat -A PREROUTING -d 192.168.2.42 -p tcp --dport 32737 -j DNAT --to-destination 192.168.2.26:32737
sudo iptables -t nat -A POSTROUTING -d 192.168.2.26 -p tcp --dport 32737 -j SNAT --to 192.168.2.42
```
+ 删除映射规则
```shell
sudo iptables -t nat -D PREROUTING  1
sudo iptables -t nat -D PREROUTING  2
sudo iptables -t nat -D PREROUTING  3

sudo iptables -t nat -D POSTROUTING  1
sudo iptables -t nat -D POSTROUTING  2
sudo iptables -t nat -D POSTROUTING  3
sudo iptables -t nat -L
```

## 3. 软件包安装

###  3.1 apt

###  3.2 dpkg

### 3.3 yum

### 3.4 rpm

## 参考链接
* [用sed替换跨行内容](http://www.fwolf.com/blog/post/346)
