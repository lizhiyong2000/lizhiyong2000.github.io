---
layout: "post"
title: "Ambari agent命令执行流程"
date: "2019-02-28 16:35"
categories: Hadoop
description: Ambari agent命令执行流程
tags: Ambari
---
* content
{:toc}

<div class="postImg" style="background-image:url(http://carforeasy.cn/ambari-3d3306b5.png)" ></div>

> “ Ambari Server和Ambari Agent之间是通过WebSocket连接进行通信，Server把需要Agent执行的命令存储在ActionQueue中，下发推送给Agent执行，本文简单分析一下Command的处理过程。”





## Agent目录结构
分析命令执行过程前先熟悉下Agent的目录结构，了解下命令脚本在哪里，掌握脚本执行过程中的输入输出。
### 1. 运行脚本目录
+ /var/lib/ambari-agent目录
/var/lib/ambari-agent目录下保存了agent运行的主要脚本，其中bin目录下包含agent主执行文件ambari-agent，其他目录包含agent运行过程中的辅助脚本和数据。

      root@ambari-agent-0:/var/lib/ambari-agent# ls -l
      total 64
      -rwx------ 1 root root 1116 Nov 13 12:30 ambari-env.sh
      -rwxr-xr-x 1 root root 1345 Nov 13 12:30 ambari-sudo.sh
      drwxr-xr-x 2 root root 4096 Feb 18 07:45 bin
      drwxr-xr-x 1 root root 4096 Feb 25 06:03 cache
      drwxr-xr-x 1 root root 4096 Feb 18 07:45 cred
      drwx------ 1 root root 4096 Feb 25 06:05 data
      -rwx------ 1 root root 8349 Nov 13 12:30 install-helper.sh
      drwx------ 1 root root 4096 Jan 29 09:03 keys
      drwxr-xr-x 2 root root 4096 Jan 29 09:03 lib
      drwxrwxrwt 2 root root 4096 Jan 29 09:03 tmp
      drwxr-xr-x 2 root root 4096 Feb 18 07:45 tools
      -rwx------ 1 root root 2326 Nov 13 12:30 upgrade_agent_configs.py

    各目录主要作用：
  - cache：包含从server下载的脚本缓存，其中stacks目录包含各具体服务如HADOOP、ZOOKEEPER等的安装执行脚本。

        root@ambari-agent-0:/var/lib/ambari-agent/cache# ls -l
        total 44
        drwxr-xr-x 2 root root 4096 Feb 25 06:03 cluster_cache
        drwxr-xr-x 1 root root 4096 Feb 18 07:45 common-services
        drwxr-xr-x 1 root root 4096 Feb 18 07:45 custom_actions
        drwxr-xr-x 1 root root 4096 Feb 18 07:45 host_scripts
        drwxr-xr-x 1 root root 4096 Feb 18 07:45 stack-hooks
        drwxr-xr-x 1 root root 4096 Feb 18 07:45 stacks

  - cred：lib下包含一些共用jar包。

        root@ambari-agent-0:/var/lib/ambari-agent/cred/lib# ls -l
        total 8640
        -rw-r--r-- 1 root root   52988 Jan 29 07:52 commons-cli-1.3.1.jar
        -rw-r--r-- 1 root root  588337 Jan 29 06:34 commons-collections-3.2.2.jar
        -rw-r--r-- 1 root root  298829 Jan 29 08:32 commons-configuration-1.6.jar
        -rw-r--r-- 1 root root  208700 Jan 29 06:24 commons-io-2.5.jar
        -rw-r--r-- 1 root root  279193 Jan 29 07:55 commons-lang-2.5.jar
        -rw-r--r-- 1 root root   60686 Jan 29 06:24 commons-logging-1.1.1.jar
        -rw-r--r-- 1 root root 2256213 Jan 29 07:55 guava-18.0.jar
        -rw-r--r-- 1 root root   94150 Jan 29 09:02 hadoop-auth-2.7.3.jar
        -rw-r--r-- 1 root root 3479293 Jan 29 09:02 hadoop-common-2.7.3.jar
        -rw-r--r-- 1 root root 1475955 Jan 29 08:04 htrace-core-3.1.0-incubating.jar
        -rw-r--r-- 1 root root   40744 Jan 29 07:51 slf4j-api-1.7.20.jar

  - data：保存agent信息及agent命令执行数据。

        root@ambari-agent-0:/var/lib/ambari-agent/data# ls -l
        total 3240
        -rw------- 1 root root 154074 Feb 27 03:16 command-11.json
        -rw------- 1 root root 154074 Feb 27 03:19 command-12.json
        -rw------- 1 root root 154774 Feb 27 03:19 command-13.json
        -rw------- 1 root root 154172 Feb 27 03:26 command-14.json
        -rw------- 1 root root 154173 Feb 27 03:26 command-15.json
        -rw------- 1 root root 154263 Feb 27 03:26 command-16.json
        -rw------- 1 root root 154882 Feb 27 03:26 command-18.json
        -rw------- 1 root root   2826 Feb 27 03:13 command-2.json
        -rw------- 1 root root 155267 Feb 27 04:10 command-31.json
        -rw------- 1 root root 154516 Feb 27 04:10 command-32.json
        -rw------- 1 root root 154517 Feb 27 04:10 command-33.json
        -rw------- 1 root root 154607 Feb 27 04:10 command-34.json
        -rw------- 1 root root 155226 Feb 27 04:10 command-36.json
        -rw------- 1 root root 154891 Feb 27 05:33 command-52.json
        -rw------- 1 root root 154140 Feb 27 05:34 command-53.json
        -rw------- 1 root root 154141 Feb 27 05:34 command-54.json
        -rw------- 1 root root 154231 Feb 27 05:34 command-55.json
        -rw------- 1 root root 154231 Feb 27 05:34 command-56.json
        -rw------- 1 root root 154885 Feb 27 05:34 command-57.json
        -rw------- 1 root root 154221 Feb 27 05:34 command-58.json

  - keys：保存密钥文件。
  - tools：包含一些工具jar包


