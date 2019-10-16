---
layout: "post"
title: "配置Knox代理Hadoop集群访问"
date: "2019-10-16 14:43"
categories: Hadoop
description: 配置Knox代理Hadoop集群访问
tags: Hadoop Knox CAS SSO
---

* content
{:toc}

<div class="postImg" style="background-image:url(http://carforeasy.cn/配置Knox代理Hadoop集群访问-965bb968.png)" ></div>
> “本文介绍在之前安装好的Hadoop 3集群之上配置Knox网关，结合CAS Server进行统一认证，来代理Hadoop集群的WEB访问。”






## 1. Knox安装

## 1.1 安装Knox

可以直接从[Knox网站](https://cwiki.apache.org/confluence/display/KNOX/Apache+Knox+Releases)下载knox-1.3.0.zip解压即可。

不过，后面在配置单点登录时出现问题，从源码使用JDK8重新编译了一回：

```
git clone https://gitbox.apache.org/repos/asf/knox.git
mvn -Ppackage,release clean install -DskipTests=true
```

## 1.2 基础配置

由于之前Hadoop集群开启了Kerberos认证，并采用了Kerberos + LDAP统一认证，需要为Knox生成keytab，并在gateway-site.xml配置。


+ 生成Keytab

```sh
addprinc -randkey -x dn="cn=knox,ou=services,ou=accounts,dc=test,dc=com" knox@TEST.COM
ktadd -kt knox.service.keytab knox@TEST.COM
addprinc  -x dn="cn=admin,ou=users,ou=accounts,dc=test,dc=com" admin@TEST.COM
```

+ gateway-site.xml

```xml
<configuration>

    <property>
        <name>gateway.port</name>
        <value>8443</value>
        <description>The HTTP port for the Gateway.</description>
    </property>

    <property>
        <name>gateway.path</name>
        <value>gateway</value>
        <description>The default context path for the gateway.</description>
    </property>

    <property>
        <name>gateway.gateway.conf.dir</name>
        <value>deployments</value>
        <description>The directory within GATEWAY_HOME that contains gateway topology files and deployments.</description>
    </property>

    <property>
        <name>gateway.hadoop.kerberos.secured</name>
        <value>true</value>
        <description>Boolean flag indicating whether the Hadoop cluster protected by Gateway is secured with Kerberos</description>
    </property>

    <property>
        <name>java.security.krb5.conf</name>
        <value>/opt/knox/conf/krb5.conf</value>
        <description>Absolute path to krb5.conf file</description>
    </property>

    <property>
        <name>java.security.auth.login.config</name>
        <value>/opt/knox/conf/krb5JAASLogin.conf</value>
        <description>Absolute path to JAAS login config file</description>
    </property>

    <property>
        <name>sun.security.krb5.debug</name>
        <value>true</value>
        <description>Boolean flag indicating whether to enable debug messages for krb5 authentication</description>
    </property>

    <!-- @since 0.10 Websocket configs -->
    <property>
        <name>gateway.websocket.feature.enabled</name>
        <value>false</value>
        <description>Enable/Disable websocket feature.</description>
    </property>

    <property>
        <name>gateway.scope.cookies.feature.enabled</name>
        <value>false</value>
        <description>Enable/Disable cookie scoping feature.</description>
    </property>

    <property>
        <name>gateway.cluster.config.monitor.ambari.enabled</name>
        <value>false</value>
        <description>Enable/disable Ambari cluster configuration monitoring.</description>
    </property>

    <property>
        <name>gateway.cluster.config.monitor.ambari.interval</name>
        <value>60</value>
        <description>The interval (in seconds) for polling Ambari for cluster configuration changes.</description>
    </property>

    <!-- Knox Admin related config -->
    <property>
        <name>gateway.knox.admin.groups</name>
        <value>admin</value>
    </property>

    <!-- DEMO LDAP config for Hadoop Group Provider -->
    <property>
        <name>gateway.group.config.hadoop.security.group.mapping</name>
        <value>org.apache.hadoop.security.LdapGroupsMapping</value>
    </property>
    <property>
        <name>gateway.group.config.hadoop.security.group.mapping.ldap.bind.user</name>
        <value>cn=admin,dc=test,dc=com</value>
    </property>
    <property>
        <name>gateway.group.config.hadoop.security.group.mapping.ldap.bind.password</name>
        <value>123456</value>
    </property>
    <property>
        <name>gateway.group.config.hadoop.security.group.mapping.ldap.url</name>
        <value>ldap://localhost:389</value>
    </property>
    <property>
        <name>gateway.group.config.hadoop.security.group.mapping.ldap.base</name>
        <value>dc=test,dc=com</value>
    </property>
    <property>
        <name>gateway.group.config.hadoop.security.group.mapping.ldap.search.filter.user</name>
        <value>(&amp;(|(objectclass=person)(objectclass=applicationProcess))(cn={0}))</value>
    </property>
    <property>
        <name>gateway.group.config.hadoop.security.group.mapping.ldap.search.filter.group</name>
        <value>(objectclass=posixGroup)</value>
    </property>
    <property>
        <name>gateway.group.config.hadoop.security.group.mapping.ldap.search.attr.member</name>
        <value>memberUid</value>
    </property>
    <property>
        <name>gateway.group.config.hadoop.security.group.mapping.ldap.search.attr.group.name</name>
        <value>cn</value>
    </property>
    <property>
        <name>gateway.dispatch.whitelist.services</name>
        <value>DATANODE,HBASEUI,HDFSUI,JOBHISTORYUI,NODEUI,YARNUI,knoxauth</value>
        <description>The comma-delimited list of service roles for which the gateway.dispatch.whitelist should be applied.</description>
    </property>
    <property>
        <name>gateway.dispatch.whitelist</name>
        <value>^https?:\/\/(localhost|127\.0\.0\.1|.*\.test\.com|0:0:0:0:0:0:0:1|::1):[0-9].*$</value>
        <description>The whitelist to be applied for dispatches associated with the service roles specified by gateway.dispatch.whitelist.services.
        If the value is DEFAULT, a domain-based whitelist will be derived from the Knox host.</description>
    </property>
    <property>
        <name>gateway.xforwarded.header.context.append.servicename</name>
        <value>LIVYSERVER</value>
        <description>Add service name to x-forward-context header for the list of services defined above.</description>
    </property>

</configuration>

```

在 gateway-site.xml 中 配置了转发whitelist:

```
^https?:\/\/(localhost|127\.0\.0\.1|.*\.test\.com|0:0:0:0:0:0:0:1|::1):[0-9].*$
```

之后就可以尝试启动Knox了：

```sh
useradd -G hadoop knox
chown -R knox:hadoop /opt/knox
/opt/knox/bin/knoxcli.sh create-master
su knox -c '/opt/knox/bin/gateway.sh start'
```


## 2. 配置Knox单点登录

### 2.1 运行CAS Server

下载[CAS overlay工程](https://github.com/apereo/cas-overlay-template)后修改工程配置，并将CAS配置为使用LDAP认证。

![](http://carforeasy.cn/配置Knox代理Hadoop集群访问-4b0d017d.png)

+ build.gradle


```
compile "org.apereo.cas:cas-server-support-json-service-registry:${casServerVersion}"
compile "org.apereo.cas:cas-server-support-ldap:${casServerVersion}"
```

+ application.properties

```
##
# CAS Server Context Configuration
#

spring.main.allow-bean-definition-overriding=true
#设定项目的目录 / 表示根目录
server.servelet.context-path=/
#端口号
server.port=9000

#SSL配置 开启https
server.ssl.enabled=true
server.ssl.key-store=classpath:tomcat.keystore
server.ssl.key-store-password=admin@123
#查看别名，别名不是瞎写的
#keytool -list -keystore D:/tomcat.keystore
server.ssl.keyAlias=tomcat

cas.tgc.secure=false
cas.warningCookie.secure=false

logging.config=classpath:/config/log4j2.xml

management.endpoints.web.exposure.include=httptrace

cas.monitor.endpoints.endpoint.httptrace.access=ANONYMOUS

#设置不实用ssl

server.max-http-header-size=2097152
server.use-forward-headers=true
server.connection-timeout=20000
server.error.include-stacktrace=ALWAYS

server.compression.enabled=true
server.compression.mime-types=application/javascript,application/json,application/xml,text/html,text/xml,text/plain

server.tomcat.max-http-post-size=2097152
server.tomcat.basedir=build/tomcat
server.tomcat.accesslog.enabled=true
server.tomcat.accesslog.pattern=%t %a "%r" %s (%D ms)
server.tomcat.accesslog.suffix=.log
server.tomcat.max-threads=10
server.tomcat.port-header=X-Forwarded-Port
server.tomcat.protocol-header=X-Forwarded-Proto
server.tomcat.protocol-header-https-value=https
server.tomcat.remote-ip-header=X-FORWARDED-FOR
server.tomcat.uri-encoding=UTF-8

spring.http.encoding.charset=UTF-8
spring.http.encoding.enabled=true
spring.http.encoding.force=true

##
# CAS Cloud Bus Configuration
#
spring.cloud.bus.enabled=false

#endpoints.enabled=false
#endpoints.sensitive=true

#endpoints.restart.enabled=false
#endpoints.shutdown.enabled=false

#management.security.enabled=true
#management.security.roles=ACTUATOR,ADMIN
#management.security.sessions=if_required
#management.context-path=/status
#management.add-application-context-header=false
#
#security.basic.authorize-mode=role
#security.basic.enabled=false
#security.basic.path=/status/

#cas.authn.accept.users=casuser::Mellon
#cas.authn.accept.name=Static Credentials

#cas.authn.ldap[0].type=AD|AUTHENTICATED|DIRECT|ANONYMOUS|SASL

cas.authn.ldap[0].type=AUTHENTICATED
cas.authn.ldap[0].ldapUrl=ldap://kdc.test.com
cas.authn.ldap[0].baseDn=ou=users,ou=accounts,dc=test,dc=com
cas.authn.ldap[0].searchFilter=cn={user}
cas.authn.ldap[0].bindDn=cn=admin,dc=test,dc=com
cas.authn.ldap[0].bindCredential=123456
cas.authn.ldap[0].useSsl=false
cas.authn.ldap[0].useStartTls=false
cas.authn.ldap[0].validateTimeout=PT100S
cas.authn.ldap[0].responseTimeout=PT100S
cas.authn.ldap[0].connectTimeout=PT120S


#cas.authn.ldap[0].userFilter=cn={user}
cas.authn.ldap[0].dnFormat=cn=%s,ou=users,ou=accounts,dc=test,dc=com
cas.authn.ldap[0].principalAttributePassword=
#cas.authn.ldap[0].saslMechanism=GSSAPI
#cas.authn.ldap[0].saslRealm=TEST.COM
#cas.authn.ldap[0].saslAuthorizationId=
#cas.authn.ldap[0].saslMutualAuth=
#cas.authn.ldap[0].saslQualityOfProtection=
#cas.authn.ldap[0].saslSecurityStrength=

#serviceRegistry.watcherEnabled=true
#serviceRegistry.repeatInterval=120000
#serviceRegistry.startDelay=15000
cas.serviceRegistry.initFromJson=true
cas.serviceRegistry.json.location=classpath:/services


#cas.serviceRegistry.initFromJson=true
#cas.serviceRegistry.json.location=file:/etc/cas/services
```


+ service.json


```
{
  "@class" : "org.apereo.cas.services.RegexRegisteredService",
  "serviceId" : "^https://.+",
  "name" : "testId",
  "id" : 1,
  "accessStrategy" : {
    "@class" : "org.apereo.cas.services.DefaultRegisteredServiceAccessStrategy",
    "enabled" : true,
    "ssoEnabled" : true
  }
}
```

+ 配置keystore

与配置文件对应：

```
#SSL配置 开启https
server.ssl.enabled=true
server.ssl.key-store=classpath:tomcat.keystore
server.ssl.key-store-password=admin@123
#查看别名，别名不是瞎写的
#keytool -list -keystore D:/tomcat.keystore
server.ssl.keyAlias=tomcat
```

生成keystore后，需要将CAS server证书公钥导出，并在knox运行机器上导入jre。

```
keytool -genkey -alias tomcat -keyalg RSA -dname "cn=cas.test.com" -keystore tomcat.keystore
keytool -export -alias tomcat -file cert.pem -keystore tomcat.keystore
#将证书导进cacert
keytool -import -trustcacerts -file cert.pem -alias knox -keystore "%JAVA_HOME%/jre/lib/security/cacerts"
```

### 2.2 Knoxsso配置

knoxsso配置通过pac4j至CAS上进行认证。

+ knoxsso.xml

```xml
<topology>
    <gateway>
      <provider>
        <role>webappsec</role>
        <name>WebAppSec</name>
        <enabled>true</enabled>
        <param><name>xframe.options.enabled</name><value>true</value></param>
      </provider>

  <provider>
          <role>federation</role>
          <name>pac4j</name>
          <enabled>true</enabled>
          <param>
            <name>pac4j.callbackUrl</name>
       <value>https://kdc.test.com:8443/gateway/knoxsso/api/v1/websso</value>
          </param>
          <param>
            <name>clientName</name>
            <value>CasClient</value>
          </param>

          <param>
            <name>cas.loginUrl</name>
            <value>https://cas.test.com:9000/login</value>
          </param>

      </provider>

        <provider>
            <role>identity-assertion</role>
            <name>Default</name>
            <enabled>true</enabled>
        </provider>

        <provider>
            <role>hostmap</role>
            <name>static</name>
            <enabled>true</enabled>
            <param>
                <name>localhost</name>
                <value>sandbox,sandbox.hortonworks.com</value>
            </param>
        </provider>

    </gateway>

    <application>
      <name>knoxauth</name>
    </application>

    <service>
        <role>KNOXSSO</role>
        <param>
            <name>knoxsso.cookie.secure.only</name>
            <value>true</value>
        </param>
        <param>
            <name>knoxsso.token.ttl</name>
            <value>-1</value>
        </param>
        <param>
            <name>knoxsso.redirect.whitelist.regex</name>
            <value>^https?:\/\/(localhost|127\.0\.0\.1|kdc\.test\.com|cas\.test\.com|0:0:0:0:0:0:0:1|::1):[0-9].*$</value>
        </param>
    </service>

</topology>
```

在服务配置文件sandbox.xml配置使用SSO认证。

+ sandbox.xml

```xml
<provider>
   <role>webappsec</role>
   <name>WebAppSec</name>
   <param>
       <name>cors.enabled</name>
       <value>true</value>
   </param>

</provider>

<provider>
   <role>federation</role>
   <name>SSOCookieProvider</name>
   <enabled>true</enabled>
   <param>
       <name>sso.authentication.provider.url</name>
       <value>https://kdc.test.com:8443/gateway/knoxsso/api/v1/websso</value>
   </param>

</provider>
<provider>
   <role>identity-assertion</role>
   <name>Default</name>
   <enabled>true</enabled>
</provider>
```

## 3. 服务测试
### 3.1 HDFS代理

+ 服务配置

```xml
<service>
    <role>HDFSUI</role>
    <url>http://master.test.com:50070/</url>
    <version>2.7.0</version>
</service>
<service>
    <role>NAMENODE</role>
    <url>hdfs://master.test.com:8020</url>
</service>

<service>
    <role>WEBHDFS</role>
    <url>http://master.test.com:50070/webhdfs</url>
</service>
```


+ 服务访问
  HDFS UI
  - [https://kdc.test.com:8443/gateway/sandbox/hdfs/](https://kdc.test.com:8443/gateway/sandbox/hdfs/)
  - [https://kdc.test.com:8443/gateway/sandbox/hdfs/dfshealth.html?host=http://master.test.com:50070](https://kdc.test.com:8443/gateway/sandbox/hdfs/dfshealth.html?host=http://master.test.com:50070)

  ![](http://carforeasy.cn/配置Knox代理Hadoop集群访问-182d6420.png)

  WEBHDFS

   - [https://kdc.test.com:8443/gateway/sandbox/webhdfs/v1/?op=LISTSTATUS](https://kdc.test.com:8443/gateway/sandbox/webhdfs/v1/?op=LISTSTATUS)


   ![](http://carforeasy.cn/配置Knox代理Hadoop集群访问-9c9db4cb.png)

### 3.2 Yarn代理

+ 服务配置

```xml
<service>
   <role>RESOURCEMANAGER</role>
   <url>http://master.test.com:8088/ws</url>
</service>

<service>
   <role>YARNUI</role>
   <url>http://master.test.com:8088/</url>
</service>
```


+ 服务访问


  YARN UI:
  - [https://kdc.test.com:8443/gateway/sandbox/yarn/](https://kdc.test.com:8443/gateway/sandbox/yarn/)


  ![](http://carforeasy.cn/配置Knox代理Hadoop集群访问-e8e663f5.png)

  ResourceManager:
  - [https://kdc.test.com:8443/gateway/sandbox/resourcemanager/v1/cluster/apps](https://kdc.test.com:8443/gateway/sandbox/resourcemanager/v1/cluster/apps)


  ![](http://carforeasy.cn/配置Knox代理Hadoop集群访问-d725444e.png)



## 4. 参考链接

+ [HDP 3.1.0 - Knox proxy HDFSUI - HTTP 401 Error](https://community.cloudera.com/t5/Support-Questions/HDP-3-1-0-Knox-proxy-HDFSUI-HTTP-401-Error/td-p/240282)
