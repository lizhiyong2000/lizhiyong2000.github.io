---
layout: "post"
title: "SpringCloud 搭建OAuth2 统一授权服务之单点登录"
date: "2018-12-21 15:25"
categories: SpringCloud OAuth
description: SpringCloud OAuth2.0
tags: SpringCloud OAuth SSO
---

* content
{:toc}

<div class="postImg" style="background-image:url(http://pjpst7ucp.bkt.clouddn.com/2018-dc55c005.png)" ></div>

> “Spring Cloud Security OAuth2 是 Spring 对 OAuth2 的开源实现，与Spring Cloud技术栈无缝集成，使用默认配置，开发者只需要添加注解就能完成 OAuth2 授权服务的搭建。”

## Demo工程准备
在上篇文章[SpringCloud 搭建OAuth2 统一授权服务](https://lizhiyong2000.github.io/2018/12/14/springcloud-%E6%90%AD%E5%BB%BAoauth2-%E7%BB%9F%E4%B8%80%E6%8E%88%E6%9D%83%E6%9C%8D%E5%8A%A1/)中，使用SpingCloud OAuth2搭建了基础的授权服务器，本文将基于OAuth2授权搭建单点登录服务。

本文代码下载地址:[https://github.com/lizhiyong2000/tutorials/tree/master/oauth-demo](https://github.com/lizhiyong2000/tutorials/tree/master/oauth-demo)

实现单点登录主要包含3个部分：
1. 授权服务器
2. 资源服务器1（Client1）
3. 资源服务器2（Client2）

## 服务器配置
### 1. 授权服务器配置
授权服务器配置AuthorizationServerConfig添加如下配置：
```java
@Bean
public UserDetailsService userDetailsService() {
    InMemoryUserDetailsManager manager = new InMemoryUserDetailsManager();
    manager.createUser(
            User.withUsername("user").password(passwordEncoder.encode("password")).roles("USER").build());
    return manager;
}


@Bean
public ClientDetailsService clientDetails() {

    InMemoryClientDetailsService inMemoryClientDetailsService = new InMemoryClientDetailsService();

    Map<String, ClientDetails> clientDetailsStore = new HashMap<>();

    BaseClientDetails clientDetails =  new BaseClientDetails("test_client", "",
            "all", "implicit,authorization_code", "ROLE_USER,ROLE_TRUSTED_CLIENT","http://localhost:8081/client1/login,http://localhost:8082/client2/login");

    clientDetails.setClientSecret(passwordEncoder.encode("test_client"));
    clientDetailsStore.put("test_client",clientDetails);

    inMemoryClientDetailsService.setClientDetailsStore(clientDetailsStore);

    return inMemoryClientDetailsService;
}

```
授权服务器配置文件application.yml中添加如下配置：
```yaml
server:
    port: 8080
    servlet:
        context-path: /auth
```
### 2. 资源服务器配置
资源服务器中通过@EnableResourceServer添加资源服务器配置，对/test/** 接口开启token认证。

```java
@Configuration
@EnableResourceServer
public class ResourceServerConfig extends ResourceServerConfigurerAdapter {

    private static Logger logger = LoggerFactory.getLogger(ResourceServerConfig.class);

    @Override
    public void configure(HttpSecurity http) throws Exception {

        http.requestMatchers().antMatchers("/test/**")
                .and()
                .authorizeRequests()
                .antMatchers("/test/**").authenticated();


    }
}
```

资源服务器Client1 配置文件application.yml中添加如下配置：
```yaml
server:
    port: 8081
    servlet:
        context-path: /client1
security:
    oauth2:
        client:
            clientId: test_client
            clientSecret: test_client
            accessTokenUri: http://localhost:8080/auth/oauth/token
            userAuthorizationUri: http://localhost:8080/auth/oauth/authorize
        resource:
            userInfoUri: http://localhost:8080/auth/user/me
```

资源服务器Client2 配置文件application.yml中添加如下配置：
```yaml
server:
    port: 8081
    servlet:
        context-path: /client2
security:
    oauth2:
        client:
            clientId: test_client
            clientSecret: test_client
            accessTokenUri: http://localhost:8080/auth/oauth/token
            userAuthorizationUri: http://localhost:8080/auth/oauth/authorize
        resource:
            userInfoUri: http://localhost:8080/auth/user/me
```


其他的工程配置及具体的访问接口请参考[https://github.com/lizhiyong2000/tutorials/tree/master/oauth-demo](https://github.com/lizhiyong2000/tutorials/tree/master/oauth-demo)


### 3.结果测试
通过Oauth2进行登录验证，结果：
![](http://pjpst7ucp.bkt.clouddn.com/2018-43a98728.gif)


验证过程中碰到的问题：
1.未设置Client Secret导致授权页面无法授权。
2.授权类型中间的逗号后不要留有空格，会导致授权类型不匹配。

## 小结
本例中演示了基于Spring Cloud Security构建SSO功能，不过似乎token还不能自动跨服务器传递，后续将结合JWT进行研究。


## 参考链接
* [理解OAuth2.0](http://www.ruanyifeng.com/blog/2014/05/oauth_2_0.html)

* [Using Spring Oauth2 to secure REST](http://www.tinmegali.com/en/2017/06/25/oauth2-using-spring/)

* [Spring Security系列博客](https://www.jianshu.com/u/fb66b7412d27)