+ /var/lib/ambari-agent目录


      root@ambari-agent-0:/usr/lib/ambari-agent/lib# ls -l
      total 56
      drwxr-xr-x 1 root root 4096 Feb 25 06:03 ambari_agent
      drwxr-xr-x 1 root root 4096 Feb 25 06:03 ambari_commons
      drwxr-xr-x 1 root root 4096 Feb 25 06:03 ambari_jinja2
      drwxr-xr-x 1 root root 4096 Feb 25 06:03 ambari_simplejson
      drwxr-xr-x 1 root root 4096 Feb 25 06:03 ambari_stomp
      drwxr-xr-x 1 root root 4096 Feb 25 06:03 ambari_ws4py
      drwxr-xr-x 2 root root 4096 Feb 18 07:45 examples
      drwxr-xr-x 1 root root 4096 Feb 25 06:03 resource_management


### 2. 配置及日志
+ /etc/ambari-agent/conf目录

      root@ambari-agent-0:/etc/ambari-agent/conf# ls -l
      total 8
      -rw-r--r-- 1 root root 2580 Feb 25 05:56 ambari-agent.ini
      -rw-r--r-- 1 root root 2694 Nov 13 12:30 logging.conf.sample

+ log日志目录

      root@ambari-agent-0:/var/log/ambari-agent# ls -l
      total 6980
      -rw-r--r-- 1 root root 6853114 Feb 27 02:25 ambari-agent.log
      -rw-r--r-- 1 root root  270504 Feb 27 02:25 ambari-agent.out
      -rw-r--r-- 1 root root      99 Feb 18 07:45 ambari-agent-pkgmgr.log
      -rw-r--r-- 1 root root     371 Feb 25 06:03 ambari-alerts.log

### 3.其他文件

+ init启动脚本

      /etc/init.d/ambari-agent

+ pid目录

      root@ambari-agent-0:/var/run/ambari-agent# ls -l
      total 4
      -rw-r--r-- 1 root root 2 Feb 25 06:03 ambari-agent.pid

## Server-Agent命令执行流程

### 1. Agent Command 类型

