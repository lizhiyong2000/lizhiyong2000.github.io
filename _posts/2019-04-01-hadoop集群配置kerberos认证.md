---
layout: "post"
title: "Hadoop集群配置kerberos认证"
date: "2019-04-01 14:54"
categories: Hadoop
description: Hadoop集群配置kerberos认证
tags: Hadoop Kerberos
---

* content
{:toc}

<div class="postImg" style="background-image:url(http://carforeasy.cn/hadoop集群配置kerberos认证-df5986fb.png)"></div>
> “Kerberos是诞生于上个世纪90年代的计算机认证协议，被广泛应用于各大操作系统和Hadoop生态系统中，本文将介绍如何搭建和配置KDC服务器，并以Namenode为例在HDFS组件中启用kerberos认证。”





## 1. KDC安装配置

环境准备

| 主机名     | 主机IP          |         备注          |
| --------- | ------------   | :--------------------:|
| host-203  | 192.168.30.203 |      kdc master       |
| host-204  | 192.168.30.204 |      kdc slave        |
| host-205  | 192.168.30.205 |      other            |

+ 安装KDC及client软件包（krb5-server为KDC使用，client可不安装）

  ```
  sudo yum install -y krb5-server krb5-lib krb5-workstation
  ```

### 1.2 单台KDC配置

#### 1.2.1 KDC配置
+ /var/kerberos/krb5kdc/kadm5.acl

  ```
  */admin@CTYUN.COM	*
  ```

+ /var/kerberos/krb5kdc/kdc.conf

  ```ini
  [kdcdefaults]
  kdc_ports = 88
  kdc_tcp_ports = 88

  [realms]
  CTYUN.COM = {
   #master_key_type = aes256-cts
   acl_file = /var/kerberos/krb5kdc/kadm5.acl
   dict_file = /usr/share/dict/words
   admin_keytab = /var/kerberos/krb5kdc/kadm5.keytab
   supported_enctypes = aes256-cts:normal aes128-cts:normal des3-hmac-sha1:normal arcfour-hmac:normal camellia256-cts:normal camellia128-cts:normal des-hmac-sha1:normal des-cbc-md5:normal des-cbc-crc:normal
  }
  ```

#### 1.2.2 客户端配置
+ /etc/krb5.conf

  ```ini
  includedir /etc/krb5.conf.d/

  [logging]
   default = FILE:/var/log/krb5libs.log
   kdc = FILE:/var/log/krb5kdc.log
   admin_server = FILE:/var/log/kadmind.log

  [libdefaults]
   dns_lookup_realm = false
   ticket_lifetime = 24h
   renew_lifetime = 7d
   forwardable = true
   rdns = false
   pkinit_anchors = /etc/pki/tls/certs/ca-bundle.crt
   default_realm = CTYUN.COM
   default_ccache_name = KEYRING:persistent:%{uid}

  [realms]
   CTYUN.COM = {
    kdc = host-203
    admin_server = host-203
   }

  [domain_realm]
   .ctyun.com = CTYUN.COM
   ctyun.com = CTYUN.COM
  ```

#### 1.2.3 启动KDC
+ 初始化认证数据库

  ```
   sudo kdb5_util create -s -r CTYUN.COM
  ```

+ 启动KDC服务，加入自启动

  ```
   sudo systemctl start krb5kdc kadmin
   sudo systemctl enable krb5kdc kadmin
  ```

### 1.3 主从KDC安装配置

KDC使用主从配置时，一台主机启动KDC服务作为KDC master，另一台主机启动KDC服务作为KDC slave，同时在kdc master上启动定时服务，将principals定时同步至KDC slave，KDC slave启动kpropd进程接收KDC master同步。

#### 1.3.1 KDC master配置
KDC maseter配置与单台时配置相同，仅需陪置crontab定时任务，定时任务运行脚本如下：

```shell
#!/bin/sh

kdclist="host-204"
/usr/sbin/kdb5_util dump /var/kerberos/krb5kdc/slave_datatrans

/usr/bin/kinit -k host/host-203@CTYUN.COM

for kdc in $kdclist
do
    /usr/sbin/kprop -f /var/kerberos/krb5kdc/slave_datatrans $kdc > /var/kerberos/krb5kdc/$kdc-prop.log 2>&1
```  

#### 1.3.2 KDC slave配置

KDC slave配置与master配置相同，启动kdc服务后，配置kpropd：

+ /var/kerberos/krb5kdc/kpropd.acl

```
host/host-203@CTYUN.COM
host/host-204@CTYUN.COM
```

+ 启动kpropd
```
kinit -k  host/host-204@CTYUN.COM
kpropd -a /var/kerberos/krb5kdc/kpropd.acl

```

#### 1.3.3 客户端配置
```ini
  [logging]
    default = FILE:/var/log/krb5kdc.log
    admin_server = FILE:/var/log/kadmind.log
    kdc = FILE:/var/log/krb5kdc.log

  [libdefaults]
    renew_lifetime = 7d
    forwardable = true
    default_realm = CTYUN.COM
    ticket_lifetime = 24h
    dns_lookup_realm = false
    dns_lookup_kdc = false
    default_ccache_name = /tmp/krb5cc_%{uid}
    #default_tgs_enctypes = None
    #default_tkt_enctypes = None

  [domain_realm]
    ctyun.com = CTYUN.COM
    .ctyun.com = CTYUN.COM

  [realms]
   CTYUN.COM = {
      master_kdc = host-203
      admin_server = host-203
      kdc = host-203
      kdc = host-204
  }
```

## 2. 认证信息配置
+ 添加princinple
  ```
  sudo kadmin.local -q "addprinc hdfs/host-203@CTYUN.COM"
  sudo kadmin.local -q "addprinc HTTP/host-203@CTYUN.COM"
  ```
+ 生成keytab
  ```
  sudo kadmin -p root/admin  -q "xst -k hdfs.keytab hdfs/host-203@CTYUN.COM"
  sudo kadmin -p root/admin  -q "xst -k hdfs.keytab HTTP/host-203@CTYUN.COM"
  ```
+ 查看生成的keytab
  ```
  sudo klist -ket hdfs.keytab
  Keytab name: FILE:hdfs.keytab
  KVNO Timestamp           Principal
  ---- ------------------- ------------------------------------------------------
    2 2019-04-01T18:32:31 hdfs/host-203@CTYUN.COM (aes256-cts-hmac-sha1-96)
    2 2019-04-01T18:32:31 hdfs/host-203@CTYUN.COM (aes128-cts-hmac-sha1-96)
    2 2019-04-01T18:32:32 hdfs/host-203@CTYUN.COM (des3-cbc-sha1)
    2 2019-04-01T18:32:32 hdfs/host-203@CTYUN.COM (arcfour-hmac)
    2 2019-04-01T18:32:32 hdfs/host-203@CTYUN.COM (camellia256-cts-cmac)
    2 2019-04-01T18:32:32 hdfs/host-203@CTYUN.COM (camellia128-cts-cmac)
    2 2019-04-01T18:32:32 hdfs/host-203@CTYUN.COM (des-hmac-sha1)
    2 2019-04-01T18:32:32 hdfs/host-203@CTYUN.COM (des-cbc-md5)
    2 2019-04-01T19:07:36 HTTP/host-203@CTYUN.COM (aes256-cts-hmac-sha1-96)
    2 2019-04-01T19:07:37 HTTP/host-203@CTYUN.COM (aes128-cts-hmac-sha1-96)
    2 2019-04-01T19:07:37 HTTP/host-203@CTYUN.COM (des3-cbc-sha1)
    2 2019-04-01T19:07:37 HTTP/host-203@CTYUN.COM (arcfour-hmac)
    2 2019-04-01T19:07:37 HTTP/host-203@CTYUN.COM (camellia256-cts-cmac)
    2 2019-04-01T19:07:37 HTTP/host-203@CTYUN.COM (camellia128-cts-cmac)
    2 2019-04-01T19:07:37 HTTP/host-203@CTYUN.COM (des-hmac-sha1)
    2 2019-04-01T19:07:38 HTTP/host-203@CTYUN.COM (des-cbc-md5)
  ```

