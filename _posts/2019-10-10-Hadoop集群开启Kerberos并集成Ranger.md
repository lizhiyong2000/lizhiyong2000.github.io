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

<div class="postImg" style="background-image:url(http://carforeasy.cn/Hadoop集群开启Kerberos并集成Ranger-2e4027ea.png)" ></div>
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
  <value>0.0.0.0:1004</value>
</property>
<property>
  <name>dfs.datanode.http.address</name>
  <value>0.0.0.0:1006</value>
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
    <property>
        <name>yarn.nodemanager.container-executor.class</name>
        <value>org.apache.hadoop.yarn.server.nodemanager.LinuxContainerExecutor</value>
    </property>
    <property>
        <name>yarn.nodemanager.linux-container-executor.group</name>
        <value>hadoop</value>
    </property>


    <property>
        <name>yarn.resourcemanager.scheduler.class</name>
        <value>org.apache.hadoop.yarn.server.resourcemanager.scheduler.capacity.CapacityScheduler</value>
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

#### 1.3.5 hadoop-env.sh

DataNode采用JSVC启动，将jsvc拷贝至/opt/hadoop/bin，添加可执行权限，在hadoop-env.sh中添加配置：

```
export JSVC_HOME=/opt/hadoop/bin
export HDFS_DATANODE_SECURE_USER="hdfs"
```

#### 1.3.6 配置nodemanager containerexecutor

+ container-executor.cfg

```
yarn.nodemanager.linux-container-executor.group=hadoop
banned.users=bin
min.user.id=1000
allowed.system.users=##comma separated list of system users who CAN run applications
feature.tc.enabled=false
```

+ 修改文件及目录权限

```
chown root:hadoop /opt/hadoop/bin/container-executor
chmod 6050 /opt/hadoop/bin/container-executor

chown root:hadoop /opt/hadoop/etc/hadoop/container-executor.cfg
chown root:hadoop /opt/hadoop/etc/hadoop/
chown root:hadoop /opt/hadoop/etc/
chown root:hadoop /opt/hadoop/
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
  su yarn -c 'kinit -kt /etc/security/keytab/yarn.keytab yarn/master.test.com@TEST.COM'
  su yarn -c 'yarn --daemon start resourcemanager'
  ```

+ 4. 分别启动每个nodemanager节点

  ```sh
  su yarn -c 'kinit -kt /etc/security/keytab/yarn.keytab yarn/node1.test.com@TEST.COM'
  su yarn -c 'kinit -kt /etc/security/keytab/yarn.keytab yarn/node2.test.com@TEST.COM'
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

```
[root@master ~]# klist
Ticket cache: FILE:/tmp/krb5cc_0
Default principal: hdfs/master.test.com@TEST.COM

[root@master ~]hadoop jar /opt/hadoop/share/hadoop/mapreduce/hadoop-mapreduce-examples-3.1.2.jar wordcount -Dmapreduce.job.queuename=default hdfs://master.test.com:8020/wordcount.txt /tmp/result2

[root@master ~]# hdfs dfs -cat /tmp/result2/part-r-00000
count   2
hadoop  1
test    2
```
## 2. Ranger安装及配置

### 2.1 ranger编译

```
 git clone https://github.com/apache/ranger.git
 cd ranger
 mvn clean compile package assembly:assembly install -DskipTests -Drat.skip=true
```

编译完成后可以得到zip和gz格式的安装包：

![](http://carforeasy.cn/Hadoop集群开启Kerberos并集成Ranger-3de3b5f8.png)

### 2.2 ranger-admin安装

在ranger安装的机器kdc.test.com中将ranger-2.1.0-SNAPSHOT-admin.tar.gz解压。

+ 准备MySQL数据库

+ 准备Kerberos账户及keytab



```sh
addprinc -randkey -x dn="cn=rangeradmin/kdc.test.com,ou=services,ou=accounts,dc=test,dc=com" rangeradmin/kdc.test.com@TEST.COM
addprinc -randkey -x dn="cn=rangerlookup/kdc.test.com,ou=services,ou=accounts,dc=test,dc=com" rangerlookup/kdc.test.com@TEST.COM
addprinc -randkey -x dn="cn=rangerusersync/kdc.test.com,ou=services,ou=accounts,dc=test,dc=com" rangerusersync/kdc.test.com@TEST.COM
addprinc -randkey -x dn="cn=rangertagsync/kdc.test.com,ou=services,ou=accounts,dc=test,dc=com" rangertagsync/kdc.test.com@TEST.COM