+ REGISTRATION_COMMAND：注册指令，当 Server 发现 节点未注册、节点当前状态为 HEARTBEAT_LOST、Agent 上传的主机状态 Server 处理失败的时候，会要求 Agent 重试进行注册。
+ STATUS_COMMAND：汇报状态指令，Server 端有个定时任务 HeartbeatMonitor 默认1分钟执行一次，要求 Agent 汇报当前的组件状态、当前使用的配置版本等信息。
+ EXECUTION_COMMAND：执行任务指令，当我们操作服务/组件的时候，比如：安装、启动、停止、更新配置等，就会发送这个指令。
+ CANCEL_COMMAND：取消任务指令，中断一个操作。
+ ALERT_DEFINITION_COMMAND：更新 Alert 定义指令，当我们修改了 Alert 信息、增删组件、删节点的时候，会发送这个指令。
+ ALERT_EXECUTION_COMMAND：立即执行一个 Alert。

上面这些指令，除了 REGISTRATION_COMMAND，其他指令都需要先添加到 ActionQueue 中，Server 处理心跳逻辑时，如果发现 Agent 需要重新注册，会立即生成 REGISTRATION_COMMAND，要求 Agent 重新注册。

下面重点关注 EXECUTION_COMMAND。

### 2. Server命令下发流程
当用户触发了一个服务/组件的部署操作时，服务端处理逻辑：
+ (1) 计算依赖，生成 Command，并保存到数据库
+ (2) 定期从数据库加载 Command，并添加到 ActionQueue
+ (3) 命令下发：
  - 把 ActionQueue 中的所有 Command 下发给 Agent
  - 根据 Agent 的汇报，处理 Command 执行结果

具体到命令生产来说，一次对服务/组件的部署操作对应一个Request，一个 Request 包含一个或多个 Stage，一个 Stage 包含一个或多个Task，一个 Task 对应一条 Command。

![](http://carforeasy.cn/ambari-40d16cf0.png)
以上关系在数据库中对应以下几张表：
![](http://carforeasy.cn/ambari-ade7e74e.png)


+ 流程示例：
下面将以一次通过安装向导安装HDFS服务为例，查看安装过程中服务器在数据库中生成的以上4张表，向导安装过程并没有一次安装成功，安装过程重试2次后才完全安装成功。

  - REGUEST表代表了操作次数，其中安装过程进行了3次（id分别为6，7，8），安装成功后对安装的服务进行检查并启动（id为9）：

    ![](http://carforeasy.cn/ambari-47b5e5bf.png)

  - STAGE表对应每个Request的执行过程，可以看到除了id为9的request包含4个stage外，其他request都只包含一个stage：
    ![](http://carforeasy.cn/ambari-3accb1b8.png)


  - HOST_ROLE_COMMAND表对应具体的命令（id为7的request对应的命令与id为8的request完全相同）：
    ![](http://carforeasy.cn/ambari-9be9933a.png)

    ![](http://carforeasy.cn/ambari-a6a28e33.png)

    ![](http://carforeasy.cn/ambari-c2de358b.png)

  - EXECUTION_COMMAND表对应具体的命令：
    ![](http://carforeasy.cn/ambari-30e68cb8.png)


### 3. Agent命令处理流程
命令执行通过调用ActionQueue的process_command函数完成。在process_command函数中主要是对非法指令做过滤，然后调用execute_command执行命令。在Execute_command通过调用CustomServiceOrchestrator的runCommand函数执行命令。
+ 在ActionQueue的execute_command中，对每个命令确认stdout， stderr及structuredOut（如果存在）的输出路径，然后调用CustomServiceOrchestrator的runCommand执行命令，命令执行结束后，更新命令状态，将命令结果更行到stdout，stderr，及及structuredout文件中。
+ 在CustomServiceOrchestrator执行命令过程：
  - 1）根据收到的command参数，准备command，在/var/lib/ambari-agent/data中生成相关的command-taskId.json记录文件
  - 2）获取脚本路径及参数，获取python执行器，通过python_executor.run_file执行python脚本，脚本包括服务的动作执行前的hook脚本、命令动作脚本、动作执行后的hook脚本。


## 参考链接
* [Ambari Agent Command 处理流程](https://www.cnblogs.com/basenet855x/p/6841488.html)
