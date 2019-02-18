---
layout: "post"
title: "SpringCloud 搭建OAuth2 统一授权服务之JWT集成"
date: "2018-12-21 15:57"
categories: SpringCloud OAuth
description: SpringCloud OAuth2.0 JWT集成
tags: SpringCloud OAuth JWT
---

* content
{:toc}

<div class="postImg" style="background-image:url(http://carforeasy.cn/2018-35454f38.png)" ></div>

> “Spring Cloud Security OAuth2 是 Spring 对 OAuth2 的开源实现，与Spring Cloud技术栈无缝集成，使用默认配置，开发者只需要添加注解就能完成 OAuth2 授权服务的搭建。”

## JSON Web Token (JWT)介绍

JWT是一个定义一种紧凑的，自包含的并且提供防篡改机制的传递数据的方式的标准协议。

我们先来看一个简单的示例：

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Imxpbmlhbmh1aSJ9.hnOfZb95jFwQsYj3qlgFbUu1rKpfTE6AzgXZidEGGTk

就是这么一堆看起来像是乱码一样的字符串。JWT由3部分构成：header.payload.signature，每个部分由“.”来分割开来。

### 1. Header

header是一个有效的JSON，其中通常包含了两部分：token类型和签名算法。

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

对这个JSON采用base64编码后就是第1部分eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9。

### 2. Payload

这一部分代表真正想要传递的数据，包含一组Claims，其中JWT预定义了一些Claim（2. Token 元数据 这一节就用到一些JWT预定义的一些Cliam）后面会介绍。关于什么是Claim，可以参考文章末尾给的参考链接。

```json
{
  "sub": "1234567890",
  "name": "linianhui"
}
```

对这个JSON采用base64编码后就是第2部分eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Imxpbmlhbmh1aSJ9。

### 3. Signature

这一部分是可选的，由于前面Header和Payload部分是明文的信息，所以这一部分的意义在于保障信息不被篡改用的，生成这部分的方式如下：

```json
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret)
```

token生成方使用header中指定的签名算法对“header.payload”部分进行签名，得到的第3部分hnOfZb95jFwQsYj3qlgFbUu1rKpfTE6AzgXZidEGGTk,然后组合成一个完整的JWT字符串 . 而token消费方在拿到token后, 使用同样的签名算法来生成签名，用来判断header和payload部分有没有被篡改过，因为签名的密钥是只有通信双方知道的，所以可以保证这部分信息不被第三方所篡改。

JWT token编码前示例：

```json
{
  "alg":"RS256",
  "typ":"JWT"
}
{
  "exp": 1492873315,
  "user_name": "reader",
  "authorities": [
    "AURH_READ"
  ],
  "jti": "8f2d40eb-0d75-44df-a8cc-8c37320e3548",
  "client_id": "web_app",
  "scope": [
    "FOO"
  ]
}
```

使用JWT token时，服务器验证token真实性后，token的其他信息可以直接获取，减少了token权限校验的存储时间，服务端可以通过内嵌的声明信息，很容易地获取用户的会话信息，而不需要去访问用户或会话的数据库。在一个分布式的面向服务的框架中，这一点非常有用。


### 4. 为什么使用JWT

-   优点

1.  因为json的通用性，所以JWT是可以进行跨语言支持的，像JAVA,JavaScript,NodeJS,PHP等很多语言都可以使用。
2.  因为有了payload部分，所以JWT可以在自身存储一些其他业务逻辑所必要的非敏感信息。
3.  便于传输，jwt的构成非常简单，字节占用很小，所以它是非常便于传输的。
4.  它不需要在服务端保存会话信息, 所以它易于应用的扩展

-   安全相关

1.  不应该在jwt的payload部分存放敏感信息，因为该部分是客户端可解密的部分。
2.  保护好secret私钥，该私钥非常重要。
3.  如果可以，请使用https协议

