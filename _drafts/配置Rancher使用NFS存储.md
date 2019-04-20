---
layout: "post"
title: "Centos7桌面系统美化"
date: "2019-04-02 16:21"
---




提取所有帧：
```
ffmpeg -i 1.ts thumb%04d.jpg -hide_banner
```

提取1帧：
ffmpeg -i 1.ts -ss 00:00:01.000 -vframes 1 thumb.jpg
## 参考链接

*  [Extract images frame by frame from a video file using FFMPEG](https://www.bugcodemaster.com/article/extract-images-frame-frame-video-file-using-ffmpeg)


* [Read and Write Video Frames in Python Using FFMPEG](http://zulko.github.io/blog/2013/09/27/read-and-write-video-frames-in-python-using-ffmpeg/)

* [Python3 中代理使用方法总结](https://zhuanlan.zhihu.com/p/30670193)



假设集群操作系统均为：CentOS 6.7 x64
Hadoop版本为：2.6.3
一、动态增加DataNode

1、准备新的DataNode节点机器，配置SSH互信，可以直接复制已有DataNode中.ssh目录中的authorized_keys和id_rsa
2、复制Hadoop运行目录、hdfs目录及tmp目录至新的DataNode
3、在新DataNode上启动hadoop

..sbin/hadoop-daemon.sh start datanode
..sbin/yarn-daemon.sh start datanode

4、在NameNode上刷新节点

..bin/hdfs dfsadmin -refreshNodes
..sbin/start-balancer.sh

5、为方便下次启动，可以将新DataNode的域名和ip加入/etc/hosts中

二、动态删除DataNode

1、配置NameNode的hdfs-site.xml，适当减小dfs.replication副本数，增加dfs.hosts.exclude配置

     <property>
        <name>dfs.hosts.exclude</name>
        <value>/usr/local/hadoop2/etc/hadoop/excludes</value>
      </property>

2、在对应路径（/etc/hadoop/）下新建excludes文件，并写入待删除DataNode的ip或域名
3、在NameNode上刷新所有DataNode

..bin/hdfs dfsadmin -refreshNodes
..sbin/start-balancer.sh

4、此时，可以在web检测界面（ip:50070）上可以观测到DataNode逐渐变为Dead。
