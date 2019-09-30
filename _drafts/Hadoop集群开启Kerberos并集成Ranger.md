---
layout: "post"
title: "Hadoop集群开启Kerberos并集成Ranger"
date: "2019-09-30 14:43"
categories: Hadoop
description: Hadoop集群开启Kerberos并集成Ranger
tags: Hadoop Kerberos Ranger
---

* content
{:toc}

<div class="postImg" style="background-image:url(http://carforeasy.cn/Presto安装部署-4745cd1d.png)" ></div>
> “本文介绍在之前安装好的Hadoop 3集群之上开启Kerberos认证，并安装Ranger进行Hadoop集群的权限控制。”





准备4台虚拟机(CentOS 7)，一台 master，两台 slave上安装hadoop：master 作为NameNode、DataNode、ResourceManager、NodeManager，slave 均作为DataNode、NodeManager。另一台上安装：kdc + openldap，以及Ranger。

```
master : master.test.com
slave1 : node1.test.com
slave2 : node2.test.com
ranger : kdc.test.com
```

Hadoop基础集群的安装及Kerberos与OpenLDAP的集成请参考之前的文章，为各台机器配置好hosts。

## 1. Hadoop集群配置Kerberos

### 1.1 LDAP中添加服务dn

```ini
dn: cn=hdfs/master.test.com,ou=services,ou=accounts,dc=test,dc=com
cn: hdfs/master.test.com
sn: hdfs/master.test.com
objectClass: inetOrgPerson

dn: cn=hdfs/node1.test.com,ou=services,ou=accounts,dc=test,dc=com
cn: hdfs/node1.test.com
sn: hdfs/node1.test.com
objectClass: inetOrgPerson

dn: cn=hdfs/node2.test.com,ou=services,ou=accounts,dc=test,dc=com
cn: hdfs/node2.test.com
sn: hdfs/node2.test.com
objectClass: inetOrgPerson

dn: cn=yarn/master.test.com,ou=services,ou=accounts,dc=test,dc=com
cn: yarn/master.test.com
sn: yarn/master.test.com
objectClass: inetOrgPerson

dn: cn=yarn/node1.test.com,ou=services,ou=accounts,dc=test,dc=com
cn: yarn/node1.test.com
sn: yarn/node1.test.com
objectClass: inetOrgPerson

dn: cn=yarn/node2.test.com,ou=services,ou=accounts,dc=test,dc=com
cn: yarn/node2.test.com
sn: yarn/node2.test.com
objectClass: inetOrgPerson

dn: cn=mapred/master.test.com,ou=services,ou=accounts,dc=test,dc=com
cn: mapred/master.test.com
sn: mapred/master.test.com
objectClass: inetOrgPerson

dn: cn=mapred/node1.test.com,ou=services,ou=accounts,dc=test,dc=com
cn: mapred/node1.test.com
sn: mapred/node1.test.com
objectClass: inetOrgPerson

dn: cn=mapred/node2.test.com,ou=services,ou=accounts,dc=test,dc=com
cn: mapred/node2.test.com
sn: mapred/node2.test.com
objectClass: inetOrgPerson

dn: cn=HTTP/master.test.com,ou=services,ou=accounts,dc=test,dc=com
cn: HTTP/master.test.com
sn: HTTP/master.test.com
objectClass: inetOrgPerson

dn: cn=HTTP/node1.test.com,ou=services,ou=accounts,dc=test,dc=com
cn: HTTP/node1.test.com
sn: HTTP/node1.test.com
objectClass: inetOrgPerson

dn: cn=HTTP/node2.test.com,ou=services,ou=accounts,dc=test,dc=com
cn: HTTP/node2.test.com
sn: HTTP/node2.test.com
objectClass: inetOrgPerson
```



```sh
ldapadd -x -D "cn=admin,dc=test,dc=com" -W -f accounts.ldif
```

### 1.2 生成keytab

kerberos中为master、node1、node2上的服务分别添加principal：

```sh
#kadmin.local:
#master
addprinc -randkey -x dn="cn=hdfs/master.test.com,ou=services,ou=accounts,dc=test,dc=com" hdfs/master.test.com@TEST.COM

addprinc -randkey -x dn="cn=yarn/master.test.com,ou=services,ou=accounts,dc=test,dc=com" yarn/master.test.com@TEST.COM

addprinc -randkey -x dn="cn=mapred/master.test.com,ou=services,ou=accounts,dc=test,dc=com" mapred/master.test.com@TEST.COM

addprinc -randkey -x dn="cn=HTTP/master.test.com,ou=services,ou=accounts,dc=test,dc=com" HTTP/master.test.com@TEST.COM

#node1
addprinc -randkey -x dn="cn=hdfs/node1.test.com,ou=services,ou=accounts,dc=test,dc=com" hdfs/node1.test.com@TEST.COM

addprinc -randkey -x dn="cn=yarn/node1.test.com,ou=services,ou=accounts,dc=test,dc=com" yarn/node1.test.com@TEST.COM

addprinc -randkey -x dn="cn=mapred/node1.test.com,ou=services,ou=accounts,dc=test,dc=com" mapred/node1.test.com@TEST.COM

addprinc -randkey -x dn="cn=HTTP/node1.test.com,ou=services,ou=accounts,dc=test,dc=com" HTTP/node1.test.com@TEST.COM

#node2
addprinc -randkey -x dn="cn=hdfs/node2.test.com,ou=services,ou=accounts,dc=test,dc=com" hdfs/node2.test.com@TEST.COM

addprinc -randkey -x dn="cn=yarn/node2.test.com,ou=services,ou=accounts,dc=test,dc=com" yarn/node2.test.com@TEST.COM

addprinc -randkey -x dn="cn=mapred/node2.test.com,ou=services,ou=accounts,dc=test,dc=com" mapred/node2.test.com@TEST.COM

addprinc -randkey -x dn="cn=HTTP/node2.test.com,ou=services,ou=accounts,dc=test,dc=com" HTTP/node2.test.com@TEST.COM
```

+ 为principal生成keytab文件


```
ktadd -norandkey -k hdfs.keytab  hdfs/master.test.com@TEST.COM hdfs/node1.test.com@TEST.COM hdfs/node2.test.com@TEST.COM

ktadd -norandkey -k yarn.keytab  yarn/master.test.com@TEST.COM yarn/node1.test.com@TEST.COM yarn/node2.test.com@TEST.COM

ktadd -norandkey -k mapred.keytab  mapred/master.test.com@TEST.COM mapred/node1.test.com@TEST.COM mapred/node2.test.com@TEST.COM

ktadd -norandkey -k hdfs.keytab  HTTP/master.test.com@TEST.COM HTTP/node1.test.com@TEST.COM HTTP/node2.test.com@TEST.COM
```


```
[root@master keytab]# ll /etc/security/keytab
total 16
-r--r-----. 1 hdfs   hadoop 1786 Sep 24 17:48 hdfs.keytab
-r--r-----. 1 hdfs   hadoop 1786 Sep 24 17:48 http.keytab
-r--r-----. 1 mapred hadoop 1834 Sep 24 17:48 mapred.keytab
-r--r-----. 1 yarn   hadoop 1786 Sep 24 17:48 yarn.keytab
```


### 1.3 Hadoop配置修改

#### 1.3.1 core-site.xml

```xml
<!--kerberos config -->
<property>
        <name>hadoop.security.authorization</name>
        <value>true</value>
</property>
<property>
        <name>hadoop.security.authentication</name>
        <value>kerberos</value>
</property>
<!-- 默认使用authentication，可使用integrity ，privacy -->
<property>
        <name>hadoop.rpc.protection</name>
        <value>authentication</value>
</property>
<property>
        <name>hadoop.security.auth_to_local</name>
        <value>DEFAULT</value>
</property>
```


#### 1.3.2 hdfs-site.xml

