---
layout: "post"
title: "Linux常用命令记录"
date: "2019-02-15 14:35"
---

## 1. 基础命令

### 1.1 find命令
+ 过滤掉Permission denied

```sh
find / -name *.service 2>&1|grep -v 'Permission denied'
```
### 1.2 grep命令
+ 根据正则表达式进行匹配

```sh
grep -E 'word1|word2' 文件名
```

### 1.3 awk命令
+ 根据关键字找出进程并kill

```sh
ps -ef | grep -E "zookeeper" | grep -v 'grep' | awk '{print $2}' | xargs kill -s 9
```

## 1.4 sed命令
+ 替换跨行内容

```sh
:t
/\/\*/,/\*\// {
/\*\//!{ $!{ N; bt } }
s/\/\*.*\*\///;
}
```

## 1.5 du命令

+ 查看子目录占用空间

```sh
du -h --max-depth=1
```



## 2. 网络配置

### 2.1 ip命令

+ 查看本机IPv4地址

```sh
$ ip -4 a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
2: enp0s31f6: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    inet 192.168.2.42/24 brd 192.168.2.255 scope global dynamic noprefixroute enp0s31f6
       valid_lft 72023sec preferred_lft 72023sec
3: wlp2s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    inet 192.168.1.106/24 brd 192.168.1.255 scope global dynamic noprefixroute wlp2s0
       valid_lft 76968sec preferred_lft 76968sec
9: tun0: <POINTOPOINT,MULTICAST,NOARP,UP,LOWER_UP> mtu 1492 qdisc fq_codel state UNKNOWN group default qlen 500
    inet 14.144.233.236 peer 14.144.233.235/32 scope global tun0
       valid_lft forever preferred_lft forever

```

### 2.2 ss命令

+ 查看监听端口(ss -lnt)

```sh
$ ss -lnt|grep 5900
LISTEN   0         5                   0.0.0.0:5900             0.0.0.0:*       
LISTEN   0         5                      [::]:5900                [::]:*  
```
+ 查看端口占用的进程 (ss -lntp)

```sh
$ ss -lntp|grep 5900
LISTEN   0         5                   0.0.0.0:5900             0.0.0.0:*        users:(("vino-server",pid=2117,fd=12))                                         
LISTEN   0         5                      [::]:5900                [::]:*        users:(("vino-server",pid=2117,fd=11))      
```



### 2.3 iptables命令
+ 添加端口映射

```sh
sudo iptables -t nat -A PREROUTING -d 192.168.2.42 -p tcp --dport 32717 -j DNAT --to-destination 192.168.2.26:32717
sudo iptables -t nat -A POSTROUTING -d 192.168.2.26 -p tcp --dport 32717 -j SNAT --to 192.168.2.42


sudo iptables -t nat -A PREROUTING -d 192.168.2.42 -p tcp --dport 32727 -j DNAT --to-destination 192.168.2.26:32727
sudo iptables -t nat -A POSTROUTING -d 192.168.2.26 -p tcp --dport 32727 -j SNAT --to 192.168.2.42


sudo iptables -t nat -A PREROUTING -d 192.168.2.42 -p tcp --dport 32737 -j DNAT --to-destination 192.168.2.26:32737
sudo iptables -t nat -A POSTROUTING -d 192.168.2.26 -p tcp --dport 32737 -j SNAT --to 192.168.2.42
```
+ 删除映射规则

```sh
sudo iptables -t nat -D PREROUTING  1
sudo iptables -t nat -D PREROUTING  2
sudo iptables -t nat -D PREROUTING  3

sudo iptables -t nat -D POSTROUTING  1
sudo iptables -t nat -D POSTROUTING  2
sudo iptables -t nat -D POSTROUTING  3
sudo iptables -t nat -L
```



## 参考链接
* [用sed替换跨行内容](http://www.fwolf.com/blog/post/346)
