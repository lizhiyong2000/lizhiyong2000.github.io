---
layout: "post"
title: "使用Docker搭建Ambari调试环境"
date: "2019-01-29 10:37"
categories: Ambari
description: 使用Docker搭建Ambari调试环境
tags: Docker Ambari
---

* content
{:toc}

<div class="postImg" style="background-image:url(http://pjpst7ucp.bkt.clouddn.com/2018-9ed086df.png)"></div>
> “Ambari是Hadoop（指Hadoop生态圈，包括HBase，Hive等）集群管理软件，其具有创建、管理、监视Hadoop集群的功能。Ambari也是Apache软件基金会中的顶级项目，目前最新的发布版本是2.7.3。”

<br />

>本文所用代码请参考：<https://github.com/lizhioyng2000/docker-k8s>

## 使用Docker编译Ambari源码
+ 1 源码编译环境准备
Ubuntu中编译Ambari源码需要安装的软件：
  - JDK 8
  - Python 2.7 (包括libpython2.7-dev)
  - g++
  - git

从Ambari源码地址下载Ambari源码：<https://archive.apache.org/dist/ambari/ambari-2.7.3/>

启动Ubuntu 18.04 Dcoker容器，执行命令

```shell
wget http://www.apache.org/dist/ambari/ambari-2.7.3/apache-ambari-2.7.3-src.tar.gz (use the suggested mirror from above)
tar xfvz apache-ambari-2.7.3-src.tar.gz
cd apache-ambari-2.7.3-src
mvn versions:set -DnewVersion=2.7.3.0.0

pushd ambari-metrics
mvn versions:set -DnewVersion=2.7.3.0.0
popd

mvn -B clean install package jdeb:jdeb -DnewVersion=2.0.0.0 -DskipTests -Dpython.ver="python >= 2.6"
```

![](http://pjpst7ucp.bkt.clouddn.com/使用docker搭建ambari调试环境-a40a2baa.png)

+ 2 编译所用Dockerfile
```yaml
FROM lizhiyong2000/ubuntu:18.04
#MAINTAINER lizhiyong2000@gmail.com

# AMBARI

ENV MAVEN_VERSION=3.6.0 \
    MAVEN_HOME=/opt/maven \
    AMBARI_VERSION=2.7.3 \
    AMBARI_VERSION_BUILD=2.7.3.0.0 \
    AMBARI_HOME=/opt/ambari \
    AMBARI_SRC_HOME=/opt/ambari_src \
    PATH=$PATH:/opt/maven/bin


RUN mkdir $MAVEN_HOME && curl -fSL --retry 3 \
  "http://www.apache.org/dist/maven/maven-3/$MAVEN_VERSION/binaries/apache-maven-$MAVEN_VERSION-bin.tar.gz" \
  | tar --strip-components=1 -zxf - -C $MAVEN_HOME \
    &&  mkdir $AMBARI_SRC_HOME && curl -fSL --retry 3 \
  "http://www.apache.org/dist/ambari/ambari-$AMBARI_VERSION/apache-ambari-$AMBARI_VERSION-src.tar.gz" \
  | tar --strip-components=1 -zxf - -C $AMBARI_SRC_HOME \
  && rm -rf /tmp/* /var/tmp/*
 # && chown -R root:root $AMBARI_HOME


RUN apt-get update \
    && apt-get install --no-install-recommends -y \
      python2.7 \
      libpython2.7-dev \
      python2.7-setuptools \
      python-pip \
      git \
      g++ \
    && rm  /usr/bin/python && ln -s /usr/bin/python2.7 /usr/bin/python \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


RUN cd $AMBARI_SRC_HOME \
&& mvn versions:set -DnewVersion=$AMBARI_VERSION_BUILD \
&& cd ambari-metrics \
&& mvn versions:set -DnewVersion=$AMBARI_VERSION_BUILD \
&& cd .. \
&& mvn -B clean install jdeb:jdeb -DnewVersion=2.7.3.0.0 -DbuildNumber=4295bb16c439cbc8fb0e7362f19768dde1477868 -DskipTests -Dpython.ver="python >= 2.6"

RUN mkdir $AMBARI_HOME && cd $AMBARI_HOME && cp $AMBARI_SRC_HOME/ambari-server/target/*.deb $AMBARI_HOME && cp $AMBARI_SRC_HOME/ambari-agent/target/*.deb $AMBARI_HOME  \
    && rm -rf $AMBARI_SRC_HOME && rm -rf /root/.m2 && rm -rf /tmp/* /var/tmp/*
```
+ 3 编译问题
  1). ambari-admin 编译错误：
  ```
  Failed to execute goal org.codehaus.mojo:exec-maven-plugin:1.2.1:exec (Bower install)
  ```
  ```
  [INFO] ------------------------------------------------------------------------
  [INFO] BUILD FAILURE
  [INFO] ------------------------------------------------------------------------
  [INFO] Total time:  01:45 min
  [INFO] Finished at: 2019-01-29T07:03:36Z
  [INFO] ------------------------------------------------------------------------
  [ERROR] Failed to execute goal org.codehaus.mojo:exec-maven-plugin:1.2.1:exec (Bower install) on project ambari-admin: Command execution failed.: Process exited with an error: 1 (Exit value: 1) -> [Help 1]
  [ERROR]
  [ERROR] To see the full stack trace of the errors, re-run Maven with the -e switch.
  [ERROR] Re-run Maven using the -X switch to enable full debug logging.
  [ERROR]
  [ERROR] For more information about the errors and possible solutions, please read the following articles:
  [ERROR] [Help 1] http://cwiki.apache.org/confluence/display/MAVEN/MojoExecutionException
  [ERROR]
  [ERROR] After correcting the problems, you can resume the build with the command
  [ERROR]   mvn <goals> -rf :ambari-admin
  ```
  原因：未安装git，安装git即可
