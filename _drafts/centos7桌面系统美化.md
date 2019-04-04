---
layout: "post"
title: "Centos7桌面系统美化"
date: "2019-04-02 16:21"
---




二. 主题目录

首先弄明白3个目录

1. 存放主题的地方

/usr/share/themes (公共)    ~/.themes(用户)

2. 存放图标、光标样式的地方

/usr/share/icons

3.  存放扩展的地方

/usr/share/gnome-shell/extentions（公共） ~/.local/share/gnome-shell/extentions(用户)



1.隐藏任务栏

 删除/usr/share/gnome-shell/extensions/window-list@gnome-shell-extensions.gcampax.github.com 目录


隐藏顶栏

 需要修改三个文件，分别是/usr/share/gnome-shell/modes/classic.json，/usr/share/gnome-shell/theme/gnome-classic.css  和/usr/share/gnome-shell/theme/gnome-shell.css

+ /usr/share/gnome-shell/modes/classic.json

还是先备份，进入/usr/share/gnome-shell/modes/目录

cp classic.json classic.json.backup

修改内容，vi在命令模式下可以使用“/关键词“进行查找

vi classic.json

修改如下

 "panel":{ "left": [],
    "center": [],
     "right": []
   }

+ /usr/share/gnome-shell/theme/gnome-classic.css

再说一遍，先备份

修改如下
复制代码

#panel {

    background-color: #e9e9e9;

    background-gradient-direction: vertical;

    background-gradient-end: #d0d0d0;
    border-top-color: #666; /* we don't supportnon-uniform border-colors and
                               use the top bordercolor for any border, so we
                               need to set iteven if all we want is a bottom
                               border */
    border-bottom: 1px solid #666;
    app-icon-bottom-clip: 0px;
     color: transparent;
     /* hrm, still no multipoint gradients
      background-image: linear-gradient(left,rgba(255, 255, 255, 0),rgba(255, 255, 255, 1) 50%，rgba(255, 255, 255, 0)) !important;*/
   }

复制代码

+ /usr/share/gnome-shell/theme/gnome-shell.css
修改两处

最后一次强调，先备份
复制代码

//第一处
#panel {
    background-color:transparent;
    font-weight: bold;
    height: 0px;
   }
//第二处
 .panel-logo-icon {
  padding-right: .4em;
  icon-size: 1px;
  }

复制代码

原始代码

/usr/share/gnome-shell/modes/classic.json
复制代码

{
    "parentMode": "user",
    "stylesheetName": "gnome-classic.css",
    "enabledExtensions": ["apps-menu@gnome-shell-extensions.gcampax.github.com","places-menu@gnome-shell-extensions.gcampax.github.com","alternate-tab@gnome-shell-extensions.gcampax.github.com","launch-new-instance@gnome-shell-extensions.gcampax.github.com","window-list@gnome-shell-extensions.gcampax.github.com"],
    "panel": { "left": ["activities", "appMenu"],
               "center": [],
               "right": ["a11y", "keyboard", "dateMenu", "aggregateMenu"]
             }
}

复制代码

/usr/share/gnome-shell/theme/gnome-classic.css
复制代码

#panel {
    background-color: #e9e9e9;
    background-gradient-direction: vertical;
    background-gradient-end: #d0d0d0;
    border-top-color: #666; /* we don't support non-uniform border-colors and
                               use the top border color for any border, so we
                               need to set it even if all we want is a bottom
                               border */
    border-bottom: 1px solid #666;
    app-icon-bottom-clip: 0px;

/* hrm, still no multipoint gradients
    background-image: linear-gradient(left, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1) 50%, rgba(255, 255, 255, 0)) !important;*/
}

复制代码



/usr/share/gnome-shell/theme/gnome-shell.css

//这是我后来改的，原先的忘记备份了，可以正常显示，和原来差不多
#panel {
    background-color: #fff;
    font-weight: bold;
    height: 1.8em;
}

.panel-logo-icon {
  padding-right: .4em;
  icon-size: .4em;
}