```xml
<!-- General HDFS security config -->
<property>
      <name>dfs.block.access.token.enable</name>
      <value>true</value>
</property>

<!--NameNode security config -->
<property>
      <name>dfs.encrypt.data.transfer</name>
      <value>true</value>
</property>

<property>
      <name>dfs.namenode.keytab.file</name>
      <value>/etc/security/keytab/hdfs.keytab</value>
      <!-- path to the HDFS keytab -->  
</property>
<property>
      <name>dfs.namenode.kerberos.principal</name>
      <value>hdfs/_HOST@TEST.COM</value>
</property>
<property>
      <name>dfs.namenode.kerberos.https.principal</name>
      <value>HTTP/_HOST@TEST.COM</value>
</property>
<!-- journalnode secure  -->
<property>
      <name>dfs.journalnode.keytab.file</name>
      <value>/etc/security/keytab/hdfs.keytab</value>
</property>
<property>
      <name>dfs.journalnode.kerberos.principal</name>
      <value>hdfs/_HOST@TEST.COM</value>
</property>
<property>
      <name>dfs.journalnode.kerberos.internal.spnego.principal</name>
      <value>HTTP/_HOST@TEST.COM</value>
</property>
<!--DataNode security config -->
<property>
      <name>dfs.datanode.data.dir.perm</name>
      <value>700</value>
</property>

<property>
  <name>dfs.datanode.address</name>
  <value>0.0.0.0:1022</value>
</property>
<property>
  <name>dfs.datanode.http.address</name>
  <value>0.0.0.0:1023</value>
</property>

<property>
      <name>dfs.datanode.keytab.file</name>
      <value>/etc/security/keytab/hdfs.keytab</value>
      <!-- path to the HDFS keytab -->
</property>
<property>
      <name>dfs.datanode.kerberos.principal</name>
      <value>hdfs/_HOST@TEST.COM</value>
</property>
<!--web config-->
<property>
      <name>dfs.web.authentication.kerberos.principal</name>
      <value>HTTP/_HOST@TEST.COM</value>
</property>
<property>
      <name>dfs.web.authentication.kerberos.keytab</name>
      <value>/etc/security/keytab/http.keytab</value>
</property>
```

#### 1.3.3 yarn-site.xml

```xml
<!-- yarn security -->  
    <property>
        <name>yarn.resourcemanager.keytab</name>
        <value>/etc/security/keytab/yarn.keytab</value>
    </property>
    <property>
        <name>yarn.resourcemanager.principal</name>
        <value>yarn/_HOST@TEST.COM</value>
    </property>
    <property>
        <name>yarn.nodemanager.keytab</name>
        <value>/etc/security/keytab/yarn.keytab</value>
    </property>
    <property>
        <name>yarn.nodemanager.principal</name>
        <value>yarn/_HOST@TEST.COM</value>
    </property>

```


#### 1.3.4 mapred-site.xml

```xml
<!--JobTracker security configs -->
    <property>
        <name>mapreduce.jobtracker.kerberos.principal</name>
        <value>mapred/_HOST@TEST.COM</value>
    </property>
    <property>
        <name>mapreduce.jobtracker.kerberos.https.principal</name>
        <value>HTTP/_HOST@TEST.COM</value>
    </property>
    <property>
        <name>mapreduce.jobtracker.keytab.file</name>
        <value>/etc/security/keytab/mapred.keytab</value>
        <!-- path to the MapReducekeytab -->
    </property>  
    <!--TaskTracker security configs -->
    <property>
        <name>mapreduce.tasktracker.kerberos.principal</name>
        <value>mapred/_HOST@TEST.COM</value>
    </property>
    <property>
        <name>mapreduce.tasktracker.kerberos.https.principal</name>
        <value>HTTP/_HOST@TEST.COM</value>
    </property>
    <property>
        <name>mapreduce.tasktracker.keytab.file</name>
        <value>/etc/security/keytab/mapred.keytab</value>
        <!-- path to the MapReducekeytab -->
    </property>  
    <!--jobhistory server security -->  
    <property>
        <name>mapreduce.jobhistory.address</name>
        <value>10020</value>
    </property>  
    <property>
        <name>mapreduce.jobhistory.keytab</name>
        <value>/etc/security/keytab/mapred.keytab</value>
    </property>
    <property>
        <name>mapreduce.jobhistory.principal</name>
        <value>mapred/_HOST@TEST.COM</value>
    </property>
```


### 1.4 服务重启及验证

#### 1.4.1 停止服务

