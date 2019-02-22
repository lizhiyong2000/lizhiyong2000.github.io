---
layout: "post"
title: "Ubuntu下安装Jekyll环境"
date: "2019-02-19 08:40"
---

## 安装ruby环境
```shell
~$ sudo apt install ruby ruby-dev

~$ sudo gem install jekyll bundler minima

~$ jekyll --version
```


```shell
~$ jekyll new myblog

~$ cd myblog

~/myblog $ jekyll serve

# => Now browse to http://localhost:4000
```