addprinc -randkey -x dn="cn=HTTP/kdc.test.com,ou=services,ou=accounts,dc=test,dc=com" HTTP/kdc.test.com@TEST.COM

ktadd -norandkey -k ranger.keytab  rangeradmin/kdc.test.com@TEST.COM  rangerlookup/kdc.test.com@TEST.COM rangerusersync/kdc.test.com@TEST.COM rangertagsync/kdc.test.com@TEST.COM
ktadd -norandkey -k ranger_http.keytab  HTTP/kdc.test.com@TEST.COM  


addprinc -x dn="cn=rangerlookup,ou=services,ou=accounts,dc=test,dc=com" rangerlookup/kdc.test.com@TEST.COM
```



+ 修改install.properties文件：


```ini
#------------------------- DB CONFIG - BEGIN ----------------------------------
# Uncomment the below if the DBA steps need to be run separately
#setup_mode=SeparateDBA

PYTHON_COMMAND_INVOKER=python

#DB_FLAVOR=MYSQL|ORACLE|POSTGRES|MSSQL|SQLA
DB_FLAVOR=MYSQL
SQL_CONNECTOR_JAR=/usr/share/java/mysql-connector-java.jar

db_root_user=user123
db_root_password=123456
db_host=localhost

#
# DB UserId used for the Ranger schema
#
db_name=ranger
db_user=ranger
db_password=admin@123

# change password. Password for below mentioned users can be changed only once using this property.
#PLEASE NOTE :: Password should be minimum 8 characters with min one alphabet and one numeric.
rangerAdmin_password=admin@123
rangerTagsync_password=admin@123
rangerUsersync_password=admin@123
keyadmin_password=admin@123


#Source for Audit Store. Currently only solr is supported.
# * audit_store is solr
#audit_store=solr

#------------------------- DB CONFIG - END ----------------------------------

# ------- PolicyManager CONFIG ----------------

policymgr_external_url=http://kdc.test.com:6080
policymgr_http_enabled=true
policymgr_https_keystore_file=
policymgr_https_keystore_keyalias=rangeradmin
policymgr_https_keystore_password=

#Add Supported Components list below separated by semi-colon, default value is empty string to support all components
#Example :  policymgr_supportedcomponents=hive,hbase,hdfs
policymgr_supportedcomponents=

# ------- PolicyManager CONFIG - END ---------------

# ------- UNIX User CONFIG ----------------

unix_user=ranger
unix_user_pwd=ranger
unix_group=ranger
# ------- UNIX User CONFIG  - END ----------------


#LDAP|ACTIVE_DIRECTORY|UNIX|NONE

authentication_method=NONE

remoteLoginEnabled=true
authServiceHostName=kdc.test.com
authServicePort=5151

#------------ Kerberos Config -----------------
spnego_principal=HTTP/kdc.test.com@TEST.COM
spnego_keytab=/etc/security/keytab/ranger_http.keytab
token_valid=30
cookie_domain=kdc.test.com
cookie_path=/
admin_principal=rangeradmin/kdc.test.com@TEST.COM
admin_keytab=/etc/security/keytab/ranger.keytab
lookup_principal=rangerlookup/kdc.test.com@TEST.COM
lookup_keytab=/etc/security/keytab/ranger.keytab
hadoop_conf=/opt/hadoop/etc/hadoop/
#
#-------- SSO CONFIG - Start ------------------
#
sso_enabled=false
sso_providerurl=https://127.0.0.1:8443/gateway/knoxsso/api/v1/websso
sso_publickey=

#
#-------- SSO CONFIG - END ------------------

# Custom log directory path
RANGER_ADMIN_LOG_DIR=$PWD

# PID file path
RANGER_PID_DIR_PATH=/var/run/ranger
```

之后，运行setup.sh进行安装，使用ranger-admin start 启动服务。

启动完成后可访问web页面：

![](http://carforeasy.cn/Hadoop集群开启Kerberos并集成Ranger-9875d69a.png)

### 2.3 ranger-usersync安装

ranger-admin的安装类似，解压后修改install.properties文件：


```ini
ranger_base_dir = /etc/ranger
POLICY_MGR_URL = http://kdc.test.com:6080
SYNC_SOURCE = ldap
MIN_UNIX_USER_ID_TO_SYNC = 500
MIN_UNIX_GROUP_ID_TO_SYNC = 500
SYNC_INTERVAL =
#User and group for the usersync process
unix_user=ranger
unix_group=ranger

