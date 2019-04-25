---
layout: "post"
title: "Hadoop集群启用Kerberos后动态增加删除节点"
date: "2019-04-25 18:29"
categories: Hadoop
description:  "Hadoop集群启用Kerberos后动态增加删除节点"
tags: Hadoop
---

* content
{:toc}

<div class="postImg" style="background-image:url(http://carforeasy.cn/hadoop集群启用kerberos后动态增加删除节点-9fc68d87.png)"></div>
> “Hadoop集群部署以后，通常需要对节点进行扩容，以满足不断增加的存储和计算需要，本文将对已配置Kerberos认证的测试集群进行DataNode、NodeManager的增删操作。”





Hadoop集群部署以后，通常需要对节点进行扩容，以满足不断增加的存储和计算需要，本文将对已配置Kerberos认证的测试集群进行DataNode、NodeManager的增删操作。
## 准备工作
### 安装Hadoop并进行配置
当前集群节点状况：
host-104、host-105：安装NameNode，ResourceManager
host-103：安装datanode

新增加节点： host-106、 host-107、 host-108

在新增节点上，Hadoop的安装配置与其他节点一致，可以直接将相关文件从其他节点远程复制，这里不做描述。

### 准备Kerberos client及配置

kerberos的安装配置也与其他节点一致，这里不做描述，后续将基于此配置进行生成keytab操作。
### 修改/etc/hosts文件
在集群中的节点统一更新hosts文件。

```ini
192.168.2.101 host-101
192.168.2.102 host-102
192.168.2.103 host-103
192.168.2.104 host-104
192.168.2.105 host-105
192.168.2.106 host-106
192.168.2.107 host-107
192.168.2.108 host-108
```
## HDFS集群添加、删除DataNode节点

### 生成keytab文件

+ 添加principal

  ```
  kadmin -p root/admin@CTYUN.COM -w 123456 -q 'addprinc -randkey datanode/host-106@CTYUN.COM'
  kadmin -p root/admin@CTYUN.COM -w 123456 -q 'addprinc -randkey HTTP/host-106@CTYUN.COM'

  kadmin -p root/admin@CTYUN.COM -w 123456 -q 'addprinc -randkey datanode/host-107@CTYUN.COM'
  kadmin -p root/admin@CTYUN.COM -w 123456 -q 'addprinc -randkey HTTP/host-107@CTYUN.COM'

  kadmin -p root/admin@CTYUN.COM -w 123456 -q 'addprinc -randkey datanode/host-108@CTYUN.COM'
  kadmin -p root/admin@CTYUN.COM -w 123456 -q 'addprinc -randkey HTTP/host-108@CTYUN.COM'
  ```
+ 导出keytab文件

  - host-106
  ```
  kadmin -p root/admin@CTYUN.COM -w 123456 -q 'xst -k /etc/security/keytab/hdfs/hdfs.keytab datanode/host-106@CTYUN.COM'
  kadmin -p root/admin@CTYUN.COM -w 123456 -q 'xst -k /etc/security/keytab/hdfs/hdfs.keytab HTTP/host-106@CTYUN.COM'
  ```
  - host-107
  ```
  kadmin -p root/admin@CTYUN.COM -w 123456 -q 'xst -k /etc/security/keytab/hdfs/hdfs.keytab datanode/host-107@CTYUN.COM'
  kadmin -p root/admin@CTYUN.COM -w 123456 -q 'xst -k /etc/security/keytab/hdfs/hdfs.keytab HTTP/host-106@CTYUN.COM'
  ```
  - host-108
  ```
  kadmin -p root/admin@CTYUN.COM -w 123456 -q 'xst -k /etc/security/keytab/hdfs/hdfs.keytab datanode/host-108@CTYUN.COM'
  kadmin -p root/admin@CTYUN.COM -w 123456 -q 'xst -k /etc/security/keytab/hdfs/hdfs.keytab HTTP/host-108@CTYUN.COM'
  ```

+ 修改keytab权限
chown hdfs:hadoop /etc/security/keytab/hdfs/hdfs.keytab

### 添加DataNode节点

+ 启动datanode
mkdir -p /var/run/hadoop && chown hdfs:hadoop /var/run/hadoop
mkdir -p /opt/data/hadoop/datanode && chown hdfs:hadoop /opt/data/hadoop/datanode
cp /opt/emr-agent/jsvc/jsvc /opt/cdh/hadoop/libexec/
/opt/cdh/hadoop/sbin/hadoop-daemon.sh --config /opt/cdh/hadoop/etc/hadoop start datanode 2>&1

+ NameNode上刷新节点
/usr/bin/sudo su hdfs -l -s /bin/bash -c 'ulimit -c unlimited ;  /opt/cdh/hadoop/bin/hdfs dfsadmin -refreshNodes'

