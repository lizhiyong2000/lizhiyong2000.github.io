---
layout: "post"
title: "LDAP-Kerberos整合"
date: "2018-12-17 16:15"
categories: kerberos
description: LDAP-Kerberos整合
tags: kerberos
---

* content
{:toc}

<div class="postImg" style="background-image:url(http://carforeasy.cn/LDAP-e7dcceca.png)"></div>
> “在Hadoop集群配置中，通常LDAP用于账号管理，使用Kerberos进行认证，本来是两套独立的系统，两套独立的账户，通过配置kereros使用LDAP作为数据库，配置LDAP账户使用SASL方式进行kerberos认证，能将两套账户进行关联统一，结合CAS等方案，可实现一套账户统一认证。”






## 1. 环境准备
机器： centos 7，设置hostname：kdc.test.com，已安装好kerberos

下载jxplorer用于访问ldap服务。

## 2. OpenLDAP安装配置

### 2.1 安装OpenLDAP

```
[root@kdc ~]# yum install -y openldap-servers openldap-clients

[root@kdc ~]# slapd -VVV
@(#) $OpenLDAP: slapd 2.4.44 (Jan 29 2019 17:42:45) $
        mockbuild@x86-01.bsys.centos.org:/builddir/build/BUILD/openldap-2.4.44/openldap-2.4.44/servers/slapd

Included static backends:
    config
    ldif
    monitor
    bdb
    hdb
    mdb
```


### 2.2 数据库配置

```
rm -rf /var/lib/ldap/*
cp /usr/share/openldap-servers/DB_CONFIG.example /var/lib/ldap/DB_CONFIG
chown -R ldap.ldap /var/lib/ldap
```

### 2.3 主配置

>在2.4以前的版本中，OpenLDAP 使用 slapd.conf 配置文件来进行服务器的配置，而2.4开始则使用 slapd.d 目录保存细分后的各种配置，，其数据存储位置即目录 /etc/openldap/slapd.d。尽管该系统的数据文件是透明格式的，还是建议使用 ldapadd, ldapdelete, ldapmodify 等命令来修改而不是直接编辑。

默认配置文件保存在 /etc/openldap/slapd.d，将其备份：

```
cp -rf /etc/openldap/slapd.d /etc/openldap/slapd.d.bak
```

添加一些基本配置，并引入 kerberos 和 openldap 的 schema：

```
$ yum -y install krb5-server-ldap
$ cp /usr/share/doc/krb5-server-ldap-1.15.1/kerberos.schema /etc/openldap/schema/
$ vi /etc/openldap/slapd.conf
```


```sh
#!导入schema

include /etc/openldap/schema/core.schema
include /etc/openldap/schema/cosine.schema
include /etc/openldap/schema/duaconf.schema
include /etc/openldap/schema/dyngroup.schema
include /etc/openldap/schema/inetorgperson.schema
include /etc/openldap/schema/java.schema
include /etc/openldap/schema/misc.schema
include /etc/openldap/schema/nis.schema
include /etc/openldap/schema/openldap.schema
include /etc/openldap/schema/ppolicy.schema
include /etc/openldap/schema/collective.schema
include /etc/openldap/schema/kerberos.schema

#pid文件和args文件路径
pidfile /var/run/openldap/slapd.pid
argsfile /var/run/openldap/slapd.args

sasl-host localhost
sasl-secprops none

#日志级别设置
loglevel 296

# 模块设置
modulepath /usr/lib64/openldap
moduleload syncprov.la

#开启sasl设置，默认关闭
#TLSCACertificatePath /etc/openldap/certs
#TLSCertificateFile etc/openldap/certs/cert
#TLSCertificateKeyFile /etc/openldap/certs/password

#设置serverID，采用mirror mode模式进行部署
#serverID 1 ldap://kdc.test.com
#serverID 2 ldap://kdc2.test.com

#数据库权限控制
#数据库通用权限配置，会配置到olcDatabase={-1}frontend.ldif该文件中，访问所有数据库的通用权限
access to *
        by anonymous auth
        by self write
        by users read


#config数据库配置
database config
#权限设置
access to *
        by dn.exact=gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth manage
        by * break
#进行配置同步备份
#syncrepl rid=001
#              provider=ldap://kylin-203-122
#              bindmethod=simple
#              binddn="cn=config"
#              credentials=1234
#              searchbase="cn=config"
#              schemachecking=on
#              type=refreshAndPersist
#              retry="60 +"

#syncrepl rid=002
#              provider=ldap://kylin-203-130
#              bindmethod=simple
#              binddn="cn=config"
#              credentials=1234
#              searchbase="cn=config"
#              schemachecking=on
#              type=refreshAndPersist
#              retry="60 +"
#设置同步模块
#overlay syncprov
#开启mirrormode设置
#mirrormode on

#监控数据库配置，设置访问监控数据库的权限，开启该模块会对访问openldap服务的相关信息进行监控
database monitor
#设置访问monitor数据库的用户权限
access to *
        by dn.exact="gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth" read
        by dn.base="cn=admin,dc=test,dc=com" read
        by * none
###################################数据库权限控制#################################

###################################数据库配置#################################
#设置数据库类型为lmdb，官方推荐
database mdb
#进行权限设置

access to dn.base=""
        by * read

access to *
        by dn.exact="gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth" read
        by dn.base="cn=admin,dc=test,dc=com" write
        by * none

access to attrs=userPassword,shadowLastChange   
        by self write    
        by anonymous auth    
        by * none
#数据库匹配的前缀
suffix "dc=test,dc=com"
checkpoint 1024 15
#数据库管理员账户
rootdn "cn=admin,dc=test,dc=com"
#数据库管理员密码，使用slappasswd -s 123456命令生成
rootpw {SSHA}p2BbchDQHZPzmTmobnsBA9rPu/vMUlko
#数据库存储数据路径
directory /var/lib/ldap/mdb
#数据库存储最大值
maxsize 1048576
#数据库索引设置，索引objectclass、cn、uid
index objectclass,entryCSN,entryUUID eq
#数据库索引设置，索引linux账户
index uid,uidNumber,gidNumber eq,pres
#数据库索引设置，索引kerberos账户，未配置kerberos可省略
index ou,krbPrincipalName eq,pres,sub
#设置同步模块
#overlay syncprov
#syncprov-checkpoint 100 10
#syncprov-sessionlog 100

#mirror mode相关设置
#rid:保证每台服务器的rid是一样的
#provider:指向另外一台服务的ldap地址
#bindmethod:制定简单的鉴权模式，表示未开启sasl或者ssl模式
#binddn:设置进行同步的账户，默认等同于数据库账户
#credentials:设置同步账户的密码，默认等同于数据库账户
#searchbase:设置同步的根路径
#schemachecking:采用refreshAndPersist
#retry:重试次数，如果同步失败，每隔60s同步一次
#syncrepl rid=101
#              provider=ldap://kylin-203-122
#              bindmethod=simple
#              binddn="cn=admin,dc=bigdata,dc=ly"
#              credentials=1234
#              searchbase="dc=bigdata,dc=ly"
#              schemachecking=on
#              type=refreshAndPersist
#              retry="60 +"

#syncrepl rid=102
#              provider=ldap://kylin-203-130
#              bindmethod=simple
#              binddn="cn=admin,dc=bigdata,dc=ly"
#              credentials=1234
#              searchbase="dc=bigdata,dc=ly"
#              schemachecking=on
#              type=refreshAndPersist
#              retry="60 +"
#开启mirror mode模式
#mirrormode on
```

