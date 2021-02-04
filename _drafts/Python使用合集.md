[django使用xlwt导出excel文件实例代码](https://www.jb51.net/article/134523.htm)

## 源码安装Python

```
yum install -y zlib-devel bzip2-devel openssl-devel ncurses-devel sqlite-devel readline-devel tk-devel gcc make libffi-devel

./configure --prefix=/usr/local/python3
make && make install

ln -s /usr/local/python3/bin/python3.8 /usr/bin/python3

ln -s /usr/local/python3/bin/pip3 /usr/bin/pip3

```


## PIP使用

### 让PIP源使用国内镜像




对于Python开发用户来讲，PIP安装软件包是家常便饭。但国外的源下载速度实在太慢，浪费时间。而且经常出现下载后安装出错问题。所以把PIP安装源替换成国内镜像，可以大幅提升下载速度，还可以提高安装成功率。

- 国内源：

新版ubuntu要求使用https源，要注意。

清华：https://pypi.tuna.tsinghua.edu.cn/simple

阿里云：http://mirrors.aliyun.com/pypi/simple/

中国科技大学 https://pypi.mirrors.ustc.edu.cn/simple/

华中理工大学：http://pypi.hustunique.com/

山东理工大学：http://pypi.sdutlinux.org/

豆瓣：http://pypi.douban.com/simple/

- 临时使用：

可以在使用pip的时候加参数-i https://pypi.tuna.tsinghua.edu.cn/simple

例如：pip install -i https://pypi.tuna.tsinghua.edu.cn/simple pyspider，这样就会从清华这边的镜像去安装pyspider库。


- 永久修改，一劳永逸：

Linux下，修改 ~/.pip/pip.conf (没有就创建一个文件夹及文件。文件夹要加“.”，表示是隐藏文件夹)

内容如下：

```
[global]
index-url = https://pypi.tuna.tsinghua.edu.cn/simple
[install]
trusted-host=mirrors.aliyun.com
```

## pyenv使用


### pyenv tkinter问题

```
pyenv uninstall 3.6.8
※ env \
 PATH="$(brew --prefix tcl-tk)/bin:$PATH" \
 LDFLAGS="-L$(brew --prefix tcl-tk)/lib" \
 CPPFLAGS="-I$(brew --prefix tcl-tk)/include" \
 PKG_CONFIG_PATH="$(brew --prefix tcl-tk)/lib/pkgconfig" \
 CFLAGS="-I$(brew --prefix tcl-tk)/include" \
 PYTHON_CONFIGURE_OPTS="--with-tcltk-includes='-I$(brew --prefix tcl-tk)/include' --with-tcltk-libs='-L$(brew --prefix tcl-tk)/lib -ltcl8.6 -ltk8.6'" \
 pyenv install 3.6.8
```

验证结果：


```
 python -m tkinter -c "tkinter._test()"
```

### pyenv使用cache安装

将对应的包下载至~/.pyenv/cache，文件名不能错。

```
 ➜  cache mv ~/Downloads/Python-3.6.8.tar.xz ./
 ➜  cache env \
  PATH="$(brew --prefix tcl-tk)/bin:$PATH" \
  LDFLAGS="-L$(brew --prefix tcl-tk)/lib" \
  CPPFLAGS="-I$(brew --prefix tcl-tk)/include" \
  PKG_CONFIG_PATH="$(brew --prefix tcl-tk)/lib/pkgconfig" \
  CFLAGS="-I$(brew --prefix tcl-tk)/include" \
  PYTHON_CONFIGURE_OPTS="--with-tcltk-includes='-I$(brew --prefix tcl-tk)/include' --with-tcltk-libs='-L$(brew --prefix tcl-tk)/lib -ltcl8.6 -ltk8.6'" \
  pyenv install 3.6.8
 python-build: use openssl@1.1 from homebrew
 python-build: use readline from homebrew
 Installing Python-3.6.8...
 python-build: use readline from homebrew
 python-build: use zlib from xcode sdk
```


### 参考链接

[让PIP源使用国内镜像，提升下载速度和安装成功率。](https://www.cnblogs.com/microman/p/6107879.html)
