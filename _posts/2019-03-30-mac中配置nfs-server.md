---
layout: "post"
title: "Mac中配置NFS server"
date: "2019-03-30 01:44"
categories: "Mac系统"
description: "Mac中配置NFS server"
tags: "Mac NFS"
---
* content
{:toc}


<div class="postImg" style="background-image:url(http://carforeasy.cn/mac中配置nfs-a611059f.png)"></div>
> “macOS系统自带NFS服务，十分方便，不过mac系统上的nfsd服务配置与普通Linux系统中的nfsserver配置有些差别，从其他系统挂载mac系统共享的NFS文件系统也需要一些特别的配置。之前在配置mac上的Rancher时，一直无法挂载NFS，本文将记录解决方法。”





## 1. NFS服务配置
### 1.1 nfsd配置文件
 编辑/etc/exports文件：

```
V4: / -sec=sys
/opt/data/k8s -alldirs  -maproot=root:wheel -network=192.168.0.0 -mask=255.255.0.0
```

+ 默认为可读写，加入 -ro 为只读 readonly
+ -alldirs 是共享 /Users 目录下所有文件
+ -network -mask 制定工作在那个网段内
+ -maproot=root:wheel，把client端的root用户映射为Mac OS上的root，client端的root组映射为Mac OS上的wheel (gid=0) 组。这个参数非常重要，否则会nfsroot链接失败。

修改配置后使用``sudo nfsd checkexports``进行检查。

### 1.2 控制服务
``sudo nfsd enable  ``

``sudo nfsd disable  ``

``sudo nfsd start  ``

``sudo nfsd stop  ``

``sudo nfsd restart  ``

``sudo nfsd status  ``

### 1.3 查看共享状态
  ``showmount -e``


## 2. 客户端连接
``showmount -e 192.168.1.132``

在本机进行mount验证：
``
sudo mount -t nfs -o nolock,nfsvers=3,vers=3 192.168.1.132:/opt/data/k8s /Users/zhiyongli/mounts
``

## 3. Linux客户端连接mount失败问题
在Docker容器中挂载上述NFS文件时一直提示Permission Denied。经过大量查找资料，发现其实只需添加一项配置到/etc/nfs.conf中：
``nfs.server.mount.require_resv_port = 0``

以下为man手册中的说明：

``nfs.server.mount.require_resv_port``
>This option controls whether MOUNT requests are required to
originate from a reserved port (port < 1024).  The default value
is 1 (yes).  Many NFS server implementations require this
because of the false belief that this requirement increases
security.

配置后使用``sudo nfsd update``进行刷新，发现确实不报requires stronger authentication的错误了。
![](http://carforeasy.cn/mac中配置nfs-01a65a7a.png)

最后在Rancher中配置挂载NFS存储，确实挂载成功：

![](http://carforeasy.cn/mac中配置nfs-dae6bb84.png)

## 参考链接

+ [nfs-share-from-os-x-snow-leopard-to-ubuntu-linux](https://superuser.com/questions/183588/nfs-share-from-os-x-snow-leopard-to-ubuntu-linux)
+ [开启 Mac 上的 NFS 服务](https://xiaozhuanlan.com/topic/8560297431)
