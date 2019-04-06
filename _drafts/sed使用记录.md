---
layout: "post"
title: "Sed使用记录"
date: "2019-02-15 14:35"
---


### 替换跨行内容

```sed
:t
/\/\*/,/\*\// {
/\*\//!{ $!{ N; bt } }
s/\/\*.*\*\///;
}
```


## 参考链接
* [用sed替换跨行内容](http://www.fwolf.com/blog/post/346)
