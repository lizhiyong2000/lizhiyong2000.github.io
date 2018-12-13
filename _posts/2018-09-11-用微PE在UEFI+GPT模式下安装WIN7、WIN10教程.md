---
layout: post
title: 用微PE在UEFI+GPT模式下安装WIN7、WIN10教程
categories: 工具
description: 用微PE在UEFI+GPT模式下安装WIN7、WIN10教程
tags: windows
---
* content
{:toc}
<div class="postImg" style="background-image:url(https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/toge_excel1066.png)"></div>
本教程一共制作了在UFEI+GPT模式下安装GHO封装格式的64位WIN7系统、WIM封装格式的64位WIN7系统和ISO格式的MSDN原版镜像64位WIn10系统。
这3种文件格式的系统镜像基本包含了主流镜像文件，安装方法基本相同，都是从U盘启动进PE，使用CGI备份还原工具安装系统到GPT磁盘上，建立UEFI引导。
其中ISO原版镜像和WIN封装镜像可自动建立引导，GHO封装格式镜像须手动修复UEFI引导。



## 二、 设置主板从U盘启动
开机，在主板logo界面按“热键”如：Esc、F2、F12等键，进入开机启动项选择界面。

选择U盘进入PE，我的是UEFI：SanDisk
![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/5319583c269759ee4dc10c76b5fb43166f22dfda.jpg)
![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/d161b0004a90f603317df0fa3e12b31bb251eda6.jpg)
![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/d1f06a2662d0f703f8bafa610ffa513d2797c563.jpg.png)

## 三、 将硬盘转转换成GPT模式，并分区，PE下完成
使用GiskGenius，选择要装系统的硬盘，右键快速分区
![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/f74c27dca3cc7cd9390a5a643e01213fb90e9148.jpg.png)

选择分区表类型为GUID，创建ESP分区勾上，创建MSR分区非必要，分区数目及分区大小根据自己的硬盘大小和个人习惯决定，建议系统分区大于50G，对齐分区是4K对齐，固态硬盘勾上，机械硬盘非必要。

![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/286ea0763912b31bf5f6a2948118367ad8b4e1dd.jpg.png)

选择好了之后确定。等待软件操作。。。。。

软件操作结束之后，就创建了GPT模式下的硬盘结构，FAT16的ESP分区和NTFS格式的主分区。在这里观察各个盘的盘符，特别是ESP分区的盘符，我这里是F：
![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/c6f5f4fbaf51f3de792ed6d993eef01f382979d7.jpg.png)
![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/29ed05f2d7ca7bcb74e2a892b9096b63f424a8d2.jpg.png)

> 1. 微PE可以算作商业性的PE工具，为了避免侵权，内置的是免费版的软件（普通版、低版本号的软件）。 普通版的DiskGenius想将MBR磁盘模式改为GUID（GPT）模式，需要删除现有磁盘分区（会删除磁盘上的文件），然后重新建立GUID分区表格式的磁盘分区。
> 2. 想将MBR模式无损（不删除文件）转换成为GPT模式，可以使用傲梅分区助手等工具。或者自行下载其他磁盘工具放在U盘数据区，直接使用，比如DiskGenius专业版（付费软件，微PE未内置），达到无损分区的目的。

## 四、 安装Windows系统，PE下完成。
在PE里打开CGI备份还原程序
![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/ebb2f1188618367a92eb116029738bd4b21ce515.jpg.png)
选择还原分区模式，选择好待还原的分区（系统安装区），比如C：盘，选择好镜像文件，这里我有5个镜像。分别是我上面提到的3个镜像和微PE的2个镜像。我们是要安装操作系统，故选择上面提到的那3个镜像的其中一个。
以下分开说明3种格式系统的安装。

### 4.1、安装GHO封装格式的64位WIN7系统（选择其他格式镜像略过此步）
选择GHO镜像，恢复到C盘，点击执行，弹出对话框，单击确定
![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/286ea0763912b31bf4bba3948118367ad8b4e198.jpg.png)
![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/1421dc638535e5dd24dacb6271c6a7efcc1b62f9.jpg.png)
开始执行系统安装，该过程自动进行，直至恢复完成（系统安装到C盘完成）。
之后是修复UEFI引导，请看步骤5.2
![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/f82f75d88d1001e98c0f7db2bf0e7bec55e79744.jpg.png)

### 4.2、安装WIM封装格式的64位WIN7系统（选择其他格式镜像略过此步）
选择WIM格式镜像，恢复到C盘，点击执行，弹出对话框
![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/2b2c32c69f3df8dc2d42e62cca11728b46102870.jpg.png)
![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/4bdb5a42fbf2b2110d7fecf3cd8065380dd78e1a.jpg.png)
![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/014cad0e4bfbfbed86255fc27ff0f736aec31f76.jpg.png)
勾选不保留目标分区的原有文件（即格式化C盘），勾选修复引导，单击确定，系统装自动开始执行，直至完成（系统安装到C盘完成）。
![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/1421dc638535e5dd25fecc6271c6a7efcc1b62a5.jpg.png)
![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/551712d4ad6eddc441cadc463edbb6fd53663345.jpg.png)
![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/c9bbd808b3de9c82308090326b81800a1bd8438e.jpg.png)
由于WIM格式镜像还原时会自动修复UEFI引导，故等还原完成即后重启进入系统。
重启进入系统，第一次开机时会配置系统，过程全自动。具体请看步骤6.2

