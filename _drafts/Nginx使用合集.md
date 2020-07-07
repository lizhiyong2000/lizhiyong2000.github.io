



+ 配置4层代理

```json
stream {
      server {
          listen 31080;
          proxy_pass app_server;
      }
      upstream app_server{
          server 149.248.11.77:13042;
      }
}

```



+ http-proxy.conf
 ```
 server {
      resolver 8.8.4.4;
      resolver_timeout 5s;

    listen 0.0.0.0:1080;
    
    location / {
        proxy_pass $scheme://$host$request_uri;
        proxy_set_header Host $http_host;
    
        proxy_buffers 256 4k;
        proxy_max_temp_file_size 0;
    
        proxy_connect_timeout 30;
    
        proxy_cache_valid 200 302 10m;
        proxy_cache_valid 301 1h;
        proxy_cache_valid any 1m;
    }
}



server{
    resolver 8.8.4.4;
    access_log /var/log/nginx/access_proxy-1443.log main;
    listen 0.0.0.0:1443;
    location / {
        root html;
        index index.html index.htm;
        proxy_pass https://$host$request_uri;
        proxy_buffers 256 4k;
        proxy_max_temp_file_size 0k;
        proxy_connect_timeout 30;
        proxy_send_timeout 60;
        proxy_read_timeout 60;
        proxy_next_upstream error timeout invalid_header http_502;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root html;
      }
   }
 ```



- 配置nginx使用非root启动
  - 添加nginx用户

    ```
    groupadd nginx
    useradd nginx -g nginx -s /sbin/nologin -M
    chown -R nginx:nginx /usr/local/openresty
    ```
    
    将配置文件中用到的目录权限都进行修改为nginx可读写。

  - nginx.service

    ```
    [Unit]
    Description=The nginx HTTP and reverse proxy server
    After=syslog.target network.target remote-fs.target nss-lookup.target

    [Service]
    Type=forking
    User=nginx
    Group=nginx
    PIDFile=/var/run/nginx/nginx.pid
    ExecStartPre=/usr/local/openresty/nginx/sbin/nginx -t
    ExecStart=/usr/local/openresty/nginx/sbin/nginx
    ExecReload=/bin/kill -s HUP $MAINPID
    ExecStop=/bin/kill -s QUIT $MAINPID
    PrivateTmp=false

    [Install]
    WantedBy=multi-user.target
    ```

  - 将小于1024的端口进行iptables转发

    ```
    iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
    ```

  - 运行结果

    ```
    [root@nm-bigdata-030080141 openresty]# ps -ef|grep nginx
    nginx     49163      1  0 15:44 ?        00:00:00 nginx: master process /usr/local/openresty/nginx/sbin/nginx
    nginx     49164  49163  0 15:44 ?        00:00:00 nginx: worker process
    nginx     49165  49163  0 15:44 ?        00:00:00 nginx: worker process
    nginx     49166  49163  0 15:44 ?        00:00:00 nginx: worker process
    nginx     49167  49163  0 15:44 ?        00:00:00 nginx: worker process
    ```