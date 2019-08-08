
## 1. 安装MySQL

### 1.1 安装MySQL并配置
mysql采用tar.gz包安装，解压至目录即可，系统为mysql创建mysql:mysql用户和组。

+ /etc/my.cnf

```ini
[client]
port            = 3306
socket          = /var/run/mysql/mysqld.sock

# Here follows entries for some specific programs

# The MySQL server
[mysqld]

basedir=/opt/cdh/mysql
datadir=/opt/cdh/mysql/data

pid-file                                = /var/run/mysql/mysqld.pid
#general_log_file               = /var/log/mysql/mysql.log
log-error                               = /var/log/mysql/mysql-error.log
port            = 3306
socket          = /var/run/mysql/mysqld.sock


skip-external-locking
key_buffer_size = 384M
max_allowed_packet = 1M
table_open_cache = 512
sort_buffer_size = 2M
read_buffer_size = 2M
read_rnd_buffer_size = 8M
myisam_sort_buffer_size = 64M
thread_cache_size = 8
query_cache_size = 32M

server-id=1
log-bin=/var/log/mysql/mysql-bin.log


skip-name-resolve
default-storage-engine  = INNODB

character-set-server=utf8
collation_server=utf8_general_ci
init_connect='SET NAMES utf8'

max_connections                 = 4096
max_connect_errors              = 10

```


 + /usr/lib/systemd/system/mysqld.service

```ini
[Unit]
Description=MySQL Server
Documentation=man:mysqld(8)
Documentation=http://dev.mysql.com/doc/refman/en/using-systemd.html
After=network.target
After=syslog.target

[Install]
WantedBy=multi-user.target

[Service]
User=mysql
Group=mysql

Type=forking

PIDFile=/var/run/mysql/mysqld.pid

# Disable service start and stop timeout logic of systemd for mysqld service.
TimeoutSec=0

# Execute pre and post scripts as root
PermissionsStartOnly=true

# Start main service
ExecStart=/opt/cdh/mysql/bin/mysqld --user=mysql --daemonize $MYSQLD_OPTS

# Use this to switch malloc implementation
EnvironmentFile=-/etc/sysconfig/mysql

# Sets open_files_limit
LimitNOFILE = 5000

```
### 1.2 启动MySQL

```sh

systemctl daemon-reload

systemctl enable mysqld
## 第一次启动前初始化数据库
/opt/cdh/mysql/bin/mysqld --user=mysql --initialize-insecure

systemctl start mysqld
```
### 1.3 添加hive用户
```sql
CREATE USER 'hive'@'%' IDENTIFIED BY 'hive';
GRANT ALL PRIVILEGES ON *.* TO 'hive'@'%';
DELETE FROM mysql.user WHERE user='';
flush privileges;
```

## 2. Hive安装配置

### 2.1 配置文件
+ hive-env.sh
```sh
export HADOOP_HOME=/opt/cdh/hadoop
export HIVE_CONF_DIR=/opt/cdh/hive/conf
export HIVE_HOME=/opt/cdh/hive
```


+ hive-site.xml

```xml
<configuration  xmlns:xi="http://www.w3.org/2001/XInclude">

    <property>
      <name>hive.exec.scratchdir</name>
      <value>/user/hive/tmp</value>
    </property>

    <property>
      <name>hive.metastore.warehouse.dir</name>
      <value>/user/hive/warehouse</value>
    </property>

    <property>
      <name>hive.querylog.location</name>
      <value>/var/log/hive</value>
    </property>

    <property>
      <name>hive.metastore.uris</name>
      <value>thrift://host-203:9083</value>
    </property>


    <property>
      <name>javax.jdo.option.ConnectionDriverName</name>
      <value>com.mysql.jdbc.Driver</value>
    </property>

    <property>
      <name>javax.jdo.option.ConnectionURL</name>
      <value>jdbc:mysql://host-205:3306/hive?createDatabaseIfNotExist=true&amp;useSSL=false</value>
    </property>

    <property>
      <name>javax.jdo.option.ConnectionUserName</name>
      <value>hive</value>
    </property>

    <property>
      <name>javax.jdo.option.ConnectionPassword</name>
      <value>hive</value>
    </property>


    <property>
      <name>hive.server2.thrift.bind.host</name>
      <value>host-203</value>
    </property>

    <property>
      <name>hive.server2.thrift.port</name>
      <value>10000</value>
    </property>

  </configuration>
```
### 2.2 创建HDFS目录

```sh
cd $HADOOP_HOME #进入Hadoop主目录
bin/hadoop fs -mkdir -p  /user/hive/warehouse
bin/hadoop fs -mkdir -p /user/hive/tmp

bin/hadoop fs -chown -R hive:hadoop /user/hive
bin/hadoop fs -chmod -R 775 /user/hive

#用以下命令检查目录是否创建成功及权限是否正确
bin/hadoop fs -ls /user/hive/warehouse
bin/hadoop fs -ls /user/hive/tmp

```

### 2.3 拷贝 JDBC jar包文件

将mysql-connector-java.jar文件拷贝至 $HIVE_HOME/lib目录下，并修改好权限。

### 2.4 启动Metastore

+ 第一次启动初始化schema
```sh
schematool -initSchema  -dbType MYSQL  -userName hive  -passWord hive  -verbose
```

+ 启动metastore
```sh
hive --service metastore  -hiveconf hive.log.file=metastore.log -hiveconf hive.log.dir=/tmp/hive &
```

### 2.5 启动HiveServer2