## Ambari Docker镜像制作
将Docker中编译完成的Ambari-Server、Ambari-Agent 安装文件拷贝出来，分别制作镜像

![](http://pjpst7ucp.bkt.clouddn.com/使用docker搭建ambari调试环境-b13f3cc8.png)

+ 1 Ambari-Server镜像
```yaml
FROM lizhiyong2000/ubuntu:18.04
#MAINTAINER lizhiyong2000@gmail.com

# AMBARI
ENV AMBARI_VERSION=2.7.3 \
    AMBARI_HOME=/opt/ambari

RUN apt-get update \
    && apt-get install --no-install-recommends -y \
      python \
      python2.7 \
      postgresql \
    && rm  /usr/bin/python && ln -s /usr/bin/python2.7 /usr/bin/python \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir $AMBARI_HOME && cd $AMBARI_HOME
COPY dist/ambari-server_2.7.3.0-0-dist.deb $AMBARI_HOME/

RUN dpkg -i $AMBARI_HOME/ambari-server_2.7.3.0-0-dist.deb

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod a+x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

```
+ 2 Ambari-Agent镜像
```yaml
FROM lizhiyong2000/ubuntu:18.04
#MAINTAINER lizhiyong2000@gmail.com

# AMBARI
ENV AMBARI_VERSION=2.7.3 \
    AMBARI_HOME=/opt/ambari

RUN apt-get update \
    && apt-get install --no-install-recommends -y \
      python \
      python2.7 \
    && rm  /usr/bin/python && ln -s /usr/bin/python2.7 /usr/bin/python \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir $AMBARI_HOME && cd $AMBARI_HOME
COPY dist/ambari-agent_2.7.3.0-0.deb $AMBARI_HOME/

RUN dpkg -i $AMBARI_HOME/ambari-agent_2.7.3.0-0.deb

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod a+x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
```

+ 3 Kubernetes 配置
```yaml
kind: Service
apiVersion: v1
metadata:
  name: ambari-server
spec:
  selector:
    component: ambari-server
  ports:
    - port: 8080
      targetPort: 8080
      name: http
---
kind: Service
apiVersion: v1
metadata:
  name: ambari-server-nodeport
spec:
  type: NodePort
  selector:
    component: ambari-server
  ports:
    - port: 8080
      targetPort: 8080
      name: http
      nodePort: 31080
---
kind: Deployment
apiVersion: apps/v1
metadata:
  name: ambari-server
spec:
  replicas: 1
  selector:
    matchLabels:
      component: ambari-server
  template:
    metadata:
      labels:
        component: ambari-server
    spec:
      containers:
        - name: ambari-server
          image: lizhiyong2000/ambari-server:2.7.3
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: 100m
---
kind: Deployment
apiVersion: apps/v1
metadata:
  name: ambari-agent
spec:
  replicas: 3
  selector:
    matchLabels:
      component: ambari-agent
  template:
    metadata:
      labels:
        component: ambari-agent
    spec:
      containers:
        - name: ambari-agent
          image: lizhiyong2000/ambari-agent:2.7.3
          resources:
            requests:
              cpu: 100m
```
在Rancher中导入配置，确认Ambari-Server 和Ambari-Agent正常启动
![](http://pjpst7ucp.bkt.clouddn.com/使用docker搭建ambari调试环境-599df03a.png)

## Ambari Server及Agent配置

+ 1 Server 配置
在server中命令行执行以下命令对ambari server进行配置：

```shell
ambari-server setup
```
其中ambari-server setup命令执行后，会有JDK及数据库配置，JDK使用已安装的JDK，数据库配置使用默认配置即可。

```
root@ambari-server-7d7cfcb886-vg82j:/# export buildNumber=2.7.3.0
root@ambari-server-7d7cfcb886-vg82j:/opt/ambari# ambari-server setup
Using python  /usr/bin/python
Setup ambari-server
Checking SELinux...
WARNING: Could not run /usr/sbin/sestatus: OK
Customize user account for ambari-server daemon [y/n] (n)? n
Adjusting ambari-server permissions and ownership...
Checking firewall status...
/bin/bash: ufw: command not found
Checking JDK...
[1] Oracle JDK 1.8 + Java Cryptography Extension (JCE) Policy Files 8
[2] Custom JDK
==============================================================================
Enter choice (1):
To download the Oracle JDK and the Java Cryptography Extension (JCE) Policy Files you must accept the license terms found at http://www.oracle.com/technetwork/java/javase/terms/license/index.html and not accepting will cancel the Ambari Server setup and you must install the JDK and JCE files manually.
Do you accept the Oracle Binary Code License Agreement [y/n] (y)? n
Exiting...
root@ambari-server-7d7cfcb886-vg82j:/opt/ambari# dpkg -i ambari-server_2.7.3.0-0-dist.deb
(Reading database ... 13820 files and directories currently installed.)
Preparing to unpack ambari-server_2.7.3.0-0-dist.deb ...
Backing up Ambari properties: /etc/ambari-server/conf/ambari.properties -> /etc/ambari-server/conf/ambari.properties.rpmsave
Backing up Ambari properties: /var/lib/ambari-server/ambari-env.sh -> /var/lib/ambari-server/ambari-env.sh.rpmsave
Backing up JAAS login file: /etc/ambari-server/conf/krb5JAASLogin.conf -> /etc/ambari-server/conf/krb5JAASLogin.conf.rpmsave
Backing up stacks directory: /var/lib/ambari-server/resources/stacks -> /var/lib/ambari-server/resources/stacks_31_01_19_02_14.old
Backing up common-services directory: /var/lib/ambari-server/resources/common-services -> /var/lib/ambari-server/resources/common-services_31_01_19_02_14.old
Backing up Ambari view jars: /var/lib/ambari-server/resources/views/*.jar -> /var/lib/ambari-server/resources/views/backups/
Backing up Ambari server jar: /usr/lib/ambari-server/ambari-server-2.7.3.0.0.jar -> /usr/lib/ambari-server-backups/
Unpacking ambari-server (2.7.3.0-0) over (2.7.3.0-0) ...
grep: Invalid content of \{\}
Setting up ambari-server (2.7.3.0-0) ...
grep: Invalid content of \{\}
root@ambari-server-7d7cfcb886-vg82j:/opt/ambari# ambari-server setup
Using python  /usr/bin/python
Setup ambari-server
Checking SELinux...
WARNING: Could not run /usr/sbin/sestatus: OK
Customize user account for ambari-server daemon [y/n] (n)? n
Adjusting ambari-server permissions and ownership...
Checking firewall status...
/bin/bash: ufw: command not found
Checking JDK...
[1] Oracle JDK 1.8 + Java Cryptography Extension (JCE) Policy Files 8
[2] Custom JDK
==============================================================================
Enter choice (1): 2
WARNING: JDK must be installed on all hosts and JAVA_HOME must be valid on all hosts.
WARNING: JCE Policy files are required for configuring Kerberos security. If you plan to use Kerberos,please make sure JCE Unlimited Strength Jurisdiction Policy Files are valid on all hosts.
Path to JAVA_HOME: /opt/jdk1.8.0_191
Validating JDK on Ambari Server...done.
Check JDK version for Ambari Server...
JDK version found: 8
Minimum JDK version is 8 for Ambari. Skipping to setup different JDK for Ambari Server.
Checking GPL software agreement...
GPL License for LZO: https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
Enable Ambari Server to download and install GPL Licensed LZO packages [y/n] (n)? y
Completing setup...
Configuring database...
Enter advanced database configuration [y/n] (n)? n
Configuring database...
Default properties detected. Using built-in database.
Configuring ambari database...
Checking PostgreSQL...
Configuring local database...
Configuring PostgreSQL...
Backup for pg_hba found, reconfiguration not required
Creating schema and user...
done.
Creating tables...
done.
Extracting system views...
ambari-admin-2.7.3.0.0.jar

Ambari repo file doesn't contain latest json url, skipping repoinfos modification
Adjusting ambari-server permissions and ownership...
Ambari Server 'setup' completed successfully.
root@ambari-server-7d7cfcb886-vg82j:/opt/ambari# ambari-server start
Using python  /usr/bin/python
Starting ambari-server
Ambari Server running with administrator privileges.
Organizing resource files at /var/lib/ambari-server/resources...
Ambari database consistency check started...
Server PID at: /var/run/ambari-server/ambari-server.pid
Server out at: /var/log/ambari-server/ambari-server.out
Server log at: /var/log/ambari-server/ambari-server.log
Waiting for server start.................................
Server started listening on 8080

DB configs consistency check: no errors and warnings were found.
Ambari Server 'start' completed successfully.
root@ambari-server-7d7cfcb886-vg82j:/opt/ambari#

```

访问Ambari Server web页面：
![](http://pjpst7ucp.bkt.clouddn.com/使用docker搭建ambari调试环境-e2207cda.png)

输入默认的用户名密码（admin/amdin）即可进入。

![](http://pjpst7ucp.bkt.clouddn.com/使用docker搭建ambari调试环境-6d3c5761.png)


+ 2 Agent 配置

在server中命令行执行以下命令对ambari server进行配置：

```shell
sed -i "s/localhost/10.42.2.62/g" /etc/ambari-agent/conf/ambari-agent.ini
ambari-agent start
```

  >将命令中的10.42.2.62 换成ambari server实际IP地址

## 远程调试配置

## 参考链接
- [Installation Guide for Ambari 2.7.3](https://cwiki.apache.org/confluence/display/AMBARI/Installation+Guide+for+Ambari+2.7.3)

- [Ambari 2.6.1源码编译问题汇总](https://blog.csdn.net/ZhouyuanLinli/article/details/79399287)

- [ambari-2.6.2源码编译](https://www.jianshu.com/p/addca5fca73c)
