---
layout: "post"
title: "Hadoop组件安装配置"
date: "2019-03-26 09:16"
categories: Hadoop
description: 利用Kafka和ELK搭建日志监控
tags: Hadoop HDFS YARN MAPRED
---

* content
{:toc}

<div class="postImg" style="background-image:url(http://carforeasy.cn/auth2.jpg)" ></div>

> “Spring Cloud Security OAuth2 是 Spring 对 OAuth2 的开源实现，与Spring Cloud技术栈无缝集成，使用默认配置，开发者只需要添加注解就能完成 OAuth2 授权服务的搭建。”

## 1. 配置准备


## 2. HDFS组件配置
### 2.1 NameNode配置

### 2.2 DataNode配置

### 2.3 NameNode HA 配置

```
sudo su hdfs -l -s /bin/bash -c 'ulimit -c unlimited ;  /opt/cdh/hadoop/sbin/hadoop-daemon.sh --config /opt/cdh/hadoop/etc/hadoop start namenode 2>&1 '
```

## 3. YARN组件配置
### 3.1 ResourceManager配置
### 3.2 NodeManager配置
### 3.3 ResourceManager HA 配置

```shell
$ yarn rmadmin -getServiceState rm1
active
$ yarn rmadmin -getServiceState rm2
standby
```

## 4. MAPRED组件配置