根据slapd.conf使用slaptest命令生成ldif格式的配置文件，更新slapd.d：


```
$ slaptest -f /etc/openldap/slapd.conf -F /etc/openldap/slapd.d
$ chown -R ldap:ldap /etc/openldap/slapd.d && chmod -R 700 /etc/openldap/slapd.d
$ systemctl start slapd
```



+ ldif文件配置参考

```
dn: olcDatabase={2}hdb,cn=config
changetype: modify
replace: olcSuffix
olcSuffix: dc=test,dc=com

dn: olcDatabase={2}hdb,cn=config
changetype: modify
replace: olcRootDN
# Temporary lines to allow initial setup
olcRootDN: cn=admin,dc=test,dc=com

dn: olcDatabase={2}hdb,cn=config
changetype: modify
add: olcRootPW
olcRootPW: 12345678
 
dn: cn=config
changetype: modify
add: olcAuthzRegexp
olcAuthzRegexp: uid=([^,]*),cn=GSSAPI,cn=auth cn=$1,ou=users,dc=test,dc=com

dn: olcDatabase={2}hdb,cn=config
changetype: modify
add: olcAccess
# Everyone can read everything
olcAccess: {0}to dn.base="" by * read
# The ldapadm dn has full write access
olcAccess: {1}to * by dn="cn=admin,dc=test,dc=com" write by * read

```

+ 日志相关配置

```
mkdir -p /var/log/slapd

chown ldap:ldap /var/log/slapd/

touch /var/log/slapd/slapd.log

chown ldap . /var/log/slapd/slapd.log

echo "local4.* /var/log/slapd/slapd.log" >> /etc/rsyslog.conf
systemctl restart rsyslog


cat log.ldif
dn: cn=config
changetype: modify
add: olcLogLevel
olcLogLevel: 32

[root@test1] ~$ ldapmodify -Y EXTERNAL -H ldapi:/// -f log.ldif

```

### 2.4 组织结构配置


+ 添加组织结构(base.ldif)

```
dn: dc=test,dc=com
dc: test
objectClass: dcObject
objectClass: organizationalUnit
ou: test.com

dn: ou=accounts,dc=test,dc=com
ou: accounts
objectClass: organizationalUnit

dn: ou=services,ou=accounts,dc=test,dc=com
ou: services
objectClass: organizationalUnit

dn: ou=users,ou=accounts,dc=test,dc=com
ou: users
objectClass: organizationalUnit

dn: ou=groups,ou=accounts,dc=test,dc=com
ou: groups
objectClass: organizationalUnit

#kerberos subtree
dn: cn=kerberos,dc=test,dc=com
cn: kerberos
objectClass: krbContainer
```

使用ldapadd命令进行添加：
```
ldapadd -x -D "cn=admin,dc=test,dc=com" -W -f base.ldif  
```
添加完成后进行测试：

```
[root@kdc ~]# ldapsearch -x -D "cn=admin,dc=test,dc=com" -W -b "dc=test,dc=com"
Enter LDAP Password:
# extended LDIF
#
# LDAPv3
# base <dc=test,dc=com> with scope subtree
# filter: (objectclass=*)
# requesting: ALL
#

# test.com
dn: dc=test,dc=com
dc: test
objectClass: dcObject
objectClass: organizationalUnit
ou: test.com

# accounts, test.com
dn: ou=accounts,dc=test,dc=com
ou: accounts
objectClass: organizationalUnit

# services, accounts, test.com
dn: ou=services,ou=accounts,dc=test,dc=com
ou: services
objectClass: organizationalUnit

# users, accounts, test.com
dn: ou=users,ou=accounts,dc=test,dc=com
ou: users
objectClass: organizationalUnit

# groups, accounts, test.com
dn: ou=groups,ou=accounts,dc=test,dc=com
ou: groups
objectClass: organizationalUnit

# kerberos, test.com
dn: cn=kerberos,dc=test,dc=com
cn: kerberos
objectClass: krbContainer

# search result
search: 2
result: 0 Success

# numResponses: 7
# numEntries: 6

```


