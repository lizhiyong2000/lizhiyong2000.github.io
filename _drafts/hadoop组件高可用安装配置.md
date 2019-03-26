---
layout: "post"
title: "Hadoop组件高可用安装配置"
date: "2019-03-26 09:16"
categories: Hadoop
description: Hadoop组件高可用安装配置
tags: Hadoop
---

* content
{:toc}

<div class="postImg" style="background-image:url(http://carforeasy.cn/auth2.jpg)" ></div>

> “Spring Cloud Security OAuth2 是 Spring 对 OAuth2 的开源实现，与Spring Cloud技术栈无缝集成，使用默认配置，开发者只需要添加注解就能完成 OAuth2 授权服务的搭建。”

## 1. 配置准备
### 1.1 环境准备
| 主机名        | 主机IP       |         备注          |
| ------------- | ------------ |:---------------------:|
| lizhiyong-pc  | 192.168.2.42 |       namenode        |
| lizhiyong-vb  | 192.168.2.23 | namenode, journalnode |
| lizhiyong-old | 192.168.2.35 |       datanode        |
| zookeeper-0   | 10.42.0.159  |       zookeeper       |
| zookeeper-1   | 10.42.0.160  |       zookeeper       |
| zookeeper-2   | 10.42.0.161  |       zookeeper       |
在各台机器上配置/etc/hosts文件，保证各主机之间通过hostname能互相访问。
### 1.2 安装包
| 安装包    | 包名                             |
| --------- | -------------------------------- |
| hadoop    | hadoop-2.6.0-cdh5.15.0.tar.gz    |
| zookeeper | zookeeper-3.4.5-cdh5.15.0.tar.gz |
### 1.3 安装准备
在zookeeper三台主机上配置号

## Hadoop
+ hadoop-env.sh:

```shell
export JAVA_HOME=/usr/lib/jvm/java-8-oracle
export HADOOP_PID_DIR=/var/run/hadoop
export HADOOP_LOG_DIR=/var/log/hadoop/
```

+ slaves:
```
lizhiyong-old
```

+ core-site.xml
```xml
<configuration  xmlns:xi="http://www.w3.org/2001/XInclude">

   <property>
     <name>fs.defaultFS</name>
     <value>hdfs://test</value>
   </property>

   <property>
     <name>hadoop.tmp.dir</name>
     <value>/opt/data/hadoop/tmp</value>
   </property>

   <property>
     <name>io.file.buffer.size</name>
     <value>131072</value>
   </property>

 </configuration>

```

## 2. HDFS组件配置
+ hdfs-site.xml
```xml
<configuration  xmlns:xi="http://www.w3.org/2001/XInclude">
  <property>
    <name>dfs.namenode.handler.count</name>
    <value>500</value>
  </property>

  <!-- 目录配置 -->
  <property>
    <name>dfs.namenode.name.dir</name>
    <value>/opt/data/hadoop/namenode</value>
  </property>

  <property>
    <name>dfs.datanode.data.dir</name>
    <value>/opt/data/hadoop/datanode</value>
  </property>

  <property>
    <name>dfs.journalnode.edits.dir</name>
    <value>/opt/data/hadoop/edit</value>
  </property>

  <!-- 以下为高可用配置 -->
  <property>
    <name>dfs.nameservices</name>
    <value>test</value>
  </property>

  <property>
    <name>dfs.ha.namenodes.test</name>
    <value>nn1,nn2</value>
  </property>

  <property>
    <name>dfs.namenode.http-address.test.nn1</name>
    <value>lizhiyong-pc:50070</value>
  </property>

  <property>
    <name>dfs.namenode.http-address.test.nn2</name>
    <value>lizhiyong-vb:50070</value>
  </property>

  <property>
    <name>dfs.namenode.rpc-address.test.nn1</name>
    <value>lizhiyong-pc:9000</value>
  </property>

  <property>
    <name>dfs.namenode.rpc-address.test.nn2</name>
    <value>lizhiyong-vb:9000</value>
  </property>

  <property>
    <name>dfs.namenode.shared.edits.dir</name>
    <value>qjournal://lizhiyong-vb:8485/journalCLuster</value>
  </property>

  <property>
    <name>dfs.ha.automatic-failover.enabled</name>
    <value>true</value>
  </property>

  <property>
    <name>dfs.ha.fencing.methods</name>
    <value>shell(/bin/true)</value>
  </property>

  <property>
    <name>ha.zookeeper.quorum</name>
    <value>zookeeper-0:2181,zookeeper-1:2181,zookeeper-2:2181</value>
  </property>

  <property>
    <name>dfs.client.failover.proxy.provider.test</name>
    <value>org.apache.hadoop.hdfs.server.namenode.ha.ConfiguredFailoverProxyProvider</value>
  </property>

</configuration>
```

+ mapred-env.sh:
```shell
export JAVA_HOME=/usr/lib/jvm/java-8-oracle
export HADOOP_MAPRED_PID_DIR=/var/run/mapred
export HADOOP_MAPRED_LOG_DIR=/var/log/mapred
```

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



## 5. 参考链接
* [hadoop-HA(高可用)集群搭建](http://www.codebusy.cc/2018/04/16/hadoop-HA\(%E9%AB%98%E5%8F%AF%E7%94%A8\)%E9%9B%86%E7%BE%A4%E6%90%AD%E5%BB%BA/)

* [YARN-RM的高可用（High Availability）](https://www.zybuluo.com/changedi/note/675439)
