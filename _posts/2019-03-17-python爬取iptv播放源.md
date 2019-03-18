---
layout: "post"
title: "Python爬取IPTV播放源"
date: "2019-03-17 21:31"
categories: "Python IPTV"
description: "Python爬取IPTV播放源"
tags: "Python IPTV"
---
* content
{:toc}:


<div class="postImg" style="background-image:url(http://carforeasy.cn/python爬取iptv播放源-aba03b31.png)"></div>
> “前些天入了个AppleTV 4K，通过苹果设备airplay播放视频自然不在话下，通过电视直播软件用AppleTV看高清电视也是可以的。iPlayTV是AppleTV上很好用的直播软件，以简单的网络地址直接导入直播源，就可以在AppleTV上看电视了。本文将介绍使用Python简单抓取直播源m3u地址，制作可以在iPlayTV中播放的频道列表。”




## Python爬取直播源介绍

### 1、Python爬虫介绍
爬虫：一段自动抓取互联网信息的程序，从互联网上抓取对于我们有价值的信息。
Python爬虫架构主要由五个部分组成，分别是调度器、URL管理器、网页下载器、网页解析器、应用数据。

+ 调度器：相当于一台电脑的CPU，主要负责调度URL管理器、下载器、解析器之间的协调工作。
+ URL管理器：包括待爬取的URL地址和已爬取的URL地址，防止重复抓取URL和循环抓取URL，实现URL管理器主要用三种方式，通过内存、数据库、缓存数据库来实现。
+ 网页下载器：通过传入一个URL地址来下载网页，将网页转换成一个字符串，网页下载器有urllib2（Python官方基础模块）包括需要登录、代理、和cookie，requests(第三方包)
+ 网页解析器：将一个网页字符串进行解析，可以按照我们的要求来提取出我们有用的信息，也可以根据DOM树的解析方式来解析。网页解析器有正则表达式（直观，将网页转成字符串通过模糊匹配的方式来提取有价值的信息，当文档比较复杂的时候，该方法提取数据的时候就会非常的困难）、html.parser（Python自带的）、beautifulsoup（第三方插件，可以使用Python自带的html.parser进行解析，也可以使用lxml进行解析，相对于其他几种来说要强大一些）、lxml（第三方插件，可以解析 xml 和 HTML），html.parser 和 beautifulsoup 以及 lxml 都是以 DOM 树的方式进行解析的。
+ 应用数据：爬取到的有价值数据，通常会保存到文件系统或数据库中。

以上是完整的python爬虫架构，本文使用的IPTV源爬虫比较简单，从一个源始URL开始爬取到电视频道的播放URL（m3u8地址)。

### 2、代码示例
以下代码将展示具体的爬虫模块代码。
+ 网页下载器：使urllib进行HTTP访问。
```python
def curl(self, url):
    """
    return content at url.
    return empty string if response raise an HTTPError (not found, 500...)
    """
    try:
        print("retrieving url... %s" % (url))
        # req = Request('%s://%s%s' % (self.scheme, self.domain, url))
        req = Request(url)

        req.add_header('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.i/605.1.15')

        response = urlopen(req, timeout=1)

        if response.url != req.full_url:
            return response.url
        return response.read().decode(response.headers.get_content_charset(), 'ignore')
    except Exception as e:
        print("error %s: %s" % (url, e))
        return ''
```
+ 网页解析器：使HTMLParser进行HTTP页面解析，获取页面中的频道URL地址。
```python
      class AhndHrefParser(HTMLParser):
            """
            Parser that extracts hrefs
            """
            is_parsing_url = False
            parsing_url = None

            url_channel_names = dict()

            def handle_starttag(self, tag, attrs):

                if tag == 'a':
                    dict_attrs = dict(attrs)
                    if dict_attrs.get('href'):
                        href = dict_attrs['href']
                        if href.startswith('aplayer.html'):
                            self.parsing_url = href
                            self.is_parsing_url = True
                            # self.hrefs.add(dict_attrs['href'])

            def handle_endtag(self, tag):
                self.parsing_url = None
                self.is_parsing_url = False

            def handle_data(self, data):
                if self.is_parsing_url:
                    print("channel:{}, url:{}".format(data, self.parsing_url))
                    self.url_channel_names[self.parsing_url] = data

```
+ 调度器、URL管理器：本爬虫仅对单一URL进行爬取，爬取其中的频道分类，频道列表数据
```python
def _crawl(self, url):
    html = self.curl(url)
    # self.set(url, html)

    parser = Iptv201GroupHrefParser()
    parser.feed(html)

    #
    # self.channel_map = parser.url_channel_names
    url_to_channel_map = {urllib.parse.urljoin(self.request_url, k): v for k, v in parser.url_channel_names.items()}

    for url, channel in url_to_channel_map.items():
        self.add_channel_group(channel)
        self._crawl_channel_group(channel, url)

    print("{} crawled".format(url))
```
+ 应用数据：爬取到的是频道和对应URL的dict数据，从而生产m3u8格式的playlist。
```python
def generate_me8u_file(channel_map):
    for channel, url in channel_map.items():
        print("{}:{}".format(channel, url))

    with open('playlist.m3u8', 'wb') as f:

        f.write(b'#EXTM3U\n\n')

        for channel, urls in channel_map.items():
            name = '#EXTINF:-1,' + channel + '\n'

            for url in urls:
                link = getm38u(url) + '\n\n'

                f.write(name.encode(encoding='utf8'))
                f.write(link.encode(encoding='utf8'))

```
## 爬取示例
###  1、[安徽农大源](http://itv.ahau.edu.cn/)
之前使用的北方交大IPTV源这几天不能访问了，搜索后发现了安徽农大源，使用爬虫爬下来，效果还不错
包括CCTV、各省卫视、地方台等，不过要注意这个源是IPv6的。
![](http://carforeasy.cn/python爬取iptv播放源-b2278936.png)

###  2、[IPTV201源](http://iptv201.com)
这个源包含不同运营商的IPTV源，频道分类也较多
+ 央视
![](http://carforeasy.cn/python爬取iptv播放源-7160ae0b.png)
+ 电影频道
![](http://carforeasy.cn/python爬取iptv播放源-37e07879.png)

## 参考链接
+ [Python 爬虫](https://blog.csdn.net/guoqiankunmiss/article/details/83929625)
+ [Building a simple crawler](https://www.debrice.com/building-a-simple-crawler/)
