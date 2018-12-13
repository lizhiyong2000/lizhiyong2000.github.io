---
layout: post
title: Linux vi/vim编辑器常用命令
categories: 工具
description: some word here
---
* content
{:toc}
<div class="postImg" style="background-image:url(https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/linux-vi1.jpg)"></div>
Linux发行版系统上都会默认内置vi编辑器，非常通用。很多软件的编辑接口都会默认调用vi；vi具有程序编辑的能力；vi程序简单，编辑速度相当快速。





## vi的三种模式

1. 命令模式： vi的默认进入状态(不可以输入字符，但可以对字符进行操作，复制，移动、删除等操作)
2. 输入模式： 输入字符状态(只可以输入和使用del和退格backspace键删除文字)
3. 末行模式 ：在命令模式下，用户按“:”键即可进入末行模式下，此时Vi会在显示窗口的最后一行显示一个“:”作为末行模式的提示符，等待用户输入命令。多数文件管理命令都是在此模式下执行的（如把编辑缓冲区的内容写到文件中等）

## vi的三种模式及各个模式之间的转换关系

一张图来说明一下，简洁明了：

![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/760572-20171029221448898-3300940.png)

## vi的启动和退出

```shell
#vi file 编辑file文件
#vi /tmp/file1 编辑指定目录/tem下的file1文件
```

* `:w` 保存修改
* `:q` 退出vi
* `:wq` 保存并退出
* `:q!` 强行退出 vi，不保存修改

## 一般模式常用操作

* `h`(或向左方向键) 光标左移一个字符
* `j(或向下方向键)` 光标下移一个字符
* `k(或向上方向键)` 光标上移一个字符
* `l(或向右方向键)` 光标右移一个字符

* `[Ctrl] + f` 屏幕向下移动一页（相当于Page Down键）
* `[Ctrl] + b` 屏幕向上移动一页（相当于Page Up键）

* `[0]或[Home]` 光标移动到当前行的最前面
* `[$]或[End]` 光标移动到当前行的末尾

* `G` 光标移动到文件的最后一行（第一个字符处）
* `nG` n为数字（下同），移动到当前文件中第n行
* `gg` 移动到文件的第一行，相当于”1G”
* `n[Enter]` 光标向下移动n行

* `/word` 在文件中查找内容为word的字符串（向下查找）
* `?word` 在文件中查找内容为word的字符串（向上查找）
* `[n]` 表示重复查找动作，即查找下一个
* `[N]` 反向查找下一个
* `:n1,n2s/word1/word2/g` n1、n2为数字，在第n1行到第n2行之间查找word1字符串，并将其替换成word2
* `:1,s/word1/word2/g`从第一行（第n行同理）到最后一行查找word1注册，并将其替换成word2`:1,s/word1/word2/gc` 功能同上，只不过每次替换时都会让用户确认

* `x,X` x为向后删除一个字符，相当于[Delete]，X为向前删除一个字符，相当于[Backspace]
* `dd` 删除光标所在的一整行
* `ndd` 删除光标所在的向下n行

* `yy` 复制光标所在的那一行
* `nyy` 复制光标所在的向下n行
* `p,P` p为将已经复制的数据在光标下一行粘贴；P为将已经复制的数据在光标上一行粘贴

* `u` 撤消上一个操作
* `[Ctrl] + r` 多次撤消
* `.` 这是小数点键，重复上一个操作

## 一般模式切换到编辑模式的操作

1. 进入插入模式（６个命令）
* `i` 从目前光标所在处插入
* `I` 从目前光标
* `a` 从当前光标所在的下一个字符处开始插入
* `A` 从光标所在行的最后一个字符处开始插入
* `o` 英文小写字母o，在目前光标所在行的下一行处插入新的一行并开始插入
* `O` 英文大写字母O，在目前光标所在行的上一行处插入新的一行并开始插入
2. 进入替换模式（2个命令）
* `r` 只会替换光标所在的那一个字符一次
* `R` 会一直替换光标所在字符，直到按下[ESC]键为止
* `[ESC]` 退出编辑模式回到一般模式

## 一般模式切换到命令行模式

* `:w` 保存文件
* `:w!` 若文件为只读，强制保存文件
* `:q` 离开vi
* `:q!` 不保存强制离开vi
* `:wq` 保存后离开
* `:wq!` 强制保存后离开
* `:! command` 暂时离开vi到命令行下执行一个命令后的显示结果
* `:set nu` 显示行号
* `:set nonu` 取消显示行号
* `:w newfile` 另存为
* `:set fileencoding` 查看当前文件编码格式
* `:set fileencoding=utf-8` 设置当前文件编码格式为utf-8，也可以设置成其他编码格式
* `:set fileformat` 查看当前文件的断行格式（dos\windows,unix或macintosh）
* `:set fileformat=unix` 将当前文件的断行格式设置为unix格式

## 文件恢复模式

* `[O]pen Read-Only` 以只读方式打开文件
* `[E]dit anyway` 用正常方式打开文件，不会载入暂存文件内容
* `[R]ecover` 加载暂存文件内容
* `[D]elete it` 用正常方式打开文件并删除暂存文件
* `[Q]uit` 按下q就离开vi，不进行其他操作
* `[A]bort` 与quit功能类似

## 块选择（一般模式下用）

* `v,V` v:将光标经过的地方反白选择；V：将光标经过的行反白选择
* `[Ctrl] + v` 块选择，可用长方形的方式选择文本
* `y` 将反白的地方复制到剪贴板
* `d` 将反白的内容删除

## 多文件编辑

* `vim file1 file2` 同时打开两个文件
* `:n` 编辑下一个文件
* `:N` 编辑上一个文件
* `:files` 列出当前用vim打开的所有文件

## 多窗口功能

* `:sp [filename]` 打开一个新窗口，显示新文件，若只输入:sp，则两窗口显示同一个文件
* `[Ctrl] + w + j` 光标移动到下方窗口
* `[Ctrl] + w + k` 光标移动到上方窗口
* `[Ctrl] + w + q` 离开当前窗口

## vim配置文件

vim的配置文件为`/etc/vimrc`，但一般不建议直接修改这个文件，而是在用户根目录下创建一个新的隐藏文件： `vim ~/.vimrc`

然后编辑这个文件，常用的配置如下：
* bash
* “双引号后面的内容为注释
* set nu “显示行号
* set hlsearch “查找的字符串反白显示
* set backspace=2 “可随时用退格键进行删除
* set autoindent “自动缩排
* set ruler “在最下方一行显示状态
* set showmode “在左下角显示模式
* set bg=dark “显示不同的底色，还可以为light
* syntax on “语法检验，颜色显示

## Dos与Linux的断行字符（文件转化）

* dos2unix [-kn] file [newfile]
* unix2dos [-kn] file [newfile]
* -k:保留该文件原本的mtime时间格式
* -n:保留原本旧文件，将转换后的内容输出到新文件

## 语系编码转化

* iconv –list 列出iconv支持的语系编码
* iconv -f 原本编码 -t 新编码 filename [-o new file]
* -f:from,后接原本的编码格式
* -t:to,后接新编码格式
* -o file:可选参数，建立新文件

例：将/tmp/a.txt从big5编码格式转换成utf8编码格式：
iconv -f big5 -t utf8 /tmp/a.txt -o new.txt