## SpringCloud OAuth2集成JWT
源代码地址：
[https://github.com/lizhiyong2000/tutorials/tree/master/oauth-demo](https://github.com/lizhiyong2000/tutorials/tree/master/oauth-demo)
### 1. 授权服务器配置

修改授权服务器配置AuthorizationServerConfig添加如下配置：

```java
    @Override
    public void configure(AuthorizationServerEndpointsConfigurer endpoints) throws Exception {

        endpoints.authenticationManager(authenticationManager)
//                .tokenServices(tokenServices())
                .tokenStore(tokenStore())
                .accessTokenConverter(accessTokenConverter())
                .userDetailsService(userDetailsService());

        endpoints.allowedTokenEndpointRequestMethods(HttpMethod.GET, HttpMethod.POST, HttpMethod.DELETE);
    }


//    @Bean
//    public TokenStore tokenStore() {
//        return new InMemoryTokenStore();
//    }


    @Bean
    public TokenStore tokenStore() {
        return new JwtTokenStore(accessTokenConverter());
    }

    @Bean
    public JwtAccessTokenConverter accessTokenConverter() {
        JwtAccessTokenConverter converter = new JwtAccessTokenConverter();
        converter.setSigningKey("123");
        return converter;

    }
```

### 2. 资源服务器配置
修改授权服务器配置ResourceServerConfig添加如下配置：

```java
    @Autowired
    private TokenStore tokenStore;

    @Override
    public void configure(ResourceServerSecurityConfigurer resources) throws Exception {
        resources
                .resourceId("resource_id")
                .tokenStore(tokenStore);
    }
```

### 3.测试结果
1) 访问授权接口获取token
[localhost:8080/auth/oauth/token?grant_type=password&username=user&password=password&client_id=test_client&client_secret=test_client](localhost:8080/auth/oauth/token?grant_type=password&username=user&password=password&client_id=test_client&client_secret=test_client)
![](http://carforeasy.cn/2018-b3590329.png)

2) 对获取到的token进行验证
[https://py-jwt-decoder.appspot.com](https://py-jwt-decoder.appspot.com)
![](http://carforeasy.cn/2018-9342810b.png)
3) 使用获取到的token访问资源接口
[http://localhost:8080/auth/user/me?access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsicmVzb3VyY2VfaWQiXSwidXNlcl9uYW1lIjoidXNlciIsInNjb3BlIjpbInJlYWQiLCJ3cml0ZSIsImFsbCJdLCJleHAiOjE1NDU2MzM0OTQsImF1dGhvcml0aWVzIjpbIlJPTEVfVVNFUiJdLCJqdGkiOiIzZTE3NTA1ZC0yOWRkLTQ5MGItYWYzYy0zZmQ3NzRhNjE1OTYiLCJjbGllbnRfaWQiOiJ0ZXN0X2NsaWVudCJ9.UrHohYNqO8Y4OvcVSG5Zpi7gsUT6FHmcFZpy3kQFZtM](http://localhost:8080/auth/user/me?access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsicmVzb3VyY2VfaWQiXSwidXNlcl9uYW1lIjoidXNlciIsInNjb3BlIjpbInJlYWQiLCJ3cml0ZSIsImFsbCJdLCJleHAiOjE1NDU2MzM0OTQsImF1dGhvcml0aWVzIjpbIlJPTEVfVVNFUiJdLCJqdGkiOiIzZTE3NTA1ZC0yOWRkLTQ5MGItYWYzYy0zZmQ3NzRhNjE1OTYiLCJjbGllbnRfaWQiOiJ0ZXN0X2NsaWVudCJ9.UrHohYNqO8Y4OvcVSG5Zpi7gsUT6FHmcFZpy3kQFZtM)

![](http://carforeasy.cn/2018-85f87696.png)


## 参考链接
*  [Using Spring Oauth2 to secure REST](http://www.tinmegali.com/en/2017/06/25/oauth2-using-spring/)
*  [Using JWT with Spring Security OAuth](https://www.baeldung.com/spring-security-oauth-jwt)
*  [Spring Boot,Spring Security实现OAuth2 + JWT认证](https://www.jianshu.com/p/2c231c96a29b)
*  [spring security 整合jwt](https://liguanhua.com/article/001513500678404192dc0ebd730470e945b018bf485780d000)
