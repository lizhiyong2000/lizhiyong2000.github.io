---
layout: "post"
title: "配置Rancher使用NFS存储"
date: "2019-04-07 16:41"
categories: "Docker"
description: "配置Rancher使用NFS存储"
tags: "Rancher NFS"
---
* content
{:toc}
<div class="postImg" style="background-image:url(http://carforeasy.cn/配置Rancher使用NFS存储-2b105fcf.png"></div>
> “Kubernetes集群管理员通过提供不同的存储类，可以满足用户不同的服务质量级别、备份策略和任意策略要求的存储需求。动态存储卷供应使用StorageClass进行实现，其允许存储卷按需被创建。本文将提供在Rancher环境中实现基于NFS的动态存储的方法。”




## 1. NFS Server安装

### 1.1 Ubuntu下安装nfs server
+ 安装 nfs server 端应用

```
$ sudo apt-get update
$ sudo apt-get install -y nfs-kernel-server
```

+ 配置nfs

配置 nfs 目录和读写权限相关配置。

```
$ sudo mkdir /opt/data/k8s
$ sudo vi /etc/exports
```

将下列内容添加进最后一行：

```
/opt/data/k8s *(rw,sync,no_root_squash,no_subtree_check)
```

+ 启动服务

```
$ sudo systemctl start nfs-kernel-server
```

### 1.2 在其他服务器进行挂载验证

```
$ sudo apt-get install -y nfs-common
$ sudo showmount -e 192.168.2.42
$ sudo mount -t nfs 192.168.2.42:/opt/data/k8s /mnt
$ sudo umount /mnt
```


## 2. Rancher中配置NFS存储
配置NFS作为动态存储分配将使用kubernetes存储插件[NFS-Client Provisioner](https://juejin.im/entry/5b4d5e4ee51d45190869549d)。
### 2.1 ServiceAccount配置

```yaml

kind: ServiceAccount
apiVersion: v1
metadata:
  name: nfs-client-provisioner
---
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: nfs-client-provisioner-runner
rules:
  - apiGroups: [""]
    resources: ["persistentvolumes"]
    verbs: ["get", "list", "watch", "create", "delete"]
  - apiGroups: [""]
    resources: ["persistentvolumeclaims"]
    verbs: ["get", "list", "watch", "update"]
  - apiGroups: ["storage.k8s.io"]
    resources: ["storageclasses"]
    verbs: ["get", "list", "watch"]
  - apiGroups: [""]
    resources: ["events"]
    verbs: ["list", "watch", "create", "update", "patch"]
  - apiGroups: [""]
    resources: ["endpoints"]
    verbs: ["get", "list", "watch", "create", "update", "patch"]
---
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: run-nfs-client-provisioner
subjects:
  - kind: ServiceAccount
    name: nfs-client-provisioner
    namespace: default
roleRef:
  kind: ClusterRole
  name: nfs-client-provisioner-runner
  apiGroup: rbac.authorization.k8s.io
```

### 2.2 nfs-client-provisioner配置

```yaml
kind: Deployment
apiVersion: extensions/v1beta1
metadata:
  name: nfs-client-provisioner
spec:
  replicas: 1
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        app: nfs-client-provisioner
    spec:
      serviceAccountName: nfs-client-provisioner
      containers:
        - name: nfs-client-provisioner
          # image: quay.io/external_storage/nfs-client-provisioner:latest
          image: quay.io/external_storage/nfs-client-provisioner:v2.1.2-k8s1.11
          # image: quay.io/external_storage/nfs-client-provisioner:v2.0.1
          volumeMounts:
            - name: nfs-client-root
              mountPath: /persistentvolumes
          env:
            - name: PROVISIONER_NAME
              value: nfs-client-provisioner
              # value: fuseim.pri/ifs
            - name: NFS_SERVER
              value: 192.168.1.132
            - name: NFS_PATH
              value: /opt/data/k8s
      volumes:
        - name: nfs-client-root
          nfs:
            server: 192.168.2.42
            path: /opt/data/k8s
---


```

### 2.3 StorageClass配置

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: nfs-storage
provisioner: nfs-client-provisioner
```


### 2.4 PersistentVolume测试配置
```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: test-claim
  annotations:
    storage-class: "nfs-storage"
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 1Mi
  storageClassName: nfs-storage
---
kind: Pod
apiVersion: v1
metadata:
  name: test-pod
spec:
  containers:
  - name: test-pod
    image: busybox
    command:
      - "/bin/sh"
    args:
      - "-c"
      - "touch /mnt/SUCCESS && exit 0 || exit 1"
    volumeMounts:
      - name: nfs-pvc
        mountPath: "/mnt"
  restartPolicy: "Never"
  volumes:
    - name: nfs-pvc
      persistentVolumeClaim:
        claimName: test-claim
```

### 2.5 配置结果
![](http://carforeasy.cn/配置Rancher使用NFS存储-f5176818.png)


## 3. 参考链接
* [Kubernetes NFS-Client Provisioner](https://github.com/kubernetes-incubator/external-storage/tree/master/nfs-client)
* [Ubuntu 16.04 安装nfs server](https://www.jianshu.com/p/5314f90330a6)
* [Kubernetes-基于StorageClass的动态存储供应](https://juejin.im/entry/5b4d5e4ee51d45190869549d)