+ 添加测试用户
```
dn: cn=test,ou=users,ou=accounts,dc=test,dc=com
cn: test
sn: test
objectclass: person
objectclass: inetOrgPerson
ou: users
userPassword: 123456
```

```
ldapmodify -D "cn=admin,dc=test,dc=com" -w 123456 -x -a -f user.ldif

ldapsearch -D "cn=admin,dc=test,dc=com" -w 123456 -b "dc=test,dc=com"
```

+ 修改密码

用户添加好以后，需要给其设定初始密码，运行命令如下：
```
$ ldappasswd -x -D 'cn=admin,dc=test,dc=com' -w 123456 "cn=test,ou=users,dc=example,dc=com" -S
```

+ 修改用户所属组
```
cat > add_user_to_groups.ldif << “EOF”

dn: cn=ldapgroup1,ou=users,dc=test,dc=com
changetype: modify
add: memberuid
memberuid: ldapuser1
EOF
````

+ 删除

删除用户或组条目：

$ ldapdelete -x -w 12345678 -D'cn=ldapadmin,ou=people,dc=example,dc=com' "cn=test,ou=people,dc=example,dc=com"

$ ldapdelete -x -w 12345678 -D'cn=ldapadmin,ou=people,dc=example,dc=com' "cn=test,ou=group,dc=example,dc=com"



## Kerberos安装配置，使用LDAP数据库

+ LDAP中添加kdc账户
```

dn: cn=kdc-adm,ou=services,ou=accounts,dc=test,dc=com
cn: kdc-adm
sn: kdc-adm
objectClass: inetOrgPerson
userPassword: 123456
uid: kdc-adm


dn: cn=kdc-srv,ou=services,ou=accounts,dc=test,dc=com
cn: kdc-srv
sn: kdc-srv
objectClass: inetOrgPerson
userPassword: 123456
uid: kdc-srv
```

```
ldapadd -x -D "cn=admin,dc=test,dc=com" -W -f kdcaccounts.ldif
```


+ 设置权限
```
dn: olcDatabase={2}mdb,cn=config
changetype: modify
replace: olcAccess
# Everyone can read everything
# The ldapadm dn has full write access
olcAccess: {4}to dn.base="cn=Subschema" by * read
olcAccess: {5}to attrs=userPKCS12 by self write by * auth
olcAccess: {6}to dn.subtree="dc=test,dc=com"
    by dn.exact="cn=kdc-adm,ou=services,ou=accounts,dc=test,dc=com" write
    by dn.exact="cn=kdc-srv,ou=services,ou=accounts,dc=test,dc=com" read
    by * read
```


```
ldapmodify -Y EXTERNAL -H ldapi:/// -f kdcpermission.ldif
```


+ 配置/var/kerberos/krb5kdc/kdc.conf

```
[kdcdefaults]
 kdc_ports = 88
 kdc_tcp_ports = 88

[realms]
 TEST.COM = {
  #master_key_type = aes256-cts
  acl_file = /var/kerberos/krb5kdc/kadm5.acl
  dict_file = /usr/share/dict/words
  admin_keytab = /var/kerberos/krb5kdc/kadm5.keytab
  supported_enctypes = aes256-cts:normal aes128-cts:normal des3-hmac-sha1:normal arcfour-hmac:normal camellia256-cts:normal camellia128-cts:normal des-hmac-sha1:normal des-cbc-md5:normal des-cbc-crc:normal
  database_module = openldap_ldapconf
 }

[dbdefaults]
    ldap_kerberos_container_dn = cn=kerberos,dc=test,dc=com

[dbmodules]
  openldap_ldapconf = {
    db_library = kldap
    ldap_kdc_dn = cn=kdc-srv,ou=services,ou=accounts,dc=test,dc=com
    ldap_kadmind_dn = cn=kdc-adm,ou=services,ou=accounts,dc=test,dc=com
    ldap_service_password_file = /var/kerberos/krb5kdc/ldap.stash
    ldap_servers = ldap://kdc.test.com/
    ldap_conns_per_server = 5
  }
```  




```
kdb5_ldap_util stashsrvpw -f /var/kerberos/krb5kdc/ldap.stash "cn=kdc-srv,ou=services,ou=accounts,dc=test,dc=com"
kdb5_ldap_util stashsrvpw -f /var/kerberos/krb5kdc/ldap.stash "cn=kdc-adm,ou=services,ou=accounts,dc=test,dc=com"
```
+ 生成数据库

```
kdb5_ldap_util -D cn=admin,dc=test,dc=com -w 123456 -H ldapi:// create -subtrees dc=test,dc=com -r TEST.COM -s
```

生成成功后可以在ldap数据库中看到kerberos下新建了TEST.COM的相关数据。

![](http://carforeasy.cn/LDAP-91aa94a8.png)


之后启动kerberos服务 krb5kdc和kadmin

cn=kerberos,dc=test,dc=com

+ 验证
kerberos使用ldap数据库后可以将kerberos的principal和ldap账户进行关联。
```
[root@kdc ~]# kadmin.local
Authenticating as principal root/admin@TEST.COM with password.
kadmin.local:  addprinc -x dn="cn=test,ou=users,ou=accounts,dc=test,dc=com" test@TEST.COM
WARNING: no policy specified for test@TEST.COM; defaulting to no policy
Enter password for principal "test@TEST.COM":
Re-enter password for principal "test@TEST.COM":
Principal "test@TEST.COM" created.
```
创建成功后可以看到test用户下多了很多krb开头的属性。

![](http://carforeasy.cn/LDAP-046b97f8.png)
## 3. OpenLDAP使用Kerberos进行认证

上述创建的test用户虽然在ldap数据库中只有一个条目，但是ldap账户和kerberos账户却使用单独的密码，可以配置LDAP使用SASL方式利用kerberos进行验认证，这样ldap账户密码就和kerberos账户密码统一起来。
### 3.1 SASL配置
> 需提前配置好krb5.conf，saslauthd和slapd在同一台机器上
+ saslauthd配置

```
yum -y install cyrus-sasl cyrus-sasl-devel cyrus-sasl-gssapi cyrus-sasl-lib
```

vim /etc/sysconfig/saslauthd

修改值
```
MECH=kerberos5
```
重启：systemctl restart saslauthd

+ slapd配置
创建vim /usr/lib64/sasl2/slapd.conf (有使用/etc/sasl2/slapd.conf)文件

内容：
```
mech_list: external gssapi plain
pwcheck_method: saslauthd
saslauthd_path: /var/run/saslauthd/mux
```
重启：systemctl restart slapd


```
kadmin.local: addprinc -x dn="cn=host/kdc.test.com,ou=services,ou=accounts,dc=test,dc=com" host/kdc.test.com@TEST.COM