### 4.3、安装ISO格式的MSDN原版镜像64位WIn10系统（选择其他格式镜像略过此步）
选择ISO格式镜像，恢复到C盘，点击执行，弹出对话框
![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/8fe43cfbe6cd7b89824e513e082442a7d8330e54.jpg.png)
![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/e7d2556134a85edf58bb959e4e540923dc5475b8.jpg.png)
![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/e5ea6262f6246b608c3fd9c9ecf81a4c500fa2ba.jpg.png)
勾选不保留目标分区的原有文件（即格式化C盘），勾选修复引导，单击确定，系统装自动开始执行，直至完成（系统安装到C盘完成）。
![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/acd5a6c279310a558178b549b04543a983261016.jpg.png)
![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/201703d062d9f2d309ba4f52aeec8a136127cccc.jpg.png)
![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/90f040550923dd548cd6ccd5d609b3de9e8248ce.jpg.png)
![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/3080ff256b600c33063cb5751d4c510fd8f9a12e.jpg.png)
由于ISO格式的MSDN原版镜像还原时会自动修复UEFI引导，故等还原完成即后重启进入系统。
重启进入系统，第一次开机时会配置系统，过程基本全自动，需手动点击下一步等操作。
具体请看步骤6.3

## 五、建立UEFI引导
### 5.1、WIM格式镜像和ISO格式MSDN原版镜像引导修复
WIM格式镜像和ISO格式MSDN原版镜像在使用CGI备份还原时会自动修复UEFI引导。故此步骤可跳过，直接开机进入系统。第一次开机时会配置系统，过程全自动。
引导可自动修复的前提是：
1. ESP分区存在并有盘符
2. 64位WIN8PE环境（微PE64位满足该条件）
3. 镜像文件中的boot文件完好无损。

### 5.2、GHO格式镜像的UEFI引导修复
GHO格式镜像的UEFI引导需要手动修复，手动修复的方法是使用CMD命令。
点击“开始——运行——输入cmd，回车”，调出命令行菜单

在命令行菜单中输入 `bcdboot C:\windows /s F: /f UEFI /l zh-cn` 回车。

命令解释：其中C:是指系统所在的分区的盘符，F:是指ESP分区的盘符。根据自己的机器显示的盘符替换。
![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/58ac71f1f736afc356d155d8b419ebc4b5451295.jpg.png)
出现以上提示说明UEFI引导修复成功。

至此，GHO系统已安装完毕，重启进入系统，第一次开机时会配置系统，过程全自动。步骤请看6.1

## 对于“修复UEFI引导的前提”的解释：
1. ESP分区存在且有盘符
* ESP分区存在，是为了在目标区域（ESP分区，本质上是一个FAT16格式的分区）创建UEFI启动引导文件，有盘符，是为了让目标区域被系统识别。
2. 64位WIN8PE环境
* UEFI启动引导文件中有一个叫bootx64.efi的文件，中文习惯称作计算机默认引导文件。该文件可以由任何有效的efi文件改名得到，一般获取途径是用bootmgfw.efi改名得到。bootmgfw.efi的中文名叫Windows默认引导文件。
根据实践发现，要想通过UEFI启动引导进入Windows系统（WIN7、WIN8、WIN10），必须使用64位WIN8以上系统的bootx64.efi文件和bootmgfw.efi文件。64位WIN7系统里面的文件无法引导UEFI启动计算机，至于原版镜像点击setup安装系统之后又可以引导成功，我也不清楚。
3. 系统boot文件完好无损
* 这个好理解，UEFI说白了只是一种启动引导方式，如果系统本身的启动文件有错误，启动不了也很正常。就像想进门叫锁匠配钥匙，拿一把坏掉的锁去配钥匙，钥匙能配成功吗。。。。

## 分辨主板是Legacy或UEFI模式

1. 在有操作系统的情况下，按Windows+R键，呼出运行对话框。在框内输入【msinfo32】，回车。查看系统信息。如图：
![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/e9184a176d224f4a5790105500f790529922d14b.jpg.png)
2. 进入主板的BIOS Setup页面查看。

## 查看磁盘分区表类型

1. 按Windows+R，呼出运行对话框。在框内输入【diskpart】，回车。调出diskpart命令提示行对话框。
在命令提示行中输入【list disk】，回车。就可以看到如图所示：
![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/adc762610c3387446e3f433a580fd9f9d52aa0e6.jpg-2.png)
如果硬盘在GPT那栏打有星号，证明该硬盘是GPT类型，反之，没有星号就是MBR。
2. 用各种磁盘分区软件查看。
打开磁盘分区软件，例如：diskgenius。选择要查看的硬盘，观察软件界面的文字，即可以看到。