在UI中查看节点状态：
  ![](http://carforeasy.cn/hadoop集群启用kerberos后动态增加删除节点-6bf4fe13.png)

### 删除DataNode节点
+ 在hdfs-site.xml文件中加入如下配置
```xml
<property>
    <name>dfs.hosts.exclude</name>
    <value>/opt/cdh/hadoop/etc/hadoop/hdfs_excludes</value>
</property>  
```
hdfs_excludes中写入要删除的DataNode节点名
host-106
host-108


+ NameNode上刷新节点
```sh
/usr/bin/sudo su hdfs -l -s /bin/bash -c 'ulimit -c unlimited ;  /opt/cdh/hadoop/bin/hdfs dfsadmin -refreshNodes'
```

在UI中查看节点状态：
  ![](http://carforeasy.cn/hadoop集群启用kerberos后动态增加删除节点-c9ea6c41.png)

下线完成后节点状态：
  ![](http://carforeasy.cn/hadoop集群启用kerberos后动态增加删除节点-05d0e39e.png)



### Yarn集群添加NodeManager
+ 添加principal
  ```shell
  kadmin -p root/admin@CTYUN.COM -w 123456 -q 'addprinc -randkey nodemanager/host-106@CTYUN.COM'

  kadmin -p root/admin@CTYUN.COM -w 123456 -q 'addprinc -randkey nodemanager/host-107@CTYUN.COM'

  kadmin -p root/admin@CTYUN.COM -w 123456 -q 'addprinc -randkey nodemanager/host-108@CTYUN.COM'
  ```

+ 导出keytab文件
  - host-106

  ```shell
  kadmin -p root/admin@CTYUN.COM -w 123456 -q 'xst -k /etc/security/keytab/yarn/yarn.keytab nodemanager/host-106@CTYUN.COM'
  ```

  - host-107

  ```shell
  kadmin -p root/admin@CTYUN.COM -w 123456 -q 'xst -k /etc/security/keytab/yarn/yarn.keytab nodemanager/host-107@CTYUN.COM'
  ```
  - host-108
  ```shell
  kadmin -p root/admin@CTYUN.COM -w 123456 -q 'xst -k /etc/security/keytab/yarn/yarn.keytab nodemanager/host-108@CTYUN.COM'
  ```

+ 修改keytab权限
  ```sh
  chown yarn:hadoop /etc/security/keytab/yarn/yarn.keytab
  ```

  ### 添加NodeManager节点

+ 启动NodeManager
  ```sh
  mkdir -p /var/run/yarn && chown yarn:hadoop /var/run/yarn
  /usr/bin/sudo su yarn -l -s /bin/bash -c 'ulimit -c unlimited ;  /opt/cdh/hadoop/sbin/yarn-daemon.sh start nodemanager 2>&1'
  ```

+ ResourceManager上刷新节点
  ```sh
  /usr/bin/sudo su yarn -l -s /bin/bash -c 'kinit -t /etc/security/keytab/yarn/yarn.keytab  resourcemanager/host-105@CTYUN.COM;/opt/cdh/hadoop/bin/yarn --config /opt/cdh/hadoop/etc/hadoop rmadmin -refreshNodes '


  /usr/bin/sudo su yarn -l -s /bin/bash -c 'kinit -t /etc/security/keytab/yarn/yarn.keytab  resourcemanager/host-105@CTYUN.COM;/opt/cdh/hadoop/bin/yarn node -list '
  ```
在UI中查看节点状态：
  ![](http://carforeasy.cn/hadoop集群启用kerberos后动态增加删除节点-a20b1a58.png)


  ### 删除NodeManager节点

  + 在ResourceManager的yarn-site.xml文件中加入如下配置
  ```xml
  <property>
    <name>yarn.resourcemanager.nodes.exclude-path</name>
    <value>/opt/cdh/hadoop/etc/hadoop/yarn_excludes</value>
  </property>  
  ```
  yarn_excludes中写入要删除的DataNode节点名
  host-108


  + ResourceManager上刷新节点
  ```sh
  /usr/bin/sudo su yarn -l -s /bin/bash -c 'kinit -t /etc/security/keytab/yarn/yarn.keytab  resourcemanager/host-105@CTYUN.COM;/opt/cdh/hadoop/bin/yarn --config /opt/cdh/hadoop/etc/hadoop rmadmin -refreshNodes '
  ```

  在UI中查看节点状态：

![](http://carforeasy.cn/hadoop集群启用kerberos后动态增加删除节点-e329bcb6.png)


## 参考链接
+ [Hadoop 添加节点和删除节点](https://blog.csdn.net/xinganshenguang/article/details/55804659)
