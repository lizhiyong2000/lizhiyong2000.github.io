---
layout: "post"
title: "SpringCloud 搭建OAuth2 统一授权服务"
date: "2018-12-20 15:25"
categories: SpringCloud OAuth
description: SpringCloud OAuth2.0
tags: SpringCloud OAuth
---

* content
{:toc}

<div class="postImg" style="background-image:url(http://pjpst7ucp.bkt.clouddn.com/auth2.jpg)" ></div>

> “Spring Cloud Security OAuth2 是 Spring 对 OAuth2 的开源实现，与Spring Cloud技术栈无缝集成，使用默认配置，开发者只需要添加注解就能完成 OAuth2 授权服务的搭建。”

## Demo工程准备

### 1. 添加Oauth依赖
SpringBoot工程中添加相关pom依赖，pom.xml文件如下：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example.oauth</groupId>
    <artifactId>oauth-demo</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <spring-boot.version>2.1.0.RELEASE</spring-boot.version>

        <spring-cloud.version>Greenwich.M2</spring-cloud.version>
    </properties>

    <repositories>
        <repository>
            <id>spring-milestones</id>
            <name>Spring Milestones</name>
            <url>http://repo.spring.io/milestone</url>
            <snapshots>
                <enabled>false</enabled>
            </snapshots>
        </repository>
    </repositories>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring-boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>


        </dependencies>
    </dependencyManagement>

    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-oauth2</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

### 2. 添加访问测试接口
添加测试访问接口如下：
```java
@RestController
public class DemoController {

    @GetMapping(path = "/hello")
    public String hello() {
        return "hello demo";
    }
}
```

运行工程后使用浏览器访问地址：[http://localhost:8080/](http://localhost:8080/)，发现接口已经加入了安全控制，默认需要输入用户名密码进行验证。

![](http://pjpst7ucp.bkt.clouddn.com/2018-6cc06dad.png)

要更改默认的安全配置，通过WebSecurityConfigurerAdapter进行扩展即可，我们首先配置内存中保存的用户名密码进行验证。

```java
@Configuration
@EnableWebSecurity( debug = true )
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.rememberMe()
            .and()
                .authorizeRequests()
                    .anyRequest().authenticated()
                    .antMatchers("/login**").permitAll()
                    .antMatchers("/logout**").permitAll()
                    .antMatchers("/**").hasAnyRole("ADMIN", "USER")
                    .antMatchers("/auth/**", "/oauth2/**").permitAll()
            .and()
                .formLogin().permitAll()
            .and()
                .logout()
                    .logoutSuccessUrl("/logout_success")
                    .invalidateHttpSession(true)
                    .permitAll()
            .and()
                .csrf()
                    .disable();
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.inMemoryAuthentication() // creating user in memory
                .withUser("user")
                .password("password").roles("USER")
                .and().withUser("admin")
                .password("password").authorities("ROLE_ADMIN");
    }

    @Override
    @Bean
    public AuthenticationManager authenticationManagerBean() throws Exception {
        // provides the default AuthenticationManager as a Bean
        return super.authenticationManagerBean();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return NoOpPasswordEncoder.getInstance();
    }

}

```

以上配置开启了basic认证和默认的登录表单界面，为使流程更加直观，接口中简单添加个登出成功接口：
```java
@RestController
public class DemoController {;
    @GetMapping(path = "/hello")
    public String hello() {
        return "hello";
    }

    @GetMapping(value="/logout_success")
    public String logout() {
        return "logged out";
    }
}
```
基本的表单登录功能演示：
![](http://pjpst7ucp.bkt.clouddn.com/2018-0abaeef6.gif)

## 添加OAuth2 验证

### 1.授权服务器配置
```java
@Configuration
@EnableAuthorizationServer
public class AuthorizationServerConfig extends AuthorizationServerConfigurerAdapter {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Override
    public void configure(ClientDetailsServiceConfigurer clients) throws Exception {
        clients.withClientDetails(clientDetails());
    }


    @Override
    public void configure(AuthorizationServerEndpointsConfigurer endpoints) throws Exception {
        endpoints.tokenStore(tokenStore())
                .userDetailsService(userDetailsService())
                .authenticationManager(authenticationManager);
        endpoints.tokenServices(defaultTokenServices());
        endpoints.allowedTokenEndpointRequestMethods(HttpMethod.GET, HttpMethod.POST, HttpMethod.DELETE);
    }


    @Override
    public void configure(AuthorizationServerSecurityConfigurer security) throws Exception {
        security.tokenKeyAccess("permitAll()");
        security.checkTokenAccess("isAuthenticated()");
        security.allowFormAuthenticationForClients();
    }


    @Bean
    public UserDetailsService userDetailsService() {
        InMemoryUserDetailsManager manager = new InMemoryUserDetailsManager();
        manager.createUser(
                User.withUsername("user").password("password").roles("USER").build());
        return manager;
    }


    @Bean
    public ClientDetailsService clientDetails() {

        InMemoryClientDetailsService inMemoryClientDetailsService = new InMemoryClientDetailsService();

        Map<String, ClientDetails> clientDetailsStore = new HashMap<>();
        clientDetailsStore.put("test_client", new BaseClientDetails("test_client", "",
                "all", "password, refresh_token", "ROLE_CLIENT, ROLE_TRUSTED_CLIENT"));

        inMemoryClientDetailsService.setClientDetailsStore(clientDetailsStore);


        return inMemoryClientDetailsService;
    }

    @Bean
    public TokenStore tokenStore() {
        return new InMemoryTokenStore();
    }

    @Bean
    public DefaultTokenServices defaultTokenServices() {
        DefaultTokenServices tokenServices = new DefaultTokenServices();
        tokenServices.setTokenStore(tokenStore());
        tokenServices.setSupportRefreshToken(true);
        tokenServices.setClientDetailsService(clientDetails());
        tokenServices.setAccessTokenValiditySeconds(60 * 30); // token有效期自定义设置，默认12小时
        tokenServices.setRefreshTokenValiditySeconds(60 * 60);//默认30天，这里修改
        return tokenServices;
    }

}

```
### 2.资源服务器配置
资源服务器用来配置哪些资源是需要通过token进行验证的。
```java
@Configuration
@EnableResourceServer
public class ResourceServerConfig extends ResourceServerConfigurerAdapter {

    private static Logger logger = LoggerFactory.getLogger(ResourceServerConfig.class);

    @Override
    public void configure(HttpSecurity http) throws Exception {
        http.requestMatchers().antMatchers("/hello**")
                .and()
                .authorizeRequests()
                .antMatchers("/hello").authenticated();

    }
}

```
### 3.结果测试
通过Oauth2获取token后访问接口，结果：
![](http://pjpst7ucp.bkt.clouddn.com/2018-888525af.gif)


## 小结
本例中演示了Spring Cloud Security的默认设置（表单登录）及token授权验证，源代码地址：
[https://github.com/lizhiyong2000/tutorials/tree/master/oauth-demo](https://github.com/lizhiyong2000/tutorials/tree/master/oauth-demo)
后续将继续基于Spring Cloud Security构建SSO功能。


## 参考链接
* [理解OAuth2.0](http://www.ruanyifeng.com/blog/2014/05/oauth_2_0.html)

* [Using Spring Oauth2 to secure REST](http://www.tinmegali.com/en/2017/06/25/oauth2-using-spring/)

* [Spring Security系列博客](https://www.jianshu.com/u/fb66b7412d27)