kadmin.local: ktadd host/kdc.test.com@TEST.COM
```

``` klist -kt /etc/krb5.keytab
[root@kdc ~]# kinit  host/kdc.test.com@TEST.COM -kt /etc/krb5.keytab
[root@kdc ~]# testsaslauthd -u test -p 123456
0: OK "Success."
```



### 3.2 配置密码使用SASL验证
+ 使用Base64格式
> 使用base64格式时userPassword后面两个冒号::

将{SASL}test@TEST.COM使用base64加密
```sh
echo -n "{SASL}test@TEST.COM" | base64
e1NBU0x9dGVzdEBURVNULkNPTQ==
```

```

dn: cn=test,ou=users,dc=test,dc=com
changetype: modify
replace: userPassword
userPassword:: e1NBU0x9dGVzdEBURVNULkNPTQ==
```

+ 使用plain格式
> 使用plain格式时userPassword后面一个冒号:
```

dn: cn=test,ou=users,ou=accounts,dc=test,dc=com
changetype: modify
replace: userPassword
userPassword: {SASL}test@TEST.COM
```
ldapmodify -x -D "cn=admin,dc=test,dc=com" -W -f test.ldif

+ 测试密码修改

kadmin.local: cpw  test 修改为12345678
[root@kdc ~]# testsaslauthd -u test -p 12345678
0: OK "Success."

ldapsearch -x -D "cn=test,ou=users,ou=accounts,dc=test,dc=com" -W -b "dc=test,dc=com"

+ 使用旧密码123456
```
[root@kdc ~]# ldapsearch -x -D "cn=test,ou=users,ou=accounts,dc=test,dc=com" -W -b "dc=test,dc=com"
Enter LDAP Password:
ldap_bind: Invalid credentials (49)
```


+ 使用新密码12345678
```
[root@kdc ~]# ldapsearch -x -D "cn=test,ou=users,ou=accounts,dc=test,dc=com" -W -b "dc=test,dc=com"
Enter LDAP Password:
# extended LDIF
#
# LDAPv3
# base <dc=test,dc=com> with scope subtree
# filter: (objectclass=*)
# requesting: ALL
#

# test.com
dn: dc=test,dc=com
dc: test
objectClass: dcObject
objectClass: organizationalUnit
ou: test.com

# accounts, test.com
dn: ou=accounts,dc=test,dc=com
ou: accounts
objectClass: organizationalUnit

# services, accounts, test.com
dn: ou=services,ou=accounts,dc=test,dc=com
ou: services
objectClass: organizationalUnit

# users, accounts, test.com
dn: ou=users,ou=accounts,dc=test,dc=com
ou: users
objectClass: organizationalUnit

# groups, accounts, test.com
dn: ou=groups,ou=accounts,dc=test,dc=com
ou: groups
objectClass: organizationalUnit

# kerberos, test.com
dn: cn=kerberos,dc=test,dc=com
cn: kerberos
objectClass: krbContainer

# kdc-adm, services, accounts, test.com
dn: cn=kdc-adm,ou=services,ou=accounts,dc=test,dc=com
cn: kdc-adm
sn: kdc-adm
objectClass: inetOrgPerson
userPassword:: MTIzNDU2
uid: kdc-adm

# kdc-srv, services, accounts, test.com
dn: cn=kdc-srv,ou=services,ou=accounts,dc=test,dc=com
cn: kdc-srv
sn: kdc-srv
objectClass: inetOrgPerson
userPassword:: MTIzNDU2
uid: kdc-srv

# TEST.COM, kerberos, test.com
dn: cn=TEST.COM,cn=kerberos,dc=test,dc=com
cn: TEST.COM
objectClass: top
objectClass: krbRealmContainer
objectClass: krbTicketPolicyAux
krbSubTrees: dc=test,dc=com

# K/M@TEST.COM, TEST.COM, kerberos, test.com
dn: krbPrincipalName=K/M@TEST.COM,cn=TEST.COM,cn=kerberos,dc=test,dc=com
krbLoginFailedCount: 0
krbMaxTicketLife: 86400
krbMaxRenewableAge: 0
krbTicketFlags: 64
krbPrincipalName: K/M@TEST.COM
krbPrincipalExpiration: 19700101000000Z
krbPrincipalKey:: MG6gAwIBAaEDAgEBogMCAQGjAwIBAKRYMFYwVKAHMAWgAwIBAKFJMEegAwIB
 EqFABD4gAPJwa23LZ4+8NjdV0E8OSkxjfWHIHlFQtC/qsQ53tXRXTzCgAcNPTD8c6YDWg2w9J7CUR
 msxaTCVq2PKTw==
krbLastPwdChange: 19700101000000Z
krbExtraData:: AAkBAAEAnHp3XQ==
krbExtraData:: AAKcenddZGJfY3JlYXRpb25AVEVTVC5DT00A
krbExtraData:: AAcBAAIAAlYAAAAAAAA=
objectClass: krbPrincipal
objectClass: krbPrincipalAux
objectClass: krbTicketPolicyAux

