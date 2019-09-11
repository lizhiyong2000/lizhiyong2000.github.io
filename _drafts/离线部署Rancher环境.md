



## 1. Docker环境安装
### 1.1 RPM安装Docker

+ Docker RPM包下载（仅centos7.5）

```
curl -O https://download.docker.com/linux/centos/7/x86_64/stable/Packages/docker-ce-18.09.3-3.el7.x86_64.rpm

curl -O https://download.docker.com/linux/centos/7/x86_64/stable/Packages/containerd.io-1.2.2-3.el7.x86_64.rpm

curl -O https://download.docker.com/linux/centos/7/x86_64/stable/Packages/docker-ce-cli-18.09.3-3.el7.x86_64.rpm

curl -O http://mirror.centos.org/centos/7/extras/x86_64/Packages/container-selinux-2.68-1.el7.noarch.rpm

curl -O ftp://ftp.pbone.net/mirror/ftp.scientificlinux.org/linux/scientific/7.5/x86_64/os/Packages/audit-libs-python-2.8.1-3.el7.x86_64.rpm

curl -O http://mirror.centos.org/centos/7/os/x86_64/Packages/libtool-ltdl-2.4.2-22.el7_3.x86_64.rpm

curl -O ftp://ftp.icm.edu.pl/vol/rzm3/linux-slc/centos/7.5.1804/os/x86_64/Packages/policycoreutils-python-2.5-22.el7.x86_64.rpm

curl -O ftp://ftp.icm.edu.pl/vol/rzm3/linux-slc/centos/7.1.1503/updates/x86_64/Packages/checkpolicy-2.5-6.el7.x86_64.rpm

curl -O ftp://ftp.icm.edu.pl/vol/rzm3/linux-slc/centos/7.4.1708/cr/x86_64/Packages/libcgroup-0.41-15.el7.x86_64.rpm

curl -O ftp://ftp.icm.edu.pl/vol/rzm3/linux-slc/centos/7.5.1804/os/x86_64/Packages/libsemanage-python-2.5-11.el7.x86_64.rpm

curl -O http://mirror.centos.org/centos/7/os/x86_64/Packages/python-IPy-0.75-6.el7.noarch.rpm

curl -O ftp://ftp.pbone.net/mirror/ftp.scientificlinux.org/linux/scientific/7.0/x86_64/updates/security/setools-libs-3.3.8-2.el7.x86_64.rpm

curl -O ftp://ftp.icm.edu.pl/vol/rzm3/linux-slc/centos/7.5.1804/os/x86_64/Packages/libseccomp-2.3.1-3.el7.x86_64.rpm
```

+ RPM包安装

```
rpm -ivh libtool-ltdl-2.4.2-22.el7_3.x86_64.rpm

rpm -ivh audit-libs-python-2.8.1-3.el7.x86_64.rpm

rpm -ivh libcgroup-0.41-15.el7.x86_64.rpm

rpm -ivh libsemanage-python-2.5-11.el7.x86_64.rpm

rpm -ivh checkpolicy-2.5-6.el7.x86_64.rpm

rpm -ivh python-IPy-0.75-6.el7.noarch.rpm

rpm -ivh setools-libs-3.3.8-2.el7.x86_64.rpm

rpm -ivh policycoreutils-python-2.5-22.el7.x86_64.rpm

rpm -ivh container-selinux-2.68-1.el7.noarch.rpm

rpm -ivh libseccomp-2.3.1-3.el7.x86_64.rpm

rpm -ivh containerd.io-1.2.2-3.el7.x86_64.rpm

rpm -ivh docker-ce-cli-18.09.3-3.el7.x86_64.rpm

rpm -ivh docker-ce-18.09.3-3.el7.x86_64.rpm
```

+ docker服务验证
```
systemctl start docker.service
systemctl enable docker.service
systemctl status docker.service
```

## 2. Harbor安装
Rancher依靠私有镜像仓库进行离线安装，必须拥有自己的私有镜像仓库或其他方式将所有Docker镜像分发到每个节点，这里使用Harbor搭建私有镜像库。
+ docker-compose离线安装
  harbor安装前需要安装docker及docker-compose命令工具。
  docker-compose下载链接：https://github.com/docker/compose/releases/download/1.24.1/docker-compose-Linux-x86_64

  下载后复制到 /usr/bin/目录下，加上可执行权限即可。

  ```
  cp v1.24.1-docker-compose-Linux-x86_64 /usr/bin/docker-compose
  chmod a+x  /usr/bin/docker-compose
  ```

