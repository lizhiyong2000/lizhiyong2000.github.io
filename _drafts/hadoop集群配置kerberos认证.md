---
layout: "post"
title: "Hadoop集群配置kerberos认证"
date: "2019-04-01 14:54"
---

## 1. KDC安装
### 1.1 Centos下安装KDC

```
sudo yum install -y krb5-server krb5-lib krb5-workstation
```

### 1.2 KDC配置
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

### 1.2 KDC客户端配置
+ /etc/krb5.conf
```ini
# Configuration snippets may be placed in this directory as well
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
  kdc = lizhiyong-vb2
  admin_server = lizhiyong-vb2
 }

[domain_realm]
 .ctyun.com = CTYUN.COM
 ctyun.com = CTYUN.COM
```

### 1.3 启动KDC
+ 初始化认证数据库

```
 sudo kdb5_util create -s -r CTYUN.COM
```

+ 启动KDC服务，加入自启动

```
 sudo systemctl start krb5kdc kadmin
 sudo systemctl enable krb5kdc kadmin
```

### 1.4 Ubuntu下安装kerberos客户端

```
sudo apt install krb5-config  krb5-user
```

/etc/krb5.conf配置同上
## 2. 认证信息配置


<!-- kadmin.local -q "ktadd -k /var/kerberos/krb5kdc/kadm5.keytab kadmin/changepw@WONHIGH.CN"
kadmin.local -q "ktadd -k /var/kerberos/krb5kdc/kadm5.keytab kadmin/nn21021@WONHIGH.CN" -->

```
sudo kadmin.local -q "addprinc hdfs/lizhiyong-pc@CTYUN.COM"
sudo kadmin.local -q "addprinc HTTP/lizhiyong-pc@CTYUN.COM"
```


```

sudo kadmin -p root/admin  -q "xst -k hdfs.keytab hdfs/lizhiyong-pc@CTYUN.COM"
sudo kadmin -p root/admin  -q "xst -k hdfs.keytab HTTP/lizhiyong-pc@CTYUN.COM"
```

<!-- xst -k hdfs.keytab -norandkey hdfs/lizhiyong-pc@CTYUN.COM -->

kadmin -p root/admin
```
sudo su hdfs -l -s /bin/bash -c 'kinit -k -t /opt/cdh/hadoop/etc/hadoop/hdfs.keytab hdfs/lizhiyong-pc@CTYUN.COM'
sudo su hdfs -l -s /bin/bash -c 'kinit -k -t /opt/cdh/hadoop/etc/hadoop/hdfs.keytab HTTP/lizhiyong-pc@CTYUN.COM'
```
```
sudo klist -ket hdfs.keytab
Keytab name: FILE:hdfs.keytab
KVNO Timestamp           Principal
---- ------------------- ------------------------------------------------------
  2 2019-04-01T18:32:31 hdfs/lizhiyong-pc@CTYUN.COM (aes256-cts-hmac-sha1-96)
  2 2019-04-01T18:32:31 hdfs/lizhiyong-pc@CTYUN.COM (aes128-cts-hmac-sha1-96)
  2 2019-04-01T18:32:32 hdfs/lizhiyong-pc@CTYUN.COM (des3-cbc-sha1)
  2 2019-04-01T18:32:32 hdfs/lizhiyong-pc@CTYUN.COM (arcfour-hmac)
  2 2019-04-01T18:32:32 hdfs/lizhiyong-pc@CTYUN.COM (camellia256-cts-cmac)
  2 2019-04-01T18:32:32 hdfs/lizhiyong-pc@CTYUN.COM (camellia128-cts-cmac)
  2 2019-04-01T18:32:32 hdfs/lizhiyong-pc@CTYUN.COM (des-hmac-sha1)
  2 2019-04-01T18:32:32 hdfs/lizhiyong-pc@CTYUN.COM (des-cbc-md5)
  2 2019-04-01T19:07:36 HTTP/lizhiyong-pc@CTYUN.COM (aes256-cts-hmac-sha1-96)
  2 2019-04-01T19:07:37 HTTP/lizhiyong-pc@CTYUN.COM (aes128-cts-hmac-sha1-96)
  2 2019-04-01T19:07:37 HTTP/lizhiyong-pc@CTYUN.COM (des3-cbc-sha1)
  2 2019-04-01T19:07:37 HTTP/lizhiyong-pc@CTYUN.COM (arcfour-hmac)
  2 2019-04-01T19:07:37 HTTP/lizhiyong-pc@CTYUN.COM (camellia256-cts-cmac)
  2 2019-04-01T19:07:37 HTTP/lizhiyong-pc@CTYUN.COM (camellia128-cts-cmac)
  2 2019-04-01T19:07:37 HTTP/lizhiyong-pc@CTYUN.COM (des-hmac-sha1)
  2 2019-04-01T19:07:38 HTTP/lizhiyong-pc@CTYUN.COM (des-cbc-md5)
```

## Hadoop组件配置
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
       <value>hdfs/lizhiyong-pc@CTYUN.COM</value>
   </property>

   <property>
       <name>dfs.namenode.kerberos.https.principal</name>
       <value>HTTP/lizhiyong-pc@CTYUN.COM</value>
   </property>

   <property>
       <name>dfs.web.authentication.kerberos.principal</name>
       <value>HTTP/lizhiyong-pc@CTYUN.COM</value>
   </property>
```

## 参考链接

+ [hadoop使用kerberos增加权限验证功能](http://www.aboutyun.com/blog-1330-933.html)

+ [图解Kerberos协议原理](http://www.nosqlnotes.com/technotes/kerberos-protocol/)