# krbtgt/TEST.COM@TEST.COM, TEST.COM, kerberos, test.com
dn: krbPrincipalName=krbtgt/TEST.COM@TEST.COM,cn=TEST.COM,cn=kerberos,dc=test,
 dc=com
krbLoginFailedCount: 0
krbMaxTicketLife: 86400
krbMaxRenewableAge: 0
krbTicketFlags: 0
krbPrincipalName: krbtgt/TEST.COM@TEST.COM
krbPrincipalExpiration: 19700101000000Z
krbPrincipalKey:: MIICoqADAgEBoQMCAQGiAwIBAaMDAgEApIICijCCAoYwVKAHMAWgAwIBAKFJ
 MEegAwIBEqFABD4gAGEkkTK+1Z3n+lv8dQWJUCF3ePjQfztXTh8R3R5y8CQbk6PhCoU0WKLLCf2nG
 wQQmFPcxJ4usMQAlLU/QjBEoAcwBaADAgEAoTkwN6ADAgERoTAELhAA5QETdoGxkkh5eh2BJ1WDjO
 tHThAmcB/g8mW4QZX0SHmjIS9a/g9GiZzh2X8wTKAHMAWgAwIBAKFBMD+gAwIBEKE4BDYYALitn65
 7M9xhRQCeGKWcpm2t+IPjqNYPSS0bUW1M4WEufn4N7+tODpLykt8XNO6s8UJs8hUwRKAHMAWgAwIB
 AKE5MDegAwIBF6EwBC4QAMbfw4ZU6QMaSDWe27X7pGX9TpU7RPjPEKP7hb4AI4WglSFJhFsjLpf7q
 TFPMFSgBzAFoAMCAQChSTBHoAMCARqhQAQ+IADHL5iYVuCmExdMLzt2rdH3Qx98naQZ7NYAEVMXLt
 H7L9N9DsvP4YZFVTep585OooIZ59Oq5uUhzy9+2YcwRKAHMAWgAwIBAKE5MDegAwIBGaEwBC4QACN
 QSfSFjd7tBJZP84pZ82DK2KE6w8U0jtYJtOgogw84wgs4UFw87Da1n53jMDygBzAFoAMCAQChMTAv
 oAMCAQihKAQmCACJlw6JuBU68HpCiHhtvefksegfA1HKSEHo8dD+FY+sP6oOw/YwPKAHMAWgAwIBA
 KExMC+gAwIBA6EoBCYIAKToxYzvd3VaGs1QhLzQ6mIztBA9JP2CKKtlH22mQF6yVrpimDA8oAcwBa
 ADAgEAoTEwL6ADAgEBoSgEJggALKKmJY3u4tBn9MXnOVYvePXSlLyhJZRjNj9Bt+55vgKc1lUM
krbLastPwdChange: 19700101000000Z
krbExtraData:: AAKcenddZGJfY3JlYXRpb25AVEVTVC5DT00A
krbExtraData:: AAcBAAIAAlYAAAAAAAA=
objectClass: krbPrincipal
objectClass: krbPrincipalAux
objectClass: krbTicketPolicyAux

# kadmin/admin@TEST.COM, TEST.COM, kerberos, test.com
dn: krbPrincipalName=kadmin/admin@TEST.COM,cn=TEST.COM,cn=kerberos,dc=test,dc=
 com
krbLoginFailedCount: 0
krbMaxTicketLife: 10800
krbMaxRenewableAge: 0
krbTicketFlags: 4
krbPrincipalName: kadmin/admin@TEST.COM
krbPrincipalExpiration: 19700101000000Z
krbPrincipalKey:: MIICoqADAgEBoQMCAQGiAwIBAaMDAgEApIICijCCAoYwVKAHMAWgAwIBAKFJ
 MEegAwIBEqFABD4gAD6sb2FUxosrMJpMbzfF961Cw26uNWo2bvFHmcFdjhwqoYv4pHe7QOTUz0UBV
 yNZEGJLXjdLVZyLAdp4MjBEoAcwBaADAgEAoTkwN6ADAgERoTAELhAAiuzvmDYgufBrQoUGxDk3U7
 LrYpmiP8Dtya4BMQAqh0r/Sg04BVH+QppE0ukwTKAHMAWgAwIBAKFBMD+gAwIBEKE4BDYYAP+VbMs
 +20It4s7BKGAas5IOSNetllSzomDeBey3GkcCT8mYIJ4ZaPUraIAFHNrm5eYkSBYwRKAHMAWgAwIB
 AKE5MDegAwIBF6EwBC4QAAKWz0rFGm3rJpWeFC28Wey3ryppbEDpberpMtUa+OzPhSgPWVkgKqHCA
 uBwMFSgBzAFoAMCAQChSTBHoAMCARqhQAQ+IAAg+HUtnyrmd63eIYbhb6rZ/08IlKswfvjTXxwDLW
 F+ldZwdwbb4Loo59nQ01WjMMTuFVQVjwH0533Ss+wwRKAHMAWgAwIBAKE5MDegAwIBGaEwBC4QAJG
 yRPh5WZ+x9/c55RUWJJAS6cQ9n+YCtp4twCEbfF8gmvEHrDDNJX+4vG+dMDygBzAFoAMCAQChMTAv
 oAMCAQihKAQmCACUjSwm5ZCY+a/fWesB+W+WNBGtdjDM/+SGFSwSN4p7EEJyAtwwPKAHMAWgAwIBA
 KExMC+gAwIBA6EoBCYIABM6OezW1HF/WcHOVDshAfN75hZ9mUJfbMSrt3Cf7k9S6W/PfjA8oAcwBa
 ADAgEAoTEwL6ADAgEBoSgEJggA3RmY1uYby0IWkSk1skHH1GPliGcQb6Ash89Hmgsf86vcF5x3
