

---
layout: "post"
title: "Hadoop3集群环境安装"
date: "2019-09-12 11:52"
categories: Hadoop
description: Hadoop3集群环境安装
tags: Hadoop
---

* content
{:toc}

<div class="postImg" style="background-image:url(http://carforeasy.cn/Hadoop3集群环境安装-a0c83b02.png)" ></div>
> “本文介绍Spark集群环境搭建，在之前安装好的Hadoop集群之上搭建Spark环境。”






## 1. 环境

### 1.1 设置主机名，配置hosts文件

spark-submit --class com.test.PeopleDataStatistics2 \
--master spark://master.test.com:7077 \
--driver-memory 2g \
--executor-memory 1g \
--total-executor-cores 4 \
target/spark-example-1.0-SNAPSHOT.jar hdfs://master.test.com:8020/sample_people_info.txt 1>result.txt 2>&1

```
[root@master spark]# su hdfs -c 'hdfs dfs -ls /sample_people_info'
Found 12 items
-rw-r--r--   2 lizhiyong supergroup          0 2019-09-17 15:01 /sample_people_info/_SUCCESS
-rw-r--r--   2 lizhiyong supergroup   52343381 2019-09-17 15:00 /sample_people_info/part-00000-8c0b1962-8f2b-444b-b20f-085f4cea33b9-c000.snappy.parquet
-rw-r--r--   2 lizhiyong supergroup   48659495 2019-09-17 15:00 /sample_people_info/part-00001-8c0b1962-8f2b-444b-b20f-085f4cea33b9-c000.snappy.parquet
-rw-r--r--   2 lizhiyong supergroup   48539321 2019-09-17 15:00 /sample_people_info/part-00002-8c0b1962-8f2b-444b-b20f-085f4cea33b9-c000.snappy.parquet
-rw-r--r--   2 lizhiyong supergroup   48539522 2019-09-17 15:00 /sample_people_info/part-00003-8c0b1962-8f2b-444b-b20f-085f4cea33b9-c000.snappy.parquet
-rw-r--r--   2 lizhiyong supergroup   48539392 2019-09-17 15:00 /sample_people_info/part-00004-8c0b1962-8f2b-444b-b20f-085f4cea33b9-c000.snappy.parquet
-rw-r--r--   2 lizhiyong supergroup   48541478 2019-09-17 15:00 /sample_people_info/part-00005-8c0b1962-8f2b-444b-b20f-085f4cea33b9-c000.snappy.parquet
-rw-r--r--   2 lizhiyong supergroup   48538826 2019-09-17 15:01 /sample_people_info/part-00006-8c0b1962-8f2b-444b-b20f-085f4cea33b9-c000.snappy.parquet
-rw-r--r--   2 lizhiyong supergroup   48537173 2019-09-17 15:01 /sample_people_info/part-00007-8c0b1962-8f2b-444b-b20f-085f4cea33b9-c000.snappy.parquet
-rw-r--r--   2 lizhiyong supergroup   48541052 2019-09-17 15:01 /sample_people_info/part-00008-8c0b1962-8f2b-444b-b20f-085f4cea33b9-c000.snappy.parquet
-rw-r--r--   2 lizhiyong supergroup   48539090 2019-09-17 15:01 /sample_people_info/part-00009-8c0b1962-8f2b-444b-b20f-085f4cea33b9-c000.snappy.parquet
-rw-r--r--   2 lizhiyong supergroup   53056415 2019-09-17 15:00 /sample_people_info/part-00010-8c0b1962-8f2b-444b-b20f-085f4cea33b9-c000.snappy.parquet
```


su hdfs -c 'hadoop fs -du -h -s /sample_people_info.txt'

su hdfs -c 'hadoop fs -du -h -s /sample_people_info'


```
[root@master spark]#  su hdfs -c 'hadoop fs -du -h -s /sample_people_info.txt'
1.4 G  2.8 G  /sample_people_info.txt
[root@master spark]# su hdfs -c 'hadoop fs -du -h -s /sample_people_info'
517.2 M  1.0 G  /sample_people_info
```


## 4. 参考链接

+ [使用 Scala 语言开发 Spark 应用程序](https://www.ibm.com/developerworks/cn/opensource/os-cn-spark-practice1/)
+ [使用 Kafka 和 Spark Streaming 构建实时数据处理系统](https://www.ibm.com/developerworks/cn/opensource/os-cn-spark-practice2/)
+ [使用 Spark SQL 对结构化数据进行统计分析](https://www.ibm.com/developerworks/cn/opensource/os-cn-spark-practice3/)
+ [Presto与Spark SQL查询性能比较](https://blog.csdn.net/yiifaa/article/details/82788727)
+ [Presto介绍](https://yq.aliyun.com/articles/25581)
+ [Presto实现原理和美团的使用实践](https://tech.meituan.com/2014/06/16/presto.html)
+ [Spark、Impala、Hive 对比测试](https://doc.yonyoucloud.com/doc/ae/attachments/920762/920761.pdf)
+