+ harbor离线安装
  下载harbor离线安装包：https://storage.googleapis.com/harbor-releases/release-1.8.0/harbor-offline-installer-v1.8.1.tgz

  将harbor-offline-installer-v1.8.1.tgz解压后修改harbor.yml配置文件中的主机名和端口选项，运行install.sh。

  安装成功后如果harbor服务停止，则可以使用docker-compose start重新启动harbor服务。

  ```
  # docker-compose start
  Starting log         ... done
  Starting registry    ... done
  Starting registryctl ... done
  Starting postgresql  ... done
  Starting core        ... done
  Starting portal      ... done
  Starting redis       ... done
  Starting jobservice  ... done
  Starting proxy       ... done
  ```

## 3. Rancher安装

### 3.1 镜像列表准备
Rancher HA安装需要使用来自3个部分的镜像，将所有镜像并到一个名为rancher-images-merged.txt的文件中。

+ Rancher版本rancher-images.txt

在版本发布页面，找到需要安装的Rancher 2.2.7版本：[https://github.com/rancher/rancher/releases/tag/v2.2.7](https://github.com/rancher/rancher/releases/tag/v2.2.7) ，从发行版的 Assets 部分，下载rancher-images.txt：此文件包含安装Rancher所需的所有镜像的列表。

+ 通过RKE生成镜像清单
```
rke config --system-images -all > rancher-images-rke.txt
```
对镜像列表进行排序和去重，以去除重复的镜像。
```
sort -u rancher-images.txt -o rancher-images.txt
```

+ tiller镜像

```
 git pull registry.cn-shanghai.aliyuncs.com/rancher/tiller:v2.14.1
 git tag registry.cn-shanghai.aliyuncs.com/rancher/tiller:v2.14.1 rancher/tiller:v2.14.1
```

合并后得到rancher-images-merged.txt

```
rancher/alertmanager-helper:v0.0.2
rancher/calico-cni:v3.1.3
rancher/calico-cni:v3.4.0
rancher/calico-cni:v3.7.4
rancher/calico-ctl:v2.0.0
rancher/calico-kube-controllers:v3.7.4
rancher/calico-node:v3.1.3
rancher/calico-node:v3.4.0
rancher/calico-node:v3.7.4
rancher/cluster-proportional-autoscaler:1.0.0
rancher/cluster-proportional-autoscaler:1.3.0
rancher/coredns-coredns:1.2.2
rancher/coredns-coredns:1.2.6
rancher/coredns-coredns:1.3.1
rancher/coreos-configmap-reload:v0.0.1
rancher/coreos-etcd:v3.2.24-rancher1
rancher/coreos-etcd:v3.3.10-rancher1
rancher/coreos-flannel:v0.10.0
rancher/coreos-flannel:v0.10.0-rancher1
rancher/coreos-flannel:v0.11.0
rancher/coreos-flannel:v0.11.0-rancher1
rancher/coreos-kube-state-metrics:v1.5.0
rancher/coreos-prometheus-config-reloader:v0.29.0
rancher/coreos-prometheus-operator:v0.29.0
rancher/flannel-cni:v0.3.0-rancher1
rancher/fluentd-helper:v0.1.2
rancher/fluentd:v0.1.11
rancher/fluentd:v0.1.13
rancher/grafana-grafana:5.4.3
rancher/hyperkube:v1.12.10-rancher1
rancher/hyperkube:v1.13.9-rancher1
rancher/hyperkube:v1.14.5-rancher1
rancher/hyperkube:v1.15.2-rancher1
rancher/jenkins-jnlp-slave:3.10-1-alpine
rancher/jenkins-plugins-docker:17.12
rancher/jimmidyson-configmap-reload:v0.2.2
rancher/k8s-dns-dnsmasq-nanny:1.14.13
rancher/k8s-dns-dnsmasq-nanny:1.15.0
rancher/k8s-dns-kube-dns:1.14.13
rancher/k8s-dns-kube-dns:1.15.0
rancher/k8s-dns-sidecar:1.14.13
rancher/k8s-dns-sidecar:1.15.0
rancher/kube-api-auth:v0.1.3
rancher/kubernetes-external-dns:v0.5.11
rancher/log-aggregator:v0.1.4
rancher/log-aggregator:v0.1.5
rancher/metrics-server:v0.3.1
rancher/metrics-server:v0.3.3
rancher/minio-minio:RELEASE.2018-05-25T19-49-13Z
rancher/nginx-ingress-controller-defaultbackend:1.4-rancher1
rancher/nginx-ingress-controller-defaultbackend:1.5-rancher1
rancher/nginx-ingress-controller:0.21.0-rancher3
rancher/nginx:1.15.8-alpine
rancher/pause:3.1
rancher/pipeline-jenkins-server:v0.1.0
rancher/pipeline-tools:v0.1.9
rancher/prom-alertmanager:v0.15.2
rancher/prom-alertmanager:v0.17.0
rancher/prom-node-exporter:v0.17.0
rancher/prom-prometheus:v2.7.1
rancher/prometheus-auth:v0.2.0
rancher/rancher-agent:v2.2.7
rancher/rancher:v2.2.7
rancher/rke-tools:v0.1.40
registry:2
weaveworks/weave-kube:2.5.0
weaveworks/weave-kube:2.5.2
weaveworks/weave-npc:2.5.0
weaveworks/weave-npc:2.5.2
rancher/tiller:v2.14.3
```


### 3.2 下载及上传镜像
在需要上传下载镜像的机器上为docker添加配置文件/etc/docker/daemon.json,之后重启docker服务。
+ daemon.json
```json
{
"insecure-registries": [
        "192.168.137.4"
    ]

}
```

同样从rancher发行版的assets部分下载镜像脚本文件(稍作修改)：
- rancher-save-images.sh：此脚本rancher-images.txt从Docker Hub中下载所有镜像并将所有镜像保存为rancher-images.tar.gz。

- rancher-load-images.sh：此脚本从rancher-images.tar.gz文件加载镜像，并将其推送到您的私有镜像仓库。

这样根据准备好的rancher-images-merged.txt可以将镜像推送至私有镜像库中。

### 3.3 离线方式安装K8S

+ CLI工具准备

Rancher HA安装需要以下CLI工具：

1）kubectl：Kubernetes命令行工具；

2）rke：Rancher Kubernetes Engine，用于构建Kubernetes集群的cli；

3）helm：Kubernetes的包管理（客户端helm和服务器Tiller）。

这些安装包可从rancher网站（https://www.cnrancher.com/docs/rancher/v2.x/cn/install-prepare/download/）下载

+ 免密登入

1、创建rancher账号并加入docker组（三台都执行）

```
useradd rancher -G docker
#设置密码

passwd rancher
#重启生效

reboot
```

2、root账户免登入（rke安装的节点执行）
```
ssh-keygen -t rsa
ssh-copy-id rancher@172.16.3.241
ssh-copy-id rancher@172.16.3.242
ssh-copy-id rancher@172.16.3.243
  ```

+ 创建Kubernetes集群

1、运行RKE命令创建Kubernetes集群

在/opt/rancher/deploy目录下准备rancher-cluster.yml，使用创建的3个节点的IP地址或域名替换列表中的IP地址。

```yaml

nodes:
- address: 172.16.3.241
  user: rancher
  role: [ "controlplane", "etcd", "worker" ]
  ssh_key_path: ~/.ssh/id_rsa
- address: 172.16.3.242
  user: rancher
  role: [ "controlplane", "etcd", "worker" ]
  ssh_key_path: ~/.ssh/id_rsa
- address: 172.16.3.243
  user: rancher
  role: [ "controlplane", "etcd", "worker" ]
  ssh_key_path: ~/.ssh/id_rsa

private_registries:
- url: reg.nexus.wmqe.com
  user: admin
  password: "******"
  is_default: true

services:
  etcd:
    backup_config:
      enabled: true
      interval_hours: 1
      retention: 30
ingress:
    provider: nginx
    extra_args:
      http-port: 8980
      https-port: 8943
```

之后运行rke命令：      

```
cd /opt/rancher/deploy/
rke up --config ./rancher-cluster.yml
```

完成后，显示：Finished building Kubernetes cluster successfully。

2、如果创建失败一定要清理缓存再继续

```
rm -rf /var/lib/rancher/etcd/*
rm -rf /etc/kubernetes/*
rke remove --config ./rancher-cluster.yml
```

创建完成后，RKE会创建了一个文件kube_config_rancher-cluster.yml。

```
cp kube_config_rancher-cluster.yml /root/.kube/config
```


```
kubectl get pod -A -o wide
NAMESPACE       NAME                                      READY   STATUS             RESTARTS   AGE     IP              NODE            NOMINATED NODE   READINESS GATES
ingress-nginx   default-http-backend-8654b475fb-9jx7w     1/1     Running            0          7m4s    10.42.2.3       172.31.236.20   <none>           <none>
ingress-nginx   nginx-ingress-controller-dh8qn            0/1     CrashLoopBackOff   6          7m2s    172.31.236.7    172.31.236.7    <none>           <none>
ingress-nginx   nginx-ingress-controller-dvzdv            1/1     Running            0          7m4s    172.31.236.20   172.31.236.20   <none>           <none>
ingress-nginx   nginx-ingress-controller-fmd2p            0/1     CrashLoopBackOff   6          7m4s    172.31.236.29   172.31.236.29   <none>           <none>
kube-system     canal-bt69r                               2/2     Running            0          7m18s   172.31.236.20   172.31.236.20   <none>           <none>
kube-system     canal-h6khb                               2/2     Running            0          7m18s   172.31.236.7    172.31.236.7    <none>           <none>
kube-system     canal-jslnt                               2/2     Running            0          7m18s   172.31.236.29   172.31.236.29   <none>           <none>
kube-system     coredns-6fff49f675-lzrhg                  1/1     Running            0          7m14s   10.42.2.2       172.31.236.20   <none>           <none>
kube-system     coredns-autoscaler-6c49cd795b-lbrfg       1/1     Running            0          7m13s   10.42.1.2       172.31.236.29   <none>           <none>
kube-system     metrics-server-65c596dc69-2n8ks           1/1     Running            0          7m9s    10.42.1.3       172.31.236.29   <none>           <none>
kube-system     rke-coredns-addon-deploy-job-9vfzk        0/1     Completed          0          7m16s   172.31.236.7    172.31.236.7    <none>           <none>
kube-system     rke-ingress-controller-deploy-job-vt7x4   0/1     Completed          0          7m5s    172.31.236.7    172.31.236.7    <none>           <none>
kube-system     rke-metrics-addon-deploy-job-tz97c        0/1     Completed          0          7m10s   172.31.236.7    172.31.236.7    <none>           <none>
kube-system     rke-network-plugin-deploy-job-lzf56       0/1     Completed          0          7m21s   172.31.236.7    172.31.236.7    <none>           <none>
```


### 3.4 离线Rancher安装

kubectl -n kube-system create serviceaccount tiller
kubectl create clusterrolebinding tiller --clusterrole cluster-admin --serviceaccount=kube-system:tiller






+ cleanup.sh

```sh
#!/bin/sh
docker rm -f $(docker ps -qa)
docker volume rm $(docker volume ls -q)
cleanupdirs="/var/lib/etcd /etc/kubernetes /etc/cni /opt/cni /var/lib/cni /var/run/calico /opt/rke"
for dir in $cleanupdirs; do
  echo "Removing $dir"
  rm -rf $dir
done
```




kubectl -n cattle-system create secret tls tls-rancher-ingress  --cert=/opt/rancher/ca_tls/tls.crt   --key=/opt/rancher/ca_tls/tls.key

kubectl -n cattle-system create secret generic tls-ca  --from-file=/opt/rancher/ca_tls/cacert.pem


## 4. 参考链接

+ [ HA 离线安装](https://www.cnrancher.com/docs/rancher/v2.x/cn/installation/air-gap-installation/ha/)

+ [自签名ssl证书](https://www.cnrancher.com/docs/rancher/v2.x/cn/install-prepare/self-signed-ssl)

+ [离线安装 Rancher2.2.4 HA 集群](https://www.cnblogs.com/weavepub/p/11053099.html)

+ [使用rancher管理现有的kubernetes集群](https://blog.51cto.com/liuzhengwei521/2398244)

+ [CentOS7环境下离线搭建最新Docker-CE环境](https://blog.csdn.net/JyuSun/article/details/77927865)
