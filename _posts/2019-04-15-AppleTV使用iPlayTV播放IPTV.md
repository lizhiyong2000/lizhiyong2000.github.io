---
layout: "post"
title: "AppleTV使用iPlayTV播放IPTV"
date: "2019-04-14 13:48"
categories: IPTV工具
description: AppleTV使用iPlayTV播放IPTV
tags: AppleTV iPlayTV
---

* content
{:toc}

<div class="postImg" style="background-image:url(http://carforeasy.cn/AppleTV使用iPlayTV播放IPTV-0b5755d7.png)"></div>
> “iPlayTV是至今为止APPLE TV上最好用的直播软件，双击触摸版换台，以简单的网络地址直接导入直播源，简直就是神一样的软件，本文介绍一下如何使用iPlayTV播放IPTV电视节目。”




## iPlayTV安装
iPlayTV安装是Apple TV上测试过的较为完美的看电视直播的应用，可以导入m3u8格式的电视直播链接，使用起来非常方便，虽然是一款收费软件，但是绝对是物有所值的。安装iPlayTV需要先申请非大陆地区的Apple ID账号，之后在Apple Store中搜索下载即可。
![](http://carforeasy.cn/AppleTV使用iPlayTV播放IPTV-001b3e61.png)

## 导入playlist文件
iPlayTV电视节目的编排是以播放列表方式出现的，将多个电视节目的URL填入播放列表文件中制作成播放列表，导入到iPlayTV中后就会获得频道列表，之后iPlayTV通过解析频道URL中获取的具体内容进行播放。


以[中央电视台playlist](https://raw.githubusercontent.com/lizhiyong2000/stream-tools/master/resource/%E4%B8%AD%E5%A4%AE%E7%94%B5%E8%A7%86%E5%8F%B0-playlist.m3u8)为例，其格式如下，每一行都是一个频道URL。


```ini
#EXTM3U

#EXTINF:-1,CCTV5体育频道
http://sdwd.chinashadt.com:1935/live/cctv5.stream/playlist.m3u8

#EXTINF:-1,CCTV5体育频道
http://183.230.80.60/000000001000/reallive-cctv5/1.m3u8

#EXTINF:-1,CCTV5体育频道
http://hnxy.chinashadt.com:1936/live/tv3.stream_aac/playlist.m3u8

#EXTINF:-1,CCTV老故事
http://223.110.245.145/ott.js.chinamobile.com/PLTV/3/224/3221227043/index.m3u8

#EXTINF:-1,CGTN NEWS
http://223.110.245.149/ott.js.chinamobile.com/PLTV/3/224/3221225917/index.m3u8

#EXTINF:-1,CCTV发现之旅
http://223.110.245.139:80/PLTV/4/224/3221227046/index.m3u8

#EXTINF:-1,CCTV世界地理
http://223.110.243.168/PLTV/2510088/224/3221227341/1.m3u8

#EXTINF:-1,CCTV世界地理
http://223.110.243.144/PLTV/2510088/224/3221227341/1.m3u8

#EXTINF:-1,CCTV高尔夫网球
http://223.110.245.151/ott.js.chinamobile.com/PLTV/3/224/3221226420/index.m3u8

#EXTINF:-1,CCTV第一剧场
http://223.110.243.168/PLTV/2510088/224/3221227340/1.m3u8

#EXTINF:-1,CCTV第一剧场
http://223.110.243.170/PLTV/2510088/224/3221227340/1.m3u8

#EXTINF:-1,CCTV怀旧剧场
http://223.110.243.170/PLTV/2510088/224/3221227346/1.m3u8

#EXTINF:-1,CCTV风云剧场
http://223.110.243.168/PLTV/2510088/224/3221227343/1.m3u8

#EXTINF:-1,CCTV电视指南
http://223.110.243.168/PLTV/2510088/224/3221227337/1.m3u8

#EXTINF:-1,CGTN记录
http://223.110.243.168/PLTV/2510088/224/3221227309/1.m3u8

#EXTINF:-1,CGTN记录
http://223.110.243.172/PLTV/2510088/224/3221227309/1.m3u8

#EXTINF:-1,CGTN记录
http://183.207.249.13/PLTV/3/224/3221225572/index.m3u8

#EXTINF:-1,CCTV风云音乐
http://223.110.243.134/PLTV/2510088/224/3221227391/1.m3u8

#EXTINF:-1,CCTV风云足球
http://223.110.243.168/PLTV/2510088/224/3221227344/1.m3u8

#EXTINF:-1,CCTV风云足球
http://223.110.243.170/PLTV/2510088/224/3221227344/1.m3u8

#EXTINF:-1,CCTV5+体育赛事
http://111.20.33.72/PLTV/88888888/224/3221225534/index.m3u8

#EXTINF:-1,CCTV5+体育赛事
http://111.20.33.69/PLTV/88888888/224/3221225761/index.m3u8

#EXTINF:-1,CGTN阿拉伯语
http://live.cgtn.com/cctv-a.m3u8

#EXTINF:-1,CCTV15音乐频道
http://111.44.138.251:16415/contents39/live/CHANNEL15e09a88ba1a495b852a487d15bb0b15/HD_1885203450662406375/live.m3u8

#EXTINF:-1,CCTV14少儿频道
http://223.110.243.140/PLTV/2510088/224/3221227247/1.m3u8

#EXTINF:-1,CCTV13新闻频道
http://223.110.243.150/PLTV/2/224/3221226021/2.m3u8

#EXTINF:-1,CCTV13新闻频道
http://223.110.243.155:80/PLTV/3/224/3221225560/index.m3u8

#EXTINF:-1,CCTV12社会与法
http://183.207.249.6/PLTV/3/224/3221225556/index.m3u8

#EXTINF:-1,CCTV12社会与法
http://223.110.243.155:80/PLTV/3/224/3221227406/index.m3u8

#EXTINF:-1,CCTV11戏曲频道
http://223.110.243.155:80/PLTV/3/224/3221225552/index.m3u8

#EXTINF:-1,CCTV11戏曲频道
http://111.44.138.251:16415/contents39/live/CHANNELc5821079b2a84b3e8b4ef0a02daa42d2/HD_4159248888282082790/live.m3u8

#EXTINF:-1,CCTV9纪录频道
http://223.110.243.155:80/PLTV/3/224/3221225532/index.m3u8

#EXTINF:-1,CCTV8电视剧频道
http://223.110.243.155:80/PLTV/3/224/3221227204/index.m3u8

#EXTINF:-1,CCTV8电视剧频道
http://223.110.243.155:80/PLTV/3/224/3221227205/index.m3u8

#EXTINF:-1,CCTV7军事农业
http://223.110.243.136/PLTV/2510088/224/3221227142/1.m3u8

#EXTINF:-1,CCTV6电影频道
http://223.110.245.172/PLTV/3/224/3221225548/index.m3u8

#EXTINF:-1,CCTV6电影频道
http://223.110.245.159/ott.js.chinamobile.com/PLTV/3/224/3221225548/index.m3u8

#EXTINF:-1,CCTV6电影频道
http://223.110.245.139/ott.js.chinamobile.com/PLTV/3/224/3221227209/index.m3u8

#EXTINF:-1,CCTV6电影频道
http://223.110.245.159/ott.js.chinamobile.com/PLTV/3/224/3221227209/index.m3u8

#EXTINF:-1,CCTV6电影频道
http://223.110.245.159/ott.js.chinamobile.com/PLTV/3/224/3221227301/index.m3u8

#EXTINF:-1,CCTV4中文国际
http://223.110.245.170/ott.js.chinamobile.com/PLTV/3/224/3221225534/index.m3u8

#EXTINF:-1,CCTV4中文国际
http://223.110.243.138/PLTV/2510088/224/3221227162/1.m3u8

#EXTINF:-1,CCTV4中文国际
http://223.110.243.172/PLTV/2510088/224/3221227162/1.m3u8

#EXTINF:-1,CCTV3综艺频道
http://223.110.245.170/ott.js.chinamobile.com/PLTV/3/224/3221225588/index.m3u8

#EXTINF:-1,CCTV3综艺频道
http://223.110.245.170/ott.js.chinamobile.com/PLTV/3/224/3221227206/index.m3u8

#EXTINF:-1,CCTV2财经频道
http://223.110.245.170/ott.js.chinamobile.com/PLTV/3/224/3221227207/index.m3u8

#EXTINF:-1,CCTV2财经频道
http://223.110.245.170/ott.js.chinamobile.com/PLTV/3/224/3221227412/index.m3u8

#EXTINF:-1,CCTV1综合频道
http://223.110.245.159/ott.js.chinamobile.com/PLTV/3/224/3221225852/index.m3u8

#EXTINF:-1,CCTV1综合频道
http://223.110.243.138/PLTV/2510088/224/3221227177/1.m3u8

#EXTINF:-1,CCTV1综合频道
http://223.99.186.132:6610/shandong_cabletv.live.zte.com/223.99.253.7:8081/00/SNM/CHANNEL00000701/index.m3u8

#EXTINF:-1,CCTV1综合频道
http://223.99.186.132:6610/shandong_cabletv.live.zte.com/223.99.253.7:8081/00/SNM/CHANNEL00000311/index.m3u8

#EXTINF:-1,CCTV1综合频道
http://35848.hlsplay.aodianyun.com/guangdianyun_35848/tv_channel_352.m3u8

```
添加playlist到iPlayTV有添加远程playlist和本地playlist两种方式。




### 添加远程源地址

![](http://carforeasy.cn/AppleTV使用iPlayTV播放IPTV-79ec5bb2.png)
打开iPlayTV，点击+号，选择 Remote Playlist File，然后第一行输入一个名字，第二行输入直播源的HTTP地址，第三行不用管，直接点 save 即可，并且上面显示的5DAY、7DAY是指自动刷新的时间，如果你选默认的5天，也就是说五天后，iPlayTV 会自动再从提供的URL网络地址再获取一次更新后的源。

![](http://carforeasy.cn/AppleTV使用iPlayTV播放IPTV-c8e4be62.png)

![](http://carforeasy.cn/AppleTV使用iPlayTV播放IPTV-13b38ba4.png)

### 添加本地源地址
添加本地源地址与远程的其实是一样的，只是添加本地源时使用的URL是本地文件的URL而已。由于本地文件URL无法直接填写，需要使用提供的上传功能获取本地播放列表文件的URL。
由于使用的是本地文件作为播放列表，里面的播放源是没法更新的，需要更新的话需要手动修改后重新导入。
![](http://carforeasy.cn/AppleTV使用iPlayTV播放IPTV-0f232a5c.png)

![](http://carforeasy.cn/AppleTV使用iPlayTV播放IPTV-64fdb764.png)


### 播放列表导入结果
播放列表导入完成后就能在channels中看到频道列表了：
![](http://carforeasy.cn/AppleTV使用iPlayTV播放IPTV-7d7570d7.png)

![](http://carforeasy.cn/AppleTV使用iPlayTV播放IPTV-f3a900f1.png)

![](http://carforeasy.cn/AppleTV使用iPlayTV播放IPTV-5c85fc2b.png)

如果需要获取最新的播放列表进行导入，可以关注github工程：
[https://github.com/lizhiyong2000/stream-tools](https://github.com/lizhiyong2000/stream-tools)

使用工程下resource目录下的playlist文件进行导入。

>注意：导入的时候要使用文件的raw地址进行导入，如：
https://github.com/lizhiyong2000/stream-tools/blob/master/resource/%E4%B8%AD%E5%A4%AE%E7%94%B5%E8%A7%86%E5%8F%B0-playlist.m3u8
对应的raw地址为：
https://raw.githubusercontent.com/lizhiyong2000/stream-tools/master/resource/%E4%B8%AD%E5%A4%AE%E7%94%B5%E8%A7%86%E5%8F%B0-playlist.m3u8



## 屏幕截图

播放列表导入后，点击频道，就可以进行观看了。

![](http://carforeasy.cn/AppleTV使用iPlayTV播放IPTV-1c71e1fa.png)

![](http://carforeasy.cn/AppleTV使用iPlayTV播放IPTV-16b9172d.png)

![](http://carforeasy.cn/AppleTV使用iPlayTV播放IPTV-08b551ea.png)
![](http://carforeasy.cn/AppleTV使用iPlayTV播放IPTV-49283cbe.png)

如果碰到频道无法打开，或者播放效果不好，可以多准备点播放列表作为备份。

后续github工程将提供playlist的不断更新：
[https://github.com/lizhiyong2000/stream-tools](https://github.com/lizhiyong2000/stream-tools)

## 参考链接

+ [AppleTV 4K开箱与日常（懒喵、infuse、iPlayTV）使用笔记](http://koolshare.cn/thread-154300-1-1.html)
