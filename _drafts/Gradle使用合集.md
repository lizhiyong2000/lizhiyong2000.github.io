
+ gradle全局代理
~/.gradle/gradle.properties

systemProp.https.proxyPort=1080
systemProp.http.proxyHost=localhost
systemProp.https.proxyHost=localhost
systemProp.http.proxyPort=1080


+ gradle jar存储目录

～/.gradle/caches/modules-2/files-2.1


```
(base) lizhiyongs-iMac:6.0.5 lizhiyong$ cd /Users/lizhiyong/.gradle/caches/modules-2/files-2.1
(base) lizhiyongs-iMac:files-2.1 lizhiyong$ ll
total 0
drwxr-xr-x   3 lizhiyong  staff   102 Sep  4 09:15 cglib
drwxr-xr-x   3 lizhiyong  staff   102 Sep  4 09:16 com.fasterxml
drwxr-xr-x   5 lizhiyong  staff   170 Oct 12 16:57 com.fasterxml.jackson
drwxr-xr-x   5 lizhiyong  staff   170 Sep  4 09:15 com.fasterxml.jackson.core
drwxr-xr-x   5 lizhiyong  staff   170 Sep  4 09:15 com.fasterxml.jackson.dataformat
drwxr-xr-x   6 lizhiyong  staff   204 Sep  4 09:16 com.fasterxml.jackson.datatype
drwxr-xr-x   5 lizhiyong  staff   170 Sep  4 09:15 com.fasterxml.jackson.jaxrs
drwxr-xr-x   6 lizhiyong  staff   204 Sep  4 09:16 com.fasterxml.jackson.module
drwxr-xr-x   3 lizhiyong  staff   102 Sep  4 09:15 com.fasterxml.woodstox
drwxr-xr-x   4 lizhiyong  staff   136 Sep  4 09:15 com.github.ben-manes.caffeine
drwxr-xr-x   3 lizhiyong  staff   102 Sep  4 09:15 com.github.lalyos
```