#change password of rangerusersync user. Please note that this password should be as per rangerusersync user in ranger
rangerUsersync_password=admin@123

#Set to run in kerberos environment
usersync_principal=rangerusersync/kdc.test.com@TEST.COM
usersync_keytab=/etc/security/keytab/ranger.keytab
hadoop_conf=/opt/hadoop/etc/hadoop/

# SSL Authentication
AUTH_SSL_ENABLED=false

# default value ROLE_ASSIGNMENT_LIST_DELIMITER = &
ROLE_ASSIGNMENT_LIST_DELIMITER = &

#default value USERS_GROUPS_ASSIGNMENT_LIST_DELIMITER = :
USERS_GROUPS_ASSIGNMENT_LIST_DELIMITER = :

#default value USERNAME_GROUPNAME_ASSIGNMENT_LIST_DELIMITER = ,
USERNAME_GROUPNAME_ASSIGNMENT_LIST_DELIMITER = ,

# with above mentioned delimiters a sample value would be ROLE_SYS_ADMIN:u:userName1,userName2&ROLE_SYS_ADMIN:g:groupName1,groupName2&ROLE_KEY_ADMIN:u:userName&ROLE_KEY_ADMIN:g:groupName&ROLE_USER:u:userName3,userName4&ROLE_USER:g:groupName3
#&ROLE_ADMIN_AUDITOR:u:userName&ROLE_KEY_ADMIN_AUDITOR:u:userName&ROLE_KEY_ADMIN_AUDITOR:g:groupName&ROLE_ADMIN_AUDITOR:g:groupName
GROUP_BASED_ROLE_ASSIGNMENT_RULES =


SYNC_LDAP_URL = ldap://kdc.test.com:389
SYNC_LDAP_BIND_DN = cn=admin,dc=test,dc=com
SYNC_LDAP_BIND_PASSWORD = 123456
SYNC_LDAP_DELTASYNC =
SYNC_LDAP_SEARCH_BASE = ou=accounts,dc=test,dc=com
SYNC_LDAP_USER_SEARCH_BASE = ou=accounts,dc=test,dc=com
SYNC_LDAP_USER_SEARCH_SCOPE = sub
SYNC_LDAP_USER_OBJECT_CLASS = inetOrgPerson
SYNC_LDAP_USER_SEARCH_FILTER =
SYNC_LDAP_USER_NAME_ATTRIBUTE = cn
SYNC_LDAP_USER_GROUP_NAME_ATTRIBUTE = memberof,ismemberof
SYNC_LDAP_USERNAME_CASE_CONVERSION=lower
SYNC_LDAP_GROUPNAME_CASE_CONVERSION=lower

#user sync log path
logdir=logs
#/var/log/ranger/usersync

# PID DIR PATH
USERSYNC_PID_DIR_PATH=/var/run/ranger

SYNC_GROUP_SEARCH_ENABLED=true
SYNC_GROUP_USER_MAP_SYNC_ENABLED=true
SYNC_LDAP_USER_SEARCH_BASE
SYNC_GROUP_SEARCH_BASE=ou=groups,ou=accounts,dc=test,dc=com
SYNC_GROUP_SEARCH_SCOPE=
SYNC_GROUP_OBJECT_CLASS=posixGroup
SYNC_LDAP_GROUP_SEARCH_FILTER=
SYNC_GROUP_NAME_ATTRIBUTE=
SYNC_GROUP_MEMBER_ATTRIBUTE_NAME=
SYNC_PAGED_RESULTS_ENABLED=
SYNC_PAGED_RESULTS_SIZE=
SYNC_LDAP_REFERRAL =ignore

```


之后，运行setup.sh进行安装，使用ranger-admin usersync 启动服务。

在ranger audit页面中可看到用户同步记录：
![](http://carforeasy.cn/Hadoop集群开启Kerberos并集成Ranger-8fef01f8.png)

## 3. Hadoop安装Ranger插件

### 3.1 HDFS安装Ranger插件
#### 3.1.1 ranger添加hdfs服务

首先在ranger中添加hdfs_test这个服务，配置如下：

![](http://carforeasy.cn/Hadoop集群开启Kerberos并集成Ranger-af55659c.png)

#### 3.1.2 ranger-hdfs-plugin安装

将ranger-2.1.0-SNAPSHOT-hdfs-plugin.tar.gz在namenode节点上解压，修改install.properties:

```ini
POLICY_MGR_URL=http://kdc.test.com:6080
REPOSITORY_NAME=hdfs_test
COMPONENT_INSTALL_DIR_NAME=/opt/hadoop
CUSTOM_USER=hdfs
CUSTOM_GROUP=hadoop
```

之后运行enable-hdfs-plugin.sh进行安装。
安装完成后需要重启namenode服务。

#### 3.1.3 权限测试

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

#### 3.2.1 ranger添加hdfs服务

首先在ranger中添加yarn-test这个服务，配置如下：

![](http://carforeasy.cn/Hadoop集群开启Kerberos并集成Ranger-839659a5.png)

#### 3.2.2 ranger-yarn-plugin安装

将ranger-2.1.0-SNAPSHOT-yarn-plugin.tar.gz在resourcemanager节点上解压，修改install.properties:

```ini
POLICY_MGR_URL=http://kdc.test.com:6080
REPOSITORY_NAME=yarn-test
COMPONENT_INSTALL_DIR_NAME=/opt/hadoop
CUSTOM_USER=yarn
CUSTOM_GROUP=hadoop
```

之后运行enable-yarn-plugin.sh进行安装。
安装完成后需要重启resourcemanager服务。
#### 3.2.2 权限测试

在Ranger中为Yarn配置策略，仅允许yarn用户提交任务：

![](http://carforeasy.cn/Hadoop集群开启Kerberos并集成Ranger-97df8b73.png)

再次使用test用户提交任务，报错：

```
org.apache.hadoop.yarn.exceptions.YarnException: org.apache.hadoop.security.AccessControlException: User test does not have permission to submit application_1570680466442_0005 to queue default
        at org.apache.hadoop.yarn.ipc.RPCUtil.getRemoteException(RPCUtil.java:38)
        at org.apache.hadoop.yarn.server.resourcemanager.RMAppManager.createAndPopulateNewRMApp(RMAppManager.java:427)
        at org.apache.hadoop.yarn.server.resourcemanager.RMAppManager.submitApplication(RMAppManager.java:320)
        at org.apache.hadoop.yarn.server.resourcemanager.ClientRMService.submitApplication(ClientRMService.java:647)
        at org.apache.hadoop.yarn.api.impl.pb.service.ApplicationClientProtocolPBServiceImpl.submitApplication(ApplicationClientProtocolPBServiceImpl.java:277)
        at org.apache.hadoop.yarn.proto.ApplicationClientProtocol$ApplicationClientProtocolService$2.callBlockingMethod(ApplicationClientProtocol.java:563)
        at org.apache.hadoop.ipc.ProtobufRpcEngine$Server$ProtoBufRpcInvoker.call(ProtobufRpcEngine.java:523)
        at org.apache.hadoop.ipc.RPC$Server.call(RPC.java:991)
        at org.apache.hadoop.ipc.Server$RpcCall.run(Server.java:872)
        at org.apache.hadoop.ipc.Server$RpcCall.run(Server.java:818)
        at java.security.AccessController.doPrivileged(Native Method)
        at javax.security.auth.Subject.doAs(Subject.java:422)
        at org.apache.hadoop.security.UserGroupInformation.doAs(UserGroupInformation.java:1729)
        at org.apache.hadoop.ipc.Server$Handler.run(Server.java:2678)
```



## 4. 参考链接

+ [Cloudera Manager 配置 LDAP 集成 Kerberos](http://www.yanglajiao.com/article/u011026329/79171996)
+ [Hadoop集群上搭建Ranger](https://www.qingtingip.com/h_241390.html)
+ [在kerberos-HA环境下的ranger编译安装](https://xiuechen.github.io/2017/04/13/在kerberos-HA环境下的ranger编译安装/)
+ [Hadoop YARN：调度性能优化实践](https://www.infoq.cn/article/dh5UpM_fJrtj1IgxQDsq)
