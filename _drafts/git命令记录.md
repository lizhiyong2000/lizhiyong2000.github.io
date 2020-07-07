---
layout: "post"
title: "git命令记录.md"
date: "2019-04-24 08:32"
---




+ git全局设置

```shell
git config --global http.proxy socks5://127.0.0.1:1080
git config --global https.proxy socks5://127.0.0.1:1080

git config --global user.email lizhiyong2000@gmail.com
git config --global user.name lizhiyong

git config --global excludesfile /Users/lizhiyong/.gitignore
```

也可以直接修改配置文件 sudo vi ~/.gitconfig ，摁i进入编辑模式，在最下面添加一段配置代码，按Esc退出编辑模式，输入:wq保存并退出。

```ini
[http]
    proxy = socks5://127.0.0.1:1080
[https]
    proxy = socks5://127.0.0.1:1080
[user]
    email = lizhiyong2000@gmail.com
    name = lizhiyong2000
[core]
    excludesfile = /Users/lizhiyong/.gitignore    
```


+ git项目配置文件

在每个git项目目录下的./git/config文件里，都有本项目相关的配置，可覆盖全局配置文件中的配置：
```ini
[core]
    repositoryformatversion = 0
    filemode = true
    bare = false
    logallrefupdates = true
    ignorecase = true
    precomposeunicode = true
[remote "origin"]
    url = https://github.com/lizhiyong2000/stream-tools
    fetch = +refs/heads/*:refs/remotes/origin/*
```

+ 完美解决github访问速度慢

其实 `git clone` 或者 `git push` 特别慢，并不是因为 `http://github.com` 的这个域名被限制了。而是 `http://github.global.ssl.fastly.Net` 这个域名被限制了。那么首先查到这个域名的ip，然后在hosts文件中进行 `ip -> 域名` 映射就可以了。

**获取Github相关网站的ip**

​	访问 `https://www.ipaddress.com`，拉下来，找到页面中下方的 `IP Address Tools – Quick Links`

​	分别输入 `github.global.ssl.fastly.net` 和 `github.com`，查询ip地址

**修改本地hosts文件**

增加github.global.ssl.fastly.net和github.com的映射

```ini
151.101.113.194 github.global.ssl.fastly.net
192.30.253.112 github.com
```



### 参考链接

[github 访问速度太慢](https://snowdreams1006.github.io/github/speedup.html)