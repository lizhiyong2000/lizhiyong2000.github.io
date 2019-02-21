---
layout: "post"
title: "使用Docker搭建Ambari运行环境"
date: "2019-01-29 10:37"
categories: Ambari
description: 使用Docker搭建Ambari运行环境
tags: Docker Ambari
---

* content
{:toc}

<div class="postImg" style="background-image:url(http://carforeasy.cn/2019-26bd29c0.png)"></div>
> “Ambari是Hadoop（指Hadoop生态圈，包括HBase，Hive等）集群管理软件，其具有创建、管理、监视Hadoop集群的功能。Ambari也是Apache软件基金会中的顶级项目，目前最新的发布版本是2.7.3。”





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

![](http://carforeasy.cn/使用docker搭建ambari调试环境-a40a2baa.png)

+ 2 编译所用Dockerfile

```
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
![](http://carforeasy.cn/使用docker搭建ambari调试环境-b13f3cc8.png)

具体配置请参考：https://github.com/lizhiyong2000/docker-k8s/tree/master/docker/ambari
+ 1 Ambari-Server镜像

```
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


ADD init/init-server.sh /opt/ambari/init-server.sh
RUN chmod u+x /opt/ambari/init-server.sh

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh


RUN chmod a+x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8080 8440 8441 5432 5005

ENV buildNumber=2.7.3.0
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

```

+ 2 Ambari-Agent镜像

```
FROM lizhiyong2000/ubuntu:16.04
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

ADD init/init-agent.sh /opt/ambari/init-agent.sh
RUN chmod u+x /opt/ambari/init-agent.sh


ENV buildNumber=2.7.3.0
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
  clusterIP: None
---
kind: Service
apiVersion: v1
metadata:
  name: ambari-agent
spec:
  selector:
    component: ambari-agent
  ports:
  - port: 8080
    targetPort: 8080
    name: http
  clusterIP: None
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
kind: StatefulSet
apiVersion: apps/v1
metadata:
  name: ambari-server
spec:
  serviceName: ambari-server
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
kind: StatefulSet
apiVersion: apps/v1
metadata:
  name: ambari-agent
spec:
  serviceName: ambari-agent
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
![](http://carforeasy.cn/使用docker搭建ambari调试环境-599df03a.png)

## 利用Ambari安装Hadoop
ambari 服务器及agent启动正常后，便可使用安装向导进行服务安装了，安装hadoop集群如下：

![](http://carforeasy.cn/2019-f12375f1.png)

## Ambari Server及Agent配置问题
+ ambari卡在设置集群名称的下一步

设置好集群名称，卡在了NEXT这一步，换句话说，就是select version那个页面不能被我们访问到。

分析：

进入select version页面是访问的HDP-3.0，但是发现/var/lib/ambari-server/resources/stacks/HDP/没有3.0这个目录，所以select version页面打不开。

解决办法：

链接: https://pan.baidu.com/s/1lsR04M6n7_zNEy2jANFrpQ 提取码: tzre

+ ambari安装HDP时提示smartsense-hst无法安装
```
; stderr: E: Unable to locate package smartsense-hst
dpkg: error processing archive /var/lib/ambari-agent/cache/stacks/HDP/3.0/services/SMARTSENSE/package/files/deb/*.deb (--install):
 cannot access archive: No such file or directory
Errors were encountered while processing:
 /var/lib/ambari-agent/cache/stacks/HDP/3.0/services/SMARTSENSE/package/files/deb/*.deb
 ```
解决办法：
```
wget -O /etc/apt/sources.list.d/ambari.list http://public-repo-1.hortonworks.com/ambari/ubuntu16/2.x/updates/2.7.3.0/ambari.list
apt-key adv --recv-keys --keyserver keyserver.ubuntu.com B9733A7A07513CAD
apt-get update
```


## 参考链接
- [Installation Guide for Ambari 2.7.3](https://cwiki.apache.org/confluence/display/AMBARI/Installation+Guide+for+Ambari+2.7.3)

- [Ambari 2.6.1源码编译问题汇总](https://blog.csdn.net/ZhouyuanLinli/article/details/79399287)

- [ambari-2.6.2源码编译](https://www.jianshu.com/p/addca5fca73c)

- [Ambari2.7整体编译+安装使用](https://blog.csdn.net/create_17/article/details/84000772)
