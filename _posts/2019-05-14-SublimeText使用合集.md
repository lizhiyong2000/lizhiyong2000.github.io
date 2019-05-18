---
layout: "post"
title: "SublimeText使用合集"
date: "2019-05-14 15:35"
categories: SublimeText
description: SublimeText使用合集
tags: SublimeText
---

* content
{:toc}

<div class="postImg" style="background-image:url(http://carforeasy.cn/SublimeText使用合集-a066ebb0.png)"></div>
> “Sublime Text 是一个跨平台的HTML和文本编辑器，也是先进的代码编辑器，同时支持Windows、Linux、Mac OS X等操作系统。Sublime Text具有漂亮的用户界面和强大的功能，通过各种插件可以将Sublime Text打造成各种IDE，本文将收集各种Sublime Text的插件。”





## 1. 安装package control
https://packagecontrol.io/installation

下载地址：
https://packagecontrol.io/Package%20Control.sublime-package

添加channel文件：
http://static.bolin.site/channel_v3.json

## 2. 常用插件

### 2.1 通用插件
+ [SideBarEnhancements插件](https://github.com/titoBouzout/SideBarEnhancements)
    - 使用截图：
![](http://carforeasy.cn/SublimeText使用合集-f11a2371.png)

+ [AutoFileName](https://packagecontrol.io/packages/AutoFileName)
+ [Terminus插件](https://github.com/randy3k/Terminus)

    - 快捷键：
```json
[
    {
        "keys": ["ctrl+shift+t"], 
        "command": "toggle_terminus_panel"
    }
]
```

    - 使用截图：
![](http://carforeasy.cn/SublimeText使用合集-07c73ad4.gif)

+ [TrailingSpaces插件](https://github.com/SublimeText/TrailingSpaces)
+ [BracketHighlighter]()

### 2.2 HTML插件
+ [Emmet](https://github.com/sergeche/emmet-sublime)
+ [Tag插件](https://github.com/SublimeText/Tag)
+ [SublimeCodeIntel插件](https://github.com/SublimeCodeIntel/SublimeCodeIntel)
+ [LiveReload插件](https://github.com/alepez/LiveReload-sublimetext3)


### 2.3 JS插件
+ [JsFormat插件](https://github.com/jdc0589/JsFormat)
+ [Alignment]()
+ [Babel](https://packagecontrol.io/packages/Babel)
+ [DocBlockr](https://packagecontrol.io/packages/DocBlockr)

### 2.4 CSS插件
+ [ColorHighlight](https://github.com/Kronuz/ColorHighlight)
    - 使用截图：
![](http://carforeasy.cn/SublimeText使用合集-06d0be0e.png)


+ [CssComb插件](https://github.com/csscomb/csscomb.js)
+ [Autoprefixer插件](https://github.com/sindresorhus/sublime-autoprefixer)

### 2.2 Markdown插件
+ [MarkdownEditting](https://github.com/SublimeText-Markdown/MarkdownEditing)
    - 使用截图：
![](http://carforeasy.cn/SublimeText使用合集-0a1a397e.png)

+ [MarkdownPreview](https://github.com/facelessuser/MarkdownPreview)
    - 设置：
```
{
    "browser": "/Applications/Google Chrome.app",
    "enable_autoreload": true
}
```

    - 快捷键：
```json
[
    {
        "keys": ["alt+m"], 
        "command": "markdown_preview", 
        "args": {"target": "browser", "parser":"markdown"}
    }
]
```
    - 使用截图：
![](http://carforeasy.cn/SublimeText使用合集-5d052d7a.png)


## 参考链接
* [Sublime Text 3前端开发常用优秀插件介绍](https://www.cnblogs.com/hykun/p/sublimeText3.html)
* [Sublime插件：Git篇](https://www.jianshu.com/p/3a8555c273d8)
