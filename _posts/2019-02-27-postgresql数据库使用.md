---
layout: "post"
title: "PostgreSQL数据库使用"
date: "2019-02-27 08:23"
categories: 数据库
description: PostgreSQL数据库使用
tags: PostgreSQL
---

* content
{:toc}

<div class="postImg" style="background-image:url(http://carforeasy.cn/postgresql数据库使用-329908b7.png)"></div>

> “PostgreSQL是一个功能强大的开源对象关系数据库管理系统(ORDBMS)。 PostgreSQL(也称为Post-gress-Q-L)由PostgreSQL全球开发集团(全球志愿者团队)开发。 它不受任何公司或其他私人实体控制。PostgreSQL是跨平台的，可以在许多操作系统上运行，如Linux，FreeBSD，OS X，Solaris和Microsoft Windows等。”





## 安装PostgreSQL
安装PostgreSQL服务器。

    sudo apt-get install postgresql

正常情况下，安装完成后，PostgreSQL服务器会自动在本机的5432端口开启。

然后，安装PostgreSQL客户端。

    sudo apt-get install postgresql-client


如果还想安装图形管理界面，可以安装pgadmin3。

    sudo apt-get install pgadmin3

## 基本命令

    psql -h 127.0.0.1 -p 5432  -d exampledb -U dbuser

上面命令的参数含义如下：-h指定服务器，-p指定端口，-d指定数据库，-U指定用户。

输入上面命令以后，系统会提示输入dbuser用户的密码。输入正确，就可以登录控制台了。

其他命令：
  + \h：查看SQL命令的解释，比如\h select。
  + \?：查看psql命令列表。
  + \l：列出所有数据库。
  + \c [database_name]：连接其他数据库。
  + \d：列出当前数据库的所有表格。
  + \d [table_name]：列出某一张表格的结构。
  + \du：列出所有用户。
  + \e：打开文本编辑器。
  + \conninfo：列出当前数据库和连接的信息。
  + \q：断开链接

## 图形客户端
使用pgadmin3添加服务器连接后，即可连接至指定的数据库：
![](http://carforeasy.cn/postgresql数据库使用-85c3ae6c.png)

在左侧对象浏览窗口中选择数据表，点击工具栏中表格按钮可以查看数据表中数据：
![](http://carforeasy.cn/postgresql数据库使用-9645abe6.png)

如果需要进行更复杂的自定义查询，则可点击工具栏中```SQL```按钮进行自定义查询：
![](http://carforeasy.cn/postgresql数据库使用-1eaae68f.png)


## 参考链接

* [PostgreSQL新手入门](http://www.ruanyifeng.com/blog/2013/12/getting_started_with_postgresql.html)
* [pgAdmin III 使用图解](http://www.cnblogs.com/ExMan/p/9052186.html)
