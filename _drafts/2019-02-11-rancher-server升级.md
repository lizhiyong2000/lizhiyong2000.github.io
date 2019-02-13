---
layout: "post"
title: "2019-02-11-Rancher server升级"
date: "2019-02-11 10:14"
---


docker stop <container_name_of_original_server>


docker create --volumes-from <container_name_of_original_server>  --name rancher-data rancher/rancher:v2.1.0

docker create --volumes-from b87a9c52c33f --name rancher-data rancher/rancher:v2.1.0



```shell
docker run  --volumes-from rancher-data -v $PWD:/backup alpine tar zcvf /backup/rancher-data-backup-2.1.0.tar.gz /var/lib/rancher
```


docker run -d --volumes-from rancher-data --restart=unless-stopped -p 80:80 -p 443:443 rancher/rancher:v2.2.0-alpha6


docker run -d --restart=unless-stopped -p 80:80 -p 443:443 rancher/rancher:v2.2.0-alpha6
