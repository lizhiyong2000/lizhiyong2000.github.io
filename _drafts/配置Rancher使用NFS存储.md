---
layout: "post"
title: "Centos7桌面系统美化"
date: "2019-04-02 16:21"
---



mysql> SHOW VARIABLES LIKE 'vali%';
+--------------------------------------+--------+
| Variable_name                        | Value  |
+--------------------------------------+--------+
| validate_password_dictionary_file    |        |
| validate_password_length             | 8      |
| validate_password_mixed_case_count   | 1      |
| validate_password_number_count       | 1      |
| validate_password_policy             | MEDIUM |
| validate_password_special_char_count | 1      |
+--------------------------------------+--------+


validate_password_length 8 # 密码的最小长度，此处为8。
validate_password_mixed_case_count 1 # 至少要包含小写或大写字母的个数，此处为1。
validate_password_number_count 1 # 至少要包含的数字的个数，此处为1。
validate_password_policy MEDIUM # 强度等级，其中其值可设置为0、1、2。分别对应：
【0/LOW】：只检查长度。
【1/MEDIUM】：在0等级的基础上多检查数字、大小写、特殊字符。
【2/STRONG】：在1等级的基础上多检查特殊字符字典文件，此处为1。
validate_password_special_char_count 1 # 至少要包含的个数字符的个数，此处为1。

想要关闭这个插件，则在配置文件中加入以下并重启mysqld即可：

[mysqld]
validate_password=off


set global validate_password_policy=0;

set global validate_password_length=6;

[CentOS 7 下 Yum 安装 MySQL 5.7](https://qizhanming.com/blog/2017/05/10/centos-7-yum-install-mysql-57)


systemctl stop firewalld
systemctl disable firewalld



## 参考链接

*  [Extract images frame by frame from a video file using FFMPEG](https://www.bugcodemaster.com/article/extract-images-frame-frame-video-file-using-ffmpeg)


* [Read and Write Video Frames in Python Using FFMPEG](http://zulko.github.io/blog/2013/09/27/read-and-write-video-frames-in-python-using-ffmpeg/)

* [Python3 中代理使用方法总结](https://zhuanlan.zhihu.com/p/30670193)



* [ubuntu运行VNC Server无桌面时的解决方案](http://azyet.github.io/2015/06/03/ubuntuXfce4VNC/)
