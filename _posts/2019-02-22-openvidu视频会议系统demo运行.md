---
layout: "post"
title: "openvidu视频会议系统demo运行"
date: "2019-02-22 10:30"
categories: WebRTC
description: openvidu视频会议系统demo运行
tags: openvidu Kurento WebRTC
---

* content
{:toc}

<div class="postImg" style="background-image:url(http://carforeasy.cn/kurento服务器安装-b09bf8b7.png)" ></div>

> “WebRTC是google开源的视频通话技术，Kurento是Kurento公司开源的较为完善的WebRTC流媒体服务器。Kurento架构的核心是媒体服务器，它被命名为Kurento媒体服务器，即KMS。Kurento同时提供了一系列的客户端API，可以简化供浏览器、移动平台使用的视频类应用程序的开发。Openvidu视频会议包括KMS(媒体服务）、Openvidu-server（会议服务）、WebAPP（Web网站）,而一般的业务应用都只是需要进行WebApp开发即可。




## 环境准备
为了使用户更方便简单地搭建视频会议系统，Kurento团队推出了openvidu项目，在KMS之上提供视频会议服务，本文将使用openvidu官方例子openvidu-js-java進行部署，后台openvidu-server（会议服务）与KMS(媒体服务）直接使用官网docker部署。

>Kurento is the WebRTC framework on which OpenVidu is built. Openvidu was forked from KurentoRoom project.

本次安装采用Ubuntu 18.04系统，系统中已经安装好了JDK，Maven，Git，Docker。

## 启动opvidu web app服务器
首先，下载opvidu web app教程源码，通过maven直接运行。
    git clone https://github.com/OpenVidu/openvidu-tutorials.git
    cd openvidu-tutorials && git checkout v2.8.0

    cd openvidu-js-java
    mvn package exec:java

启动结果：

```
2019-02-22 13:35:00.478  INFO 19158 --- [java.App.main()] s.w.s.m.m.a.RequestMappingHandlerMapping : Mapped "{[/api-login/login],methods=[POST]}" onto public org.springframework.http.ResponseEntity<java.lang.Object> io.openvidu.js.java.LoginController.login(java.lang.String,javax.servlet.http.HttpSession) throws org.json.simple.parser.ParseException
2019-02-22 13:35:00.478  INFO 19158 --- [java.App.main()] s.w.s.m.m.a.RequestMappingHandlerMapping : Mapped "{[/api-login/logout],methods=[POST]}" onto public org.springframework.http.ResponseEntity<java.lang.Object> io.openvidu.js.java.LoginController.logout(javax.servlet.http.HttpSession)
2019-02-22 13:35:00.479  INFO 19158 --- [java.App.main()] s.w.s.m.m.a.RequestMappingHandlerMapping : Mapped "{[/api-sessions/remove-user],methods=[POST]}" onto public org.springframework.http.ResponseEntity<org.json.simple.JSONObject> io.openvidu.js.java.SessionController.removeUser(java.lang.String,javax.servlet.http.HttpSession) throws java.lang.Exception
2019-02-22 13:35:00.479  INFO 19158 --- [java.App.main()] s.w.s.m.m.a.RequestMappingHandlerMapping : Mapped "{[/api-sessions/get-token],methods=[POST]}" onto public org.springframework.http.ResponseEntity<org.json.simple.JSONObject> io.openvidu.js.java.SessionController.getToken(java.lang.String,javax.servlet.http.HttpSession) throws org.json.simple.parser.ParseException
2019-02-22 13:35:00.480  INFO 19158 --- [java.App.main()] s.w.s.m.m.a.RequestMappingHandlerMapping : Mapped "{[/error],produces=[text/html]}" onto public org.springframework.web.servlet.ModelAndView org.springframework.boot.autoconfigure.web.BasicErrorController.errorHtml(javax.servlet.http.HttpServletRequest,javax.servlet.http.HttpServletResponse)
2019-02-22 13:35:00.480  INFO 19158 --- [java.App.main()] s.w.s.m.m.a.RequestMappingHandlerMapping : Mapped "{[/error]}" onto public org.springframework.http.ResponseEntity<java.util.Map<java.lang.String, java.lang.Object>> org.springframework.boot.autoconfigure.web.BasicErrorController.error(javax.servlet.http.HttpServletRequest)
2019-02-22 13:35:00.495  INFO 19158 --- [java.App.main()] o.s.w.s.handler.SimpleUrlHandlerMapping  : Mapped URL path [/webjars/**] onto handler of type [class org.springframework.web.servlet.resource.ResourceHttpRequestHandler]
2019-02-22 13:35:00.495  INFO 19158 --- [java.App.main()] o.s.w.s.handler.SimpleUrlHandlerMapping  : Mapped URL path [/**] onto handler of type [class org.springframework.web.servlet.resource.ResourceHttpRequestHandler]
2019-02-22 13:35:00.517  INFO 19158 --- [java.App.main()] o.s.w.s.handler.SimpleUrlHandlerMapping  : Mapped URL path [/**/favicon.ico] onto handler of type [class org.springframework.web.servlet.resource.ResourceHttpRequestHandler]
2019-02-22 13:35:00.529  INFO 19158 --- [java.App.main()] oConfiguration$WelcomePageHandlerMapping : Adding welcome page: class path resource [static/index.html]
2019-02-22 13:35:00.598  INFO 19158 --- [java.App.main()] o.s.j.e.a.AnnotationMBeanExporter        : Registering beans for JMX exposure on startup
2019-02-22 13:35:00.673  INFO 19158 --- [java.App.main()] s.b.c.e.t.TomcatEmbeddedServletContainer : Tomcat started on port(s): 5000 (https)
2019-02-22 13:35:00.676  INFO 19158 --- [java.App.main()] io.openvidu.js.java.App                  : Started App in 2.154 seconds (JVM running for 42.379)
2019-02-22 13:45:36.730  INFO 19158 --- [nio-5000-exec-2] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring FrameworkServlet 'dispatcherServlet'
2019-02-22 13:45:36.730  INFO 19158 --- [nio-5000-exec-2] o.s.web.servlet.DispatcherServlet        : FrameworkServlet 'dispatcherServlet': initialization started
2019-02-22 13:45:36.739  INFO 19158 --- [nio-5000-exec-2] o.s.web.servlet.DispatcherServlet        : FrameworkServlet 'dispatcherServlet': initialization completed in 9 ms

```
## 启动opvidu 服务器和KMS服务器
openidu server和KMS server通过docker运行官方镜像：
    docker run -p 4443:4443 –rm -e KMS_STUN_IP=stun.l.google.com -e KMS_STUN_PORT=19302 -e openvidu.secret=MY_SECRET -e openvidu.publicurl=https://192.168.2.42:8443/ openvidu/openvidu-server-kms:2.8.0

启动结果：

```
    [INFO] 2019-02-22 06:22:08,364 [main] org.apache.coyote.http11.Http11NioProtocol (log) - Initializing ProtocolHandler ["https-jsse-nio-0.0.0.0-4443"]
    [INFO] 2019-02-22 06:22:08,371 [main] org.apache.coyote.http11.Http11NioProtocol (log) - Starting ProtocolHandler [https-jsse-nio-0.0.0.0-4443]

    2019-02-22 06:22:08,484 DEBG 'openvidu-server' stdout output:
    [INFO] 2019-02-22 06:22:08,484 [main] org.apache.tomcat.util.net.NioSelectorPool (log) - Using a shared selector for servlet write/read

    2019-02-22 06:22:08,547 DEBG 'openvidu-server' stdout output:
    [INFO] 2019-02-22 06:22:08,547 [main] org.springframework.boot.context.embedded.tomcat.TomcatEmbeddedServletContainer (start) - Tomcat started on port(s): 4443 (https)

    2019-02-22 06:22:08,550 DEBG 'openvidu-server' stdout output:
    [INFO] 2019-02-22 06:22:08,550 [main] io.openvidu.server.OpenViduServer (printUrl) -

        ACCESS IP
    -------------------------
    https://192.168.2.42:4443/
    -------------------------


    2019-02-22 06:22:08,551 DEBG 'openvidu-server' stdout output:
    [INFO] 2019-02-22 06:22:08,550 [main] io.openvidu.server.OpenViduServer (logStarted) - Started OpenViduServer in 4.521 seconds (JVM running for 5.492)
```

## Demo测试
访问web服务器地址：https://192.158.2.42:5000,输入页面上提供的用户名和密码即可登录。
![](http://carforeasy.cn/kurento服务器安装-8b5d9797.png)


登录完成后，创建session或者加入已有的session
![](http://carforeasy.cn/kurento服务器安装-096d295f.png)

session加入后，允许摄像头和麦克风访问，便可看到视频连接
![](http://carforeasy.cn/kurento服务器安装-85bcd59a.png)

## 参考链接
- [基于Kurento搭建WebRTC服务器](https://blog.gmem.cc/webrtc-server-basedon-kurento)

- [kurento和打洞的服务器的安装及部署](https://www.jianshu.com/p/762a4587346d)

- [使用openvidu 進行WebAPP開發環境部署（使用docker部署）](http://www.dayexie.com/detail1977840.html)
