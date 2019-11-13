



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



http-proxy.conf
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

/etc/yum.conf

proxy=http://10.224.80.52:1080
