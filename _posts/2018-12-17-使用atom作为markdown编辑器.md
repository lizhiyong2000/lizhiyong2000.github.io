---
layout: "post"
title: "使用Atom作为Markdown编辑器"
date: "2018-12-17 16:15"
categories: Markdown
description: 使用Atom作为Markdown编辑器
tags: Markdown Atom
---

* content
{:toc}

<div class="postImg" style="background-image:url(http://carforeasy.cn/2018-9ed086df.png)"></div>
> “Atom是由GitHub开发的自由及开放源代码的文字与代码编辑器，支持macOS、Windows和Linux操作系统，本文将介绍如何用Atom作为Markdown编辑器。”





## Atom安装

下载安装Atom：<https://atom.io/>

Atom安装完成后，对Markdown的支持比较基础，在Atom庞大的插件库里有很多有用的小插件，可以用来提高我们的写作效率。以下插件列表是在比较了多个类似功能插件后的选择，可以根据个人喜好进行更换。

## 编辑器增强([markdown-writer](https://atom.io/packages/markdown-writer))

![](http://carforeasy.cn/2018-7afd4ee4.gif)

Markdown-Writer for Atom 是一款Markdown编辑器插件，其主要目的是：

    将 Atom 变成一个“更好”的 Markdown 编辑器；
    与各种流行的静态博客程序（如 Jekyll，Octopress，Hexo 等）良好协作，将 Atom 变成一个便捷的博客编写工具。

换句话说，这个工具首先是一个非常方便的 Markdown 编写工具，其次它还能与各种基于 Markdown 的静态博客程序紧密配合。

## 预览增强([markdown-preview-enhanced](https://atom.io/packages/markdown-preview-enhanced))

![](http://carforeasy.cn/2018-47fbbb15.png)
Atom自带的Markdown预览插件markdown-preview功能比较简单，Markdown Preview Enhanced 则提供了更多功能扩展，如滚动条同步, 数学公式支持, mermaid图形支持, PlantUML支持, pandoc支持, PDF导出, 代码块支持等，其功能与 Markdown Preview Plus类似。

## 图片插入([insert-img](https://atom.io/packages/insert-img))

insert-image插件提供截图自动保存并上传到七牛云的功能，在设置中设置好七牛云相关账号信息后，使用任一截图工具截取要插入的图，然后在文档中通过ctrl+alt+v插入图片，即可生成图片链接（可选择以本地相对路径插入或七牛云的链接插入）。
不过插件原作者已经很久没有维护了，上传功能稍微有些问题，修改后的版本放在了我的Github上：
[修改版本Github地址](https://github.com/lizhiyong2000/insert-img)
修正功能包括：

    1.修正qiniu sdk上传问题
    2.修正ubuntu下图片文件复制上传问题
    3.加入GIF上传支持

## 文件路径复制([tree-view-copy-project-path](https://atom.io/packages/tree-view-copy-project-path))

tree-view-copy-project-path插件提供从Atom的TreeView视图中获取文件路径的功能，配合insert-img插件，可以将TreeView视图中的图片文件直接复制文件名后通过ctrl+alt+v进行上传并插入。

![](http://carforeasy.cn/2018-09f2ca7f.gif)

## 参考链接

-   [使用Atom打造无懈可击的Markdown编辑器](https://www.cnblogs.com/fanzhidongyzby/p/6637084.html)
-   [Atom编辑markdown-图片上传](https://www.jianshu.com/p/fa30b769c5cc)
