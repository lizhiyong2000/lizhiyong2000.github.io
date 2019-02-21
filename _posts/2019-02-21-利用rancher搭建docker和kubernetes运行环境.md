---
layout: "post"
title: "利用Rancher搭建Docker和Kubernetes运行环境"
date: "2019-02-21 10:14"
categories: Docker Kubernetes
description: 使用Atom作为Markdown编辑器
tags: Docker Kubernetes Rancher
---

* content
{:toc}

<div class="postImg" style="background-image:url(http://carforeasy.cn/2019-19e72882.png)"></div>
> “Rancher帮助企业能够在生产环境中运行和管理Docker和Kubernetes，而无需从头开始构建容器服务平台。为了更好的管理Kubernetes，Rancher 2.0的大部分功能经过重新设计，并且Rancher2.0延续了大多数1.0版本的友好功能，如简洁的UI和应用商店等。”




## Docker环境安装

### Ubuntu安装Docker
从Ubuntu存储库安装docker版本，运行下面的apt命令：

    sudo apt install docker.io

等到安装完成后，您可以启动Docker并使用systemctl命令将其添加到系统启动服务：

    systemctl start docker
    systemctl enable docker

检查docker版本确认安装完成：

    docker --version

### 将Docker作为非root用户运行
为了将docker作为普通非root用户运行，我们需要将用户添加到'docker'组中。

    usermod -aG docker lizhiyong

现在以“lizhiyong”用户身份登录并运行docker命令。

    lizhiyong@lizhiyong-pc:~$docker run hello-world

### 配置Aliyun镜像加速

    sudo mkdir -p /etc/docker
    sudo tee /etc/docker/daemon.json <<-'EOF'
    {
      "registry-mirrors": ["https://xxxxx.mirror.aliyuncs.com"]
    }
    EOF
    sudo systemctl daemon-reload
    sudo systemctl restart docker

## Rancher安装
### 启动Rancher server
使用docker命令启动Rancher服务器：

    docker run --restart=unless-stopped -d -p 80:80 -p 443:443 rancher/rancher:v2.1.6

服务器启动成功后，通过浏览器进行访问登录，用户名密码设置为amdin/admin
![](http://carforeasy.cn/2019-bb048faa.png)
### 添加Rancher集群
登录成功后即可添加Kubernetes集群，选择集群类型为Custom
![](http://carforeasy.cn/2019-5a0d92be.png)

点击下一步，选择集群角色为所有，将命令行复制后在本机运行。
![](http://carforeasy.cn/2019-47c8b388.png)

等待安装完成后集群即创建成功。

### Rancher版本升级
当安装的Rancher版本需要升级时可利用已经允许的rancher server容器创建数据容器，然后利用数据容器启动新版本的Rancher server即可，以下为升级到v2.2.0-alpha6的示例：

    docker stop <container_name_of_original_server>

    docker create --volumes-from <container_name_of_original_server>  --name rancher-data rancher/rancher:v2.1.0

    docker create --volumes-from b87a9c52c33f --name rancher-data rancher/rancher:v2.1.0


    docker run  --volumes-from rancher-data -v $PWD:/backup alpine tar zcvf /backup/rancher-data-backup-2.1.0.tar.gz /var/lib/rancher

    docker run -d --volumes-from rancher-data --restart=unless-stopped -p 80:80 -p 443:443 rancher/rancher:v2.2.0-alpha6

    docker run -d --restart=unless-stopped -p 80:80 -p 443:443 rancher/rancher:v2.2.0-alpha6

## Kubernetes容器创建测试
在新创建的集群中导入测试用配置文件，测试集群是否创建成功

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
创建结果如下：
![](http://carforeasy.cn/2019-f153a83e.png)


## 参考链接
- [Docker：Ubuntu 18.04 LTS上的安装和基本使用](https://www.howtoing.com/ubuntu-docker)
- [Docker使用阿里云镜像加速器](https://www.jianshu.com/p/200cce574163)
- [升级Rancher Server](
https://rancher.com/docs/rancher/v1.6/zh/upgrading/)