+ 启动HiveServer2
```sh
hiveserver2  -hiveconf hive.log.file=hiveserver2.log -hiveconf hive.log.dir=/tmp/hive &
```

### 2.6 结果验证
```sh
/usr/bin/sudo su hive -l -s /bin/bash -c '/opt/cdh/hive/bin/beeline'

> !connect jdbc:hive2://host-203:10000/default
> show databases;

```

## 3. 高可用配置

### 3.1 MetaStore高可用
metastore高可用无需特别配置，在hive-site.xml中修改hive.metastore.uris后，在两台主机上分别启动metastore服务即可。
+ hive-site.xml 加入

```xml
<property>
  <name>hive.metastore.uris</name>
  <value>thrift://host-203:9083,thrift://host-204:9083</value>
</property>
```


### 3.2 HiveServer2高可用

hiveserver2的高可用需借助zookeeper实现，在hive-site.xml中加入如下配置：

```xml
<property>
  <name>hive.server2.support.dynamic.service.discovery</name>
  <value>true</value>
</property>

<property>
  <name>hive.zookeeper.quorum</name>
  <value>host-203:2181,host-204:2181,host-205:2181,host-206:2181,host-207:2181</value>
</property>

<property>
  <name>hive.zookeeper.client.port</name>
  <value>2181</value>
</property>

<property>
  <name>hive.server2.zookeeper.namespace</name>
  <value>hiveserver2_zk</value>
</property>

```
之后启动hiveserver2服务，在zookeeper中查看/hiveserver2_zk 节点，应有结果：

```sh
/opt/cdh/zookeeper/bin/zkCli.sh -server host-203 ls /hiveserver2_zk

[
serverUri=host-203:10000;version=2.3.5;sequence=0000000000,
serverUri=host-204:10000;version=2.3.5;sequence=0000000000
]
```
### 3.3 结果验证

```sh
/usr/bin/sudo su hive -l -s /bin/bash -c '/opt/cdh/hive/bin/beeline'

> !connect jdbc:hive2://host-03:2181,host-04:2181,host-05:2181/default;serviceDiscoveryMode=zooKeeper;zooKeeperNamespace=hiveserver2_zk
> show databases;

```


## 4. Kerberos配置
### 4.1 添加principal、生成keytab

为hive/host-203@CTYUN.COM 和 hive/host-204@CTYUN.COM 分别生成keytab文件至/etc/security/keytab/hive/hive.keytab并设置好文件权限。

### 4.2 修改配置

+ 修改hive-site.xml
```xml
    <property>
      <name>hive.metastore.kerberos.keytab.file</name>
      <value>/etc/security/keytab/hive/hive.keytab</value>
    </property>

    <property>
      <name>hive.metastore.kerberos.principal</name>
      <value>hive/_HOST@CTYUN.COM</value>
    </property>

    <property>
      <name>hive.metastore.sasl.enabled</name>
      <value>true</value>
    </property>

    <property>
      <name>hive.server2.authentication</name>
      <value>KERBEROS</value>
    </property>

    <property>
      <name>hive.server2.authentication.kerberos.keytab</name>
      <value>/etc/security/keytab/hive/hive.keytab</value>
    </property>

    <property>
      <name>hive.server2.authentication.kerberos.principal</name>
      <value>hive/_HOST@CTYUN.COM</value>
    </property>
```

+ hdfs core-site.xml修改

```xml
<property>
     <name>hadoop.proxyuser.hdfs.groups</name>
     <value>*</value>
   </property>

   <property>
     <name>hadoop.proxyuser.hdfs.hosts</name>
     <value>*</value>
   </property>

   <property>
     <name>hadoop.proxyuser.hive.groups</name>
     <value>*</value>
   </property>

   <property>
     <name>hadoop.proxyuser.hive.hosts</name>
     <value>*</value>
   </property>

   <property>
     <name>hadoop.proxyuser.HTTP.groups</name>
     <value>*</value>
   </property>

   <property>
     <name>hadoop.proxyuser.HTTP.hosts</name>
     <value>*</value>
   </property>
```

### 4.3 启动服务
启动hiveserver2服务前使用kinit命令进行账号初始化即可。


### 4.4 结果验证

```sh

sudo su hive -l -s /bin/bash -c 'kinit -kt /etc/security/keytab/hive/hive.keytab hive/host-03@CTYUN.COM'

sudo su hive -l -s /bin/bash -c '/opt/cdh/hive/bin/beeline'

> !connect jdbc:hive2://host-03:2181,host-04:2181,host-05:2181/default;serviceDiscoveryMode=zooKeeper;zooKeeperNamespace=hiveserver2_zk
;principal=hive/host-03@CTYUN.COM;auth=KERBEROS
> show databases;

```

同时开启高可用和kerberos配置情况下，会发现zookeeper中始终只有一个hiveserver2服务进行注册，定位发现是znode的权限问题：

```sh
/usr/bin/sudo su zookeeper -l -s /bin/bash -c '/opt/cdh/zookeeper/bin/zkCli.sh getAcl /hiveserver2_zk'
WatchedEvent state:SyncConnected type:None path:null
'world,'anyone
: r
'sasl,'hive/host-03@CTYUN.COM
: cdrwa
```

第一个注册的hiveserver2服务将/hiveserver2_zk权限设置了 “'sasl,'hive/host-03@CTYUN.COM”，这样第二个hiveserver2服务将无法在zookeeper中注册，不能达到高可用的目的。

解决的方法有两个：
1. 第一个hiveserver2服务注册后主动修改/hiveserver2_zk权限
2. zookeeper zoo.cfg中添加配置skipACL=yes禁掉ACL权限
