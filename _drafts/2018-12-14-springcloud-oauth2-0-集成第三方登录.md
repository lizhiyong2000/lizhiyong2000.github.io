---
layout: "post"
title: "SpringCloud OAuth2.0 集成第三方登录"
date: "2018-12-14 15:26"
categories: SpringCloud OAuth
description: SpringCloud OAuth2.0 集成第三方登录
tags: SpringCloud OAuth ScribeJava
---
* content
{:toc}:
<div class="postImg" style="background-image:url(http://pjpst7ucp.bkt.clouddn.com/auth2.jpg)"></div>
> “Spring Cloud Security OAuth2 是 Spring 对 OAuth2 的开源实现，与Spring Cloud技术栈无缝集成，使用默认配置，开发者只需要添加注解就能完成 OAuth2 授权服务的搭建。”


## OAuth 2.0


## Spring Security


1. **正向代理**


    ![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/1661ac31c06b0681.jpeg)
    <p class="img-instructions">nginx-proxy</p>

    概括说：就是客户端和代理服务器可以直接互相访问，属于一个LAN（局域网）；代理对用户是非透明的，即用户需要自己操作或者感知得到自己的请求被发送到代理服务器；代理服务器通过代理用户端的请求来向域外服务器请求响应内容。

2. **反向代理**



3. **为什么要Nginx反向代理**
2018-12-14


## 前端可以用Nginx做些什么

下面的内容建立在对Nginx配置有基本认知的情况下。如果没有的话，请先从网上查阅资料（例如[基本配置](https://link.juejin.im/?target=http%3A%2F%2Fwww.nginx.cn%2F76.html)）做简单了解。如果你想本地安装Nginx，强烈建议采用[源码编译安装](https://link.juejin.im/?target=http%3A%2F%2Fwww.nginx.cn%2Finstall)，这样后续添加模块更为方便。

1. **快速实现简单的访问限制**

    经常会遇到希望网站让某些特定用户的群体（比如只让公司内网）访问，或者控制某个uri不让人访问。Nginx配置如下：
    ```js
        location / {
        deny  192.168.1.100;
        allow 192.168.1.10/200;
        allow 10.110.50.16;
        deny  all;
    }
    ```


## 总结

上述只是通过一些简单的小例子，希望能够引起广大前端童靴对Niginx的兴趣。事实上，Nginx不仅仅局限于这些微小的工作，在实际生产中作用其实更加巨大。对于有志于“大前端”的童靴，了解和熟悉Nginx绝对是必修技能之一。






## 总结ZZZZZz

[springboot spring-security 集成微信登录](https://blog.csdn.net/luotuo818/article/details/78685842)