+ 客户端中使用keytab
  ```
  sudo kadmin -p root/admin
  ```
  ```
  sudo su hdfs -l -s /bin/bash -c 'kinit -k -t /opt/cdh/hadoop/etc/hadoop/hdfs.keytab hdfs/host-203@CTYUN.COM'
  sudo su hdfs -l -s /bin/bash -c 'kinit -k -t /opt/cdh/hadoop/etc/hadoop/hdfs.keytab HTTP/host-203@CTYUN.COM'
  ```

## 3. Hadoop组件配置示例
以HDFS namenode为例，配置namenode使用kerberos认证。
+ core-site.xml
  ```xml
    <property>
        <name>hadoop.security.authorization</name>
        <value>true</value>
    </property>

    <property>
        <name>hadoop.security.authentication</name>
        <value>kerberos</value>
    </property>

    <property>
        <name>hadoop.security.auth_to_local</name>
        <value>
          RULE:[2:$1@$0](hdfs/.*@.*CTYUN.COM)s/.*/hdfs/
          RULE:[2:$1@$0](nn/.*@.*CTYUN.COM)s/.*/hdfs/
          RULE:[2:$1@$0](jn/.*@.*CTYUN.COM)s/.*/hdfs/
          RULE:[2:$1@$0](dn/.*@.*CTYUN.COM)s/.*/hdfs/
          RULE:[2:$1@$0](nm/.*@.*CTYUN.COM)s/.*/yarn/
          RULE:[2:$1@$0](rm/.*@.*CTYUN.COM)s/.*/yarn/
          RULE:[2:$1@$0](jhs/.*@.*CTYUN.COM)s/.*/mapred/
          DEFAULT
        </value>
    </property>
  ```

+ hdfs-site.xml

  ```xml
     <property>
         <name>dfs.namenode.keytab.file</name>
         <value>/opt/cdh/hadoop/etc/hadoop/hdfs.keytab</value>
     </property>

     <property>
         <name>dfs.namenode.kerberos.principal</name>
         <value>hdfs/host-203@CTYUN.COM</value>
     </property>

     <property>
         <name>dfs.namenode.kerberos.https.principal</name>
         <value>HTTP/host-203@CTYUN.COM</value>
     </property>

     <property>
         <name>dfs.web.authentication.kerberos.principal</name>
         <value>HTTP/host-203@CTYUN.COM</value>
     </property>
  ```

+ hdfs_jaas.conf
  ```ini
  com.sun.security.jgss.krb5.initiate {
      com.sun.security.auth.module.Krb5LoginModule required
      renewTGT=false
      doNotPrompt=true
      useKeyTab=true
      keyTab="/opt/cdh/hadoop/etc/hadoop/hdfs.keytab"
      principal="hdfs/host-203@CTYUN.COM"
      storeKey=true
      useTicketCache=false;
  };
  ```
+ hadoop-env.sh
hadoop-env.sh中加入：
  ```sh
  export HDFS_NAMENODE_OPTS="${SHARED_HDFS_NAMENODE_OPTS} -Djava.security.auth.login.config=/opt/cdh/hadoop/etc/hadoop/hdfs_jaas.conf"
  ```
## 4. 参考链接

+ [hadoop使用kerberos增加权限验证功能](http://www.aboutyun.com/blog-1330-933.html)

+ [图解Kerberos协议原理](http://www.nosqlnotes.com/technotes/kerberos-protocol/)
