
##启动Rancher

docker run --restart=unless-stopped -d -p 80:80 -p 443:443 rancher/rancher:v2.1.0-rc5