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