```sh
ps -ef|grep -E "namenode|datanode"|grep -v grep|awk '{print $2}'|xargs kill -s 9

ps -ef|grep -E "resourcemanager|nodemanager"|grep -v grep|awk '{print $2}'|xargs kill -s 9
```

#### 1.4.2 启动集群

+ 1.启动namenode

使用hdfs用户启动namenode：

  ```sh
  su hdfs -c 'kinit -kt /etc/security/keytab/hdfs.keytab hdfs/master.test.com@TEST.COM'
  su hdfs -c 'hdfs --daemon start namenode'
  ```

+ 2. 分别启动每个datanode结点

使用root用户启动datanode：

  ```sh
  kinit -kt /etc/security/keytab/hdfs.keytab hdfs/master.test.com@TEST.COM

  kinit -kt /etc/security/keytab/hdfs.keytab hdfs/node1.test.com@TEST.COM

  kinit -kt /etc/security/keytab/hdfs.keytab hdfs/node2.test.com@TEST.COM

  hdfs --daemon start datanode
  ```

+ 3. 启动resourcemanager

  ```sh
  su yarn -c 'yarn --daemon start resourcemanager'
  ```

+ 4. 分别启动每个nodemanager节点

  ```sh
  su yarn -c 'yarn --daemon start nodemanager'
  ```

+ 5. 启动historyserver

  ```sh
  su mapred -c 'mr-jobhistory-daemon.sh start historyserver'
  ```

#### 1.4.3 Kerberos功能验证

#### 1.4.3.1 HDFS集群验证

+ 使用WebUI进行验证
![](http://carforeasy.cn/Hadoop集群开启Kerberos并集成Ranger-0e95f2a9.png)

+ 使用HDFS命令行进行验证

  ```
  [root@master policycache]# kinit test
  Password for test@TEST.COM:
  [root@master policycache]# hdfs dfs -ls /
  Found 3 items
  drwxr-xr-x   - rangerlookup supergroup          0 2019-09-30 09:49 /ranger
  drwx-wx-wx   - hive         supergroup          0 2019-09-17 17:17 /tmp
  drwxr-xr-x   - hdfs         supergroup          0 2019-09-30 09:31 /user
  ```

+ 使用CURL进行验证

  ```sh
  curl -s -i --negotiate -u:anyUser  http://master.test.com:50070/webhdfs/v1/?op=LISTSTATUS
  ```

#### 1.4.3.1 Yarn集群验证

## 2. Ranger安装及配置



## 3. Hadoop安装Ranger插件

### 3.1 HDFS安装Ranger插件

#### 3.1.1 ranger-hdfs-plugin安装

#### 3.1.2 权限测试

在Ranger中为test用户添加测试权限，允许test用户在/ranger目录下拥有读写权限。

![](http://carforeasy.cn/Hadoop集群开启Kerberos并集成Ranger-59f56ff2.png)

在命令行中以test用户登录，在/ranger目录下新建/ranger/test目录，可以新建成功。

```sh
[root@master policycache]# kinit test
Password for test@TEST.COM:
[root@master policycache]# hdfs dfs -ls /
Found 3 items
drwxr-xr-x   - rangerlookup supergroup          0 2019-09-30 09:49 /ranger
drwx-wx-wx   - hive         supergroup          0 2019-09-17 17:17 /tmp
drwxr-xr-x   - hdfs         supergroup          0 2019-09-30 09:31 /user
[root@master policycache]# hdfs dfs -mkdir /ranger/test
[root@master policycache]# hdfs dfs -ls /ranger
Found 1 items
drwxr-xr-x   - test supergroup          0 2019-09-30 09:49 /ranger/test
```

### 3.2 Yarn安装Ranger插件

#### 3.2.1 ranger-yarn-plugin安装
#### 3.2.2 权限测试


## 4. 参考链接

+ [Cloudera Manager 配置 LDAP 集成 Kerberos](http://www.yanglajiao.com/article/u011026329/79171996)
+ [Hadoop集群上搭建Ranger](https://www.qingtingip.com/h_241390.html)
+ [在kerberos-HA环境下的ranger编译安装](https://xiuechen.github.io/2017/04/13/在kerberos-HA环境下的ranger编译安装/)
