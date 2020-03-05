sudo firewall-cmd --list-all
public (active)
 target: default
 icmp-block-inversion: no
 interfaces: eth0
 sources:
 services: ssh dhcpv6-client
 ports: 80/tcp 443/tcp 8443/tcp
 protocols:
 masquerade: no
 forward-ports:
 source-ports:
 icmp-blocks:
 rich rules:


```
 sudo firewall-cmd --get-active-zones
```

```
 public
   interfaces: eth0 eth1
 trusted
   interfaces: eth2

 ```

+ 添加

```
firewall-cmd --zone=public --add-port=80/tcp --permanent    （--permanent永久生效，没有此参数重启后失效）
```

+ 重新载入

```
firewall-cmd --reload
```

+ 查看

```
firewall-cmd --zone=public --query-port=80/tcp
```

+ 删除

```
firewall-cmd --zone=public --remove-port=80/tcp --permanent
```