krbLastPwdChange: 19700101000000Z
krbExtraData:: AAKcenddZGJfY3JlYXRpb25AVEVTVC5DT00A
krbExtraData:: AAcBAAIAAlYAAAAAAAA=
objectClass: krbPrincipal
objectClass: krbPrincipalAux
objectClass: krbTicketPolicyAux

# kadmin/kdc.test.com@TEST.COM, TEST.COM, kerberos, test.com
dn: krbPrincipalName=kadmin/kdc.test.com@TEST.COM,cn=TEST.COM,cn=kerberos,dc=t
 est,dc=com
krbLoginFailedCount: 0
krbMaxTicketLife: 10800
krbMaxRenewableAge: 0
krbTicketFlags: 4
krbPrincipalName: kadmin/kdc.test.com@TEST.COM
krbPrincipalExpiration: 19700101000000Z
krbPrincipalKey:: MIICoqADAgEBoQMCAQGiAwIBAaMDAgEApIICijCCAoYwVKAHMAWgAwIBAKFJ
 MEegAwIBEqFABD4gAOQKHsr7/XlS4Sx5wwQv5m1YzpAtbWTJiVQwDANIXaXECTrZjep4lLMpNQjpu
 aN9tZyeE2+HljJQTdQsZTBEoAcwBaADAgEAoTkwN6ADAgERoTAELhAAOW+tEl/V/rCcb4rN24RbTB
 V9QMafuhFHb6BnLYuWKPLqmWHRSFVNlBa8r2AwTKAHMAWgAwIBAKFBMD+gAwIBEKE4BDYYAFfxkEh
 53ivlSit0fQegTVcqd3uufb8k+mim+28dDyREXCsOwkqvpABhOCCCaPV1EVwFl7swRKAHMAWgAwIB
 AKE5MDegAwIBF6EwBC4QAJGkjOSdlrcLjFLtXDFLW1SpDsudUt6MX5qkDUWx4gs5tf3//AxIWykPE
 IZbMFSgBzAFoAMCAQChSTBHoAMCARqhQAQ+IABRoVSGSEd/eSghWLFEsTUG8T1GVjgm5U6O3+HgIG
 +DyUpyN/ZBDhOlxsqzUxqyeeCs6gjJKG2T+FyMlCgwRKAHMAWgAwIBAKE5MDegAwIBGaEwBC4QAO2
 7a9iPpGft6vxObvVrDG9raAmjm3BggkUm/r36ZRduo5lwiIF5vgEKFzuxMDygBzAFoAMCAQChMTAv
 oAMCAQihKAQmCAACLxFGNaoPy5+U5vVdRlBgDDY94fiXKc27t/+6U48LzGp/rHowPKAHMAWgAwIBA
 KExMC+gAwIBA6EoBCYIAPHsg8GBmvO3iMRUCMydCU9xafme2qkVchJBaOqY3aqpPyUK4TA8oAcwBa
 ADAgEAoTEwL6ADAgEBoSgEJggAhxfX7T73G8JuV2WTG6fnR64Ckt+ZWVWAzfHivfx5lO6cYJ8m
krbLastPwdChange: 19700101000000Z
krbExtraData:: AAKcenddZGJfY3JlYXRpb25AVEVTVC5DT00A
krbExtraData:: AAcBAAIAAlYAAAArY4Y=
objectClass: krbPrincipal
objectClass: krbPrincipalAux
objectClass: krbTicketPolicyAux

# kiprop/kdc.test.com@TEST.COM, TEST.COM, kerberos, test.com
dn: krbPrincipalName=kiprop/kdc.test.com@TEST.COM,cn=TEST.COM,cn=kerberos,dc=t
 est,dc=com
krbLoginFailedCount: 0
krbMaxTicketLife: 86400
krbMaxRenewableAge: 0
krbTicketFlags: 0
krbPrincipalName: kiprop/kdc.test.com@TEST.COM
krbPrincipalExpiration: 19700101000000Z
krbPrincipalKey:: MIICoqADAgEBoQMCAQGiAwIBAaMDAgEApIICijCCAoYwVKAHMAWgAwIBAKFJ
 MEegAwIBEqFABD4gAKQB/zsYR8e71NtrBOAscXarzRBstfX8TXHuSJNjixmLAaivkoBVQuo0hK959
 2FvCLcZbAzV1LcA3B0pZTBEoAcwBaADAgEAoTkwN6ADAgERoTAELhAAC5uc7wIeI2Rn9lX4iLj6qw
 C1a/Nwo0pKUtBQkFrWpIpYHSslDMSAyqg/pz8wTKAHMAWgAwIBAKFBMD+gAwIBEKE4BDYYAEwzeyn
 P1H/e8+fYa4ToSAsqwCbuQC+5z3IjMl8m2+2NEc8v7fa0A4pP1vd44Q3mff7Y56gwRKAHMAWgAwIB
 AKE5MDegAwIBF6EwBC4QAMVda289l7Z0JWTxejslJAYxy3pVkmtakDOQUNfIIpyxDfvLJlRl03Ua7
 0ZxMFSgBzAFoAMCAQChSTBHoAMCARqhQAQ+IACepmmo1FLCRKv5UjLIcot1u1gkjIqlwEjQ6eDxz2
 jIKfr8dm3CSpFQFcbZnIw2+SY0LcuWzxJxCMDkshMwRKAHMAWgAwIBAKE5MDegAwIBGaEwBC4QAAP
 G0grtCqU5luwBbO3Et9EQhJV/iNUHKsXrZyw4A8z4d9/3Q+FxOM6qhyHWMDygBzAFoAMCAQChMTAv
 oAMCAQihKAQmCACdaaNu805kFMg7iLYMtpazK0aR9DpyJ23xjHkU+/s3+a3GHAQwPKAHMAWgAwIBA
 KExMC+gAwIBA6EoBCYIAFY/D4b8H8Q6x47L2XnIFhio3QkfHXWx/Zb8DXhsdzVIO2vr3TA8oAcwBa
 ADAgEAoTEwL6ADAgEBoSgEJggAj6kk6aLMDNgNSZlgga610PGhZgn9ZBQNW/MSHrDpbKQud9NP
