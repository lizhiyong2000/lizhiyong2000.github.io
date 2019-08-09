


https://github.com/rancher/rancher/releases/tag/v2.2.7

sh rancher-save-images.sh

sh rancher-load-images.sh --registry 192.168.137.4:5000


docker run --restart=unless-stopped -d -p 80:80 -p 443:443 -e CATTLE_SYSTEM_DEFAULT_REGISTRY=192.168.137.4:5000 192.168.137.4:5000/rancher/rancher:v2.2.7


docker run --restart=unless-stopped -d -p 8080:80 -p 8443:443 -e CATTLE_SYSTEM_DEFAULT_REGISTRY=docker-02:5000 docker-02:5000/rancher/rancher:v2.2.7


docker ps |grep -v 'rancher/rancher:v2.2.7'|grep -v 'IMAGE'|awk -e '{print $1}'|xargs docker rm -f



+ daemon.json
```json
{
"insecure-registries": [
        "192.168.137.4:5000"
    ]
			
}
```


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
