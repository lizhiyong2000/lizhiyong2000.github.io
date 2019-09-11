---
layout: "post"
title: "Linux系统使用LDAP进行统一用户登录管理认证"
date: "2019-09-11 14:00"
categories: Hadoop
description: "Linux系统使用LDAP进行统一用户登录管理认证"
tags: NSLCD OpenLDAP
---

* content
{:toc}

<div class="postImg" style="background-image:url(http://carforeasy.cn/Linux系统使用LDAP进行统一用户登录管理认证-e0607cd8.png)"></div>
> “在Hadoop集群配置中，通常LDAP用于账号管理，使用Kerberos进行认证，本来是两套独立的系统，两套独立的账户，通过配置kereros使用LDAP作为数据库，配置LDAP账户使用SASL方式进行kerberos认证，能将两套账户进行关联统一，结合CAS等方案，可实现一套账户统一认证。另外，Linux系统用户也可与LDAP账户进行整合，实现统一账户管理。”





## 1. LDAP客户端配置

+ 安装openldap-clients

```
yum install -y openldap-clients
```

+ /etc/openldap/ldap.conf

```
BASE dc=com,dc=cn
URI ldap://ldap.test.com/

#SIZELIMIT      12
#TIMELIMIT      15
#DEREF          never

TLS_CACERTDIR /etc/openldap/cacerts

# Turning this off breaks GSSAPI used with krb5 when rdns = false
SASL_NOCANON    on
```

+ 测试

```
ldapsearch -x -D "cn=admin,dc=test,dc=com" -W -b "dc=test,dc=com"
```

## 2. NSLCD配置

+ 安装nss-pam-ldapd

```
yum install -y nss-pam-ldapd
```

+ 使用authconfig配置


备份当前涉及的配置文件：

```
# authconfig --savebackup=openldap.bak
```

还原当前的配置文件：

```
# authconfig --restorebackup=openldap.bak
```

修改配置：

```
authconfig --enableldap --enableldapauth --enablemkhomedir --enableforcelegacy --disablesssd --disablesssdauth --disableldaptls --enablelocauthorize --ldapserver=ldap.test.com --ldapbasedn="dc=test,dc=com" --enableshadow --update
```

+ 检查配置文件

  - /etc/nslcd.conf

  ```

  uid nslcd
  gid ldap

  uri ldap://ldap.test.com/


  #ldap_version 3

  base dc=test,dc=com

  binddn cn=admin,dc=test,dc=com

  bindpw 123456

  ssl no

  filter passwd (uid=*)

  #tls_cacertdir /etc/openldap/cacerts

  ```

  - /etc/pam.d/system-auth

  ```
  auth        required      pam_env.so
  auth        required      pam_faildelay.so delay=2000000
  auth        sufficient    pam_unix.so nullok try_first_pass
  auth        requisite     pam_succeed_if.so uid >= 1000 quiet_success
  auth        sufficient    pam_ldap.so use_first_pass
  auth        required      pam_deny.so

  account     required      pam_unix.so broken_shadow
  account     sufficient    pam_localuser.so
  account     sufficient    pam_succeed_if.so uid < 1000 quiet
  account     [default=bad success=ok user_unknown=ignore] pam_ldap.so
  account     required      pam_permit.so

  password    requisite     pam_pwquality.so try_first_pass retry=3 type=
  password    sufficient    pam_unix.so sha512 shadow nullok try_first_pass use_authtok
  password    sufficient    pam_ldap.so use_authtok
  password    required      pam_deny.so

  session     optional      pam_keyinit.so revoke
  session     required      pam_limits.so
  -session     optional      pam_systemd.so
  session     optional      pam_mkhomedir.so umask=0077
  session     [success=1 default=ignore] pam_succeed_if.so service in crond quiet use_uid
  session     required      pam_unix.so
  session     optional      pam_ldap.so
  ```

  - /etc/pam.d/password-auth
  ```
  auth        required      pam_env.so
  auth        required      pam_faildelay.so delay=2000000
  auth        sufficient    pam_unix.so nullok try_first_pass
  auth        requisite     pam_succeed_if.so uid >= 1000 quiet_success
  auth        sufficient    pam_ldap.so use_first_pass
  auth        required      pam_deny.so

  account     required      pam_unix.so broken_shadow
  account     sufficient    pam_localuser.so
  account     sufficient    pam_succeed_if.so uid < 1000 quiet
  account     [default=bad success=ok user_unknown=ignore] pam_ldap.so
  account     required      pam_permit.so

  password    requisite     pam_pwquality.so try_first_pass retry=3 type=
  password    sufficient    pam_unix.so sha512 shadow nullok try_first_pass use_authtok
  password    sufficient    pam_ldap.so use_authtok


  password    required      pam_deny.so

  session     optional      pam_keyinit.so revoke
  session     required      pam_limits.so
  -session     optional      pam_systemd.so
  session     optional      pam_mkhomedir.so umask=0077
  session     [success=1 default=ignore] pam_succeed_if.so service in crond quiet use_uid
  session     required      pam_unix.so
  session     optional      pam_ldap.so
  ```


修改配置后重启NSLCD：

```
systemctl restart nslcd
```


## 3. 配置测试

在OpenLDAP服务其中添加测试账号和用户组：

用户添加属性：

```
objectClass: posixAccount

uidNumber
gidNumber
homeDirectory
loginShell
```

![](http://carforeasy.cn/Linux系统使用LDAP进行统一用户登录管理认证-57d512f9.png)
用户组添加属性：

```
objectClass: posixGroup
gidNumber
```

![](http://carforeasy.cn/Linux系统使用LDAP进行统一用户登录管理认证-c3039d55.png)

+ 本地账号测试

```
[root@master java-1.8.0-openjdk]# su - test
Last login: Wed Sep 11 00:27:30 EDT 2019 from ldap.test.com on pts/3
```

```
[root@master java-1.8.0-openjdk]# id test
uid=10001(test) gid=10001(testgroup) groups=10001(testgroup)
[root@master java-1.8.0-openjdk]# getent passwd test
test:*:10001:10001:test:/home/test:/bin/bash
```

+ SSH远程登录测试

```
[root@kdc slapd]# ssh test@10.211.55.11
test@10.211.55.11's password:
Last login: Wed Sep 11 00:26:39 2019 from ldap.test.com
[test@master ~]$ id
uid=10001(test) gid=10001(testgroup) groups=10001(testgroup) context=unconfined_u:unconfined_r:unconfined_t:s0-s0:c0.c1023
[test@master ~]$ hostname
master.test.com
```

+ 出错调试

```
systemctl stop nslcd
nslcd -d
```

## 参考链接

+ [CentOS 7上的LDAP身份验证](https://codeday.me/bug/20181110/370430.html)
+ [Centos 7 搭建Openldap客户端](https://www.jianshu.com/p/af295531eaf6)