krbLastPwdChange: 19700101000000Z
krbExtraData:: AAKcenddZGJfY3JlYXRpb25AVEVTVC5DT00A
krbExtraData:: AAcBAAIAAlYAAAArY4Y=
objectClass: krbPrincipal
objectClass: krbPrincipalAux
objectClass: krbTicketPolicyAux

# kadmin/changepw@TEST.COM, TEST.COM, kerberos, test.com
dn: krbPrincipalName=kadmin/changepw@TEST.COM,cn=TEST.COM,cn=kerberos,dc=test,
 dc=com
krbLoginFailedCount: 0
krbMaxTicketLife: 300
krbMaxRenewableAge: 0
krbTicketFlags: 8196
krbPrincipalName: kadmin/changepw@TEST.COM
krbPrincipalExpiration: 19700101000000Z
krbPrincipalKey:: MIICoqADAgEBoQMCAQGiAwIBAaMDAgEApIICijCCAoYwVKAHMAWgAwIBAKFJ
 MEegAwIBEqFABD4gAGRJqP/WPRa6P1w5yrg/dt4iPxW4Lxd8AVGuJFqQTeeg4iD1rOGuJlVQe501+
 WVjxUV1ee92kIpKSavmmDBEoAcwBaADAgEAoTkwN6ADAgERoTAELhAAhV5Ni7Lj2v6ziD83p+CpVe
 BRFqKxL8WXmgl6h8jN5V/06NQyimLj68jWkBkwTKAHMAWgAwIBAKFBMD+gAwIBEKE4BDYYAFTOjKH
 k7u/YuGRDePoY149gYig19L/KJdo9Oqmp6CVY4KtsZ9pkttNkyVbQ4x0dhUCMYk8wRKAHMAWgAwIB
 AKE5MDegAwIBF6EwBC4QAEoemXqjTW8AKMAoTyXNGL6POI5AULYUt1RxoGqPRb5xorDUUAjAw/uWk
 IcVMFSgBzAFoAMCAQChSTBHoAMCARqhQAQ+IACVr2gRDCIPGT5gbGzPG1B5ZNpGRZhHzYsMaErMl6
 Xqc4SxFgzPGZa3c0pupjfb6dnvV8wUO+8Nc6zYeCMwRKAHMAWgAwIBAKE5MDegAwIBGaEwBC4QANS
 wzeCNgdJjFqq43dKmO6btphchPtgPrtkZ3Zcud0jJJ2JekbNciTs1bmevMDygBzAFoAMCAQChMTAv
 oAMCAQihKAQmCACuo9Xf+suviI3OAyO/+rtZx2jNttL+Qyi51JU5Mq79O2Lpn4gwPKAHMAWgAwIBA
 KExMC+gAwIBA6EoBCYIAEFiiyQKtoE1RrMGi9OWlW12cTamtOnrZBxwAkbl8Gg1cDGJpTA8oAcwBa
 ADAgEAoTEwL6ADAgEBoSgEJggAaEpYOHVTFogjaCjJvjrgcNIR7160H3lMawn76He6gvg13LUu
krbLastPwdChange: 19700101000000Z
krbExtraData:: AAKcenddZGJfY3JlYXRpb25AVEVTVC5DT00A
krbExtraData:: AAcBAAIAAlYAAAArY4Y=
objectClass: krbPrincipal
objectClass: krbPrincipalAux
objectClass: krbTicketPolicyAux

# kadmin/history@TEST.COM, TEST.COM, kerberos, test.com
dn: krbPrincipalName=kadmin/history@TEST.COM,cn=TEST.COM,cn=kerberos,dc=test,d
 c=com
krbLoginFailedCount: 0
krbMaxTicketLife: 86400
krbMaxRenewableAge: 0
krbTicketFlags: 0
krbPrincipalName: kadmin/history@TEST.COM
krbPrincipalExpiration: 19700101000000Z
krbPrincipalKey:: MG6gAwIBAaEDAgEBogMCAQGjAwIBAKRYMFYwVKAHMAWgAwIBAKFJMEegAwIB
 EqFABD4gAEM+HzWcHoWEhW6LNAQ149SmKjPQbY39Y7tYD6MiXIY9wh5Ueqge46dMJieOYugKtoDml
 fJM2/WIJ+VNMA==
krbLastPwdChange: 19700101000000Z
krbExtraData:: AAKcenddZGJfY3JlYXRpb25AVEVTVC5DT00A
krbExtraData:: AAcBAAIAAlYAAAArY4Y=
objectClass: krbPrincipal
objectClass: krbPrincipalAux
objectClass: krbTicketPolicyAux

