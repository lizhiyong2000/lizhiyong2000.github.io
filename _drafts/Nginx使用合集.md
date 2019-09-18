



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
