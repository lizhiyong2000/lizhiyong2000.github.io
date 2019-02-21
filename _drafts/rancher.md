
##启动Rancher

docker run --restart=unless-stopped -d -p 80:80 -p 443:443 rancher/rancher:v2.1.0-rc5

## Aliyun Mirror
    {
      "debug" : true,
      "experimental" : true,
      "registry-mirrors" : [
        "https://nvylsm3c.mirror.aliyuncs.com"
      ]
    }

## Start Rancher 1.*

    docker run -d -p 80:8080 -v /opt/data/mysql:/var/lib/mysql --restart=always rancher/server
>>>>>>> 7b0e3300751121ceee09a44beb83984ead5e56fe