# test, users, accounts, test.com
dn: cn=test,ou=users,ou=accounts,dc=test,dc=com
cn: test
sn: test
objectClass: person
objectClass: inetOrgPerson
objectClass: krbPrincipalAux
objectClass: krbTicketPolicyAux
ou: users
krbPrincipalName: test@TEST.COM
krbLoginFailedCount: 0
krbTicketFlags: 0
krbPrincipalKey:: MIICZKADAgEBoQMCAQGiAwIBAqMDAgEBpIICTDCCAkgwVKAHMAWgAwIBAKFJ
 MEegAwIBEqFABD4gAKZG9+xRxnKS1IRHnkJfwVN8RLXI6thzE9wK0mg4b0jx7lasgH1zs+UrDJBee
 YaOAasR7UYo7WHbAbk5tzBEoAcwBaADAgEAoTkwN6ADAgERoTAELhAAipuleM1dC4aDECtHY5n9UA
 4qiU3h9jU70Q918YRrY58hvCUS1rkQKxAfNfkwTKAHMAWgAwIBAKFBMD+gAwIBEKE4BDYYAF6aSL8
 3jCJ8+TBJa8962BlmAkOKen0XHuWFEYTIrlKZ7Nex5pzy0aMHBIWfDlbd3SWf8xAwRKAHMAWgAwIB
 AKE5MDegAwIBF6EwBC4QABvefH60FTl69/hIKGhiFCK9HYiuqiMG2ystHyONJbgcvE/v2mgNhfN9r
 FxyMFSgBzAFoAMCAQChSTBHoAMCARqhQAQ+IAA/pC3s2J72lXxwLip9yDE0od3/RtNb1s9GQNXpY7
 3sIF5zhnX8mi117aoqMNDWsHBELT10oGSLWT/2VtIwRKAHMAWgAwIBAKE5MDegAwIBGaEwBC4QAAF
 l81nh0Kd86KufvtpM1m81IbectfOk+o0ysj59HVNBbmWrCPH8ezojxxUtMDygBzAFoAMCAQChMTAv
 oAMCAQihKAQmCAATN4u2P7jE5rAPS1Ogd76GKeuHde1Gp0DXPq4/AfFPpWGrog0wPKAHMAWgAwIBA
 KExMC+gAwIBA6EoBCYIAHArhmoQkiRxApkO89gTOZDlfyCPigfz4RWwTVi5e+S1aPApoA==
krbPasswordExpiration: 19700101000000Z
krbLastPwdChange: 20190910113216Z
krbExtraData:: AALAiXddcm9vdC9hZG1pbkBURVNULkNPTQA=
krbExtraData:: AAgBAA==
userPassword:: e1NBU0x9dGVzdEBURVNULkNPTQ==

# host/kdc.test.com, services, accounts, test.com
dn: cn=host/kdc.test.com,ou=services,ou=accounts,dc=test,dc=com
cn: host/kdc.test.com
objectClass: inetOrgPerson
objectClass: organizationalPerson
objectClass: person
objectClass: top
objectClass: krbPrincipalAux
objectClass: krbTicketPolicyAux
sn: host/kdc.test.com
krbPrincipalName: host/kdc.test.com@TEST.COM
krbLoginFailedCount: 0
krbPrincipalKey:: MIICZKADAgEBoQMCAQGiAwIBA6MDAgEBpIICTDCCAkgwVKAHMAWgAwIBAKFJ
 MEegAwIBEqFABD4gABGChoF+VTQuOwFOq5FwwRA9Lp8mfq/0Ag8ZX5oszLeobzSRmAYEVeTON12X5
 MdejAFcp4yqbi7A9o5mcjBEoAcwBaADAgEAoTkwN6ADAgERoTAELhAAg3blUJ4nSJvbAq89HHhfvu
 DO6ow7R6mLxUIqqhZN3K6gsR7tvSbU+17I0rUwTKAHMAWgAwIBAKFBMD+gAwIBEKE4BDYYAOMngmc
 MKNr4lemP0UPoZAMC4eEyfEk387//IuG93GvTLQR+OVTKIA54LenT3SPX0B+Q91AwRKAHMAWgAwIB
 AKE5MDegAwIBF6EwBC4QAFE+ljl8JzALwVcWrb3f0dt0JzaYDoCjTqUb0n5J0WCNx0/I5pIDaIdO2
 JWLMFSgBzAFoAMCAQChSTBHoAMCARqhQAQ+IAD9CR/FGWKH8LBWndXMwC/QpKMixDoCSjmVtHrBC7
 3BhyL5Jt6wSbfQ0EjFBrFGXfmk7OphYl3MOW/YvAswRKAHMAWgAwIBAKE5MDegAwIBGaEwBC4QABc
 gl8QTgJVwxETkdcutKj2Qmq7NKjrpEgxWelxkddR1ZyYwnmCg/kRMLonXMDygBzAFoAMCAQChMTAv
 oAMCAQihKAQmCABAlaX2x9FIPHlxNkCiPFuyr3LokpZE25QepJwSM1+GJSiC54cwPKAHMAWgAwIBA
 KExMC+gAwIBA6EoBCYIAD1HAGutt0boMkyn0Cd/Cl5g2AX68Nc4ypBF/eI0nE22/AYS3w==
krbPasswordExpiration: 19700101000000Z
krbLastPwdChange: 20190910112734Z
krbExtraData:: AAKmiHddcm9vdC9hZG1pbkBURVNULkNPTQA=
krbExtraData:: AAgBAA==

# search result
search: 2
result: 0 Success

# numResponses: 19
# numEntries: 18
```

## 4. 参考链接

+ [OpenLDAP安装与配置](https://www.ilanni.com/?p=13775)
+ [Kerberos + OpenLDAP 配置](http://secfree.github.io/blog/2015/06/29/kerberos-ldap-deploy.html)
+ [配置Kerberos+LDAP整合，共用LDAP 数据库](https://blog.csdn.net/ZhouyuanLinli/article/details/78323331)
+ [Kerberos+LDAP认证整合](https://blog.csdn.net/zhouyuanlinli/article/details/78403004)
+ [使用 LDAP + Kerberos 实现集中用户认证及授权系统](http://www.voidcn.com/article/p-cbdvkjzb-bea.html)
+ [How to Reset the Directory Manager Password](https://directory.fedoraproject.org/docs/389ds/howto/howto-resetdirmgrpassword.html)
+ [我花了一个五一终于搞懂了OpenLDAP](https://juejin.im/entry/5aec6ac46fb9a07ac3635884)
+ [最全的openldap安装部署](https://blog.csdn.net/dockj/article/details/82392263)
