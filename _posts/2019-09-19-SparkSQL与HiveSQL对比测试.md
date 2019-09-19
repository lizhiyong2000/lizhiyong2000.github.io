---
layout: "post"
title: "SparkSQL与HiveSQL对比测试"
date: "2019-09-19 18:52"
categories: Hadoop
description: SparkSQL与HiveSQL对比测试
tags: SparkSQL Hive
---

* content
{:toc}

<div class="postImg" style="background-image:url(http://carforeasy.cn/SparkSQL与HiveSQL对比测试-881741ef.png)" ></div>
> “Spark为结构化数据处理引入了一个称为Spark SQL的编程模块。它提供了一个称为DataFrame（数据框）的编程抽象，DF的底层仍然是RDD，并且可以充当分布式SQL查询引擎。本文将对相同的数据使用Spark SQL和Hive SQL进行简单的对比测试。”





## 1. 环境准备

### 1.1 测试环境

环境  |   版本|
--   |  --- |--
Hive |  2.3.0 |  
Spark|  2.4.4 |  

## 2 单表测试

### 2.1 单表数据

+ 数据示例
本案例中，我们将分析包含1亿条人口信息的结构化数据。数据包含三列，第一列是 ID，第二列是性别信息 (F -> 女，M -> 男)，第三列是人口的身高信息，单位是 cm。

  ```
  1 M 212
  2 M 140
  3 F 131
  4 F 182
  5 M 167
  6 M 163
  7 M 130
  8 M 153
  9 M 186
  10 M 210
  ```

+ 数据生成代码（text格式）

```scala
import java.io.{File, FileWriter}

import scala.util.Random

object PeopleInfoFileGenerator {
  def main(args: Array[String]) {
    val writer = new FileWriter(new File("/Users/lizhiyong/sample_people_info.txt"), false)
    val rand = new Random()
    for (i <- 1 to 100000000) {
      var height = rand.nextInt(220)
      if (height < 50) {
        height = height + 50
      }
      var gender = getRandomGender
      if (height < 100 && gender == "M")
        height = height + 100
      if (height < 100 && gender == "F")
        height = height + 50
      writer.write(i + " " + getRandomGender + " " + height)
      writer.write(System.getProperty("line.separator"))
    }
    writer.flush()
    writer.close()
    println("People Information File generated successfully.")
  }

  def getRandomGender(): String = {
    val rand = new Random()
    val randNum = rand.nextInt(2) + 1
    if (randNum % 2 == 0) {
      "M"
    } else {
      "F"
    }
  }
}
```

上传至HDFS：

```shell
su hdfs -c 'hadoop fs -copyFromLocal /root/test/sample_people_info.txt /sample_people_info.txt'
```


+ 转换为Parquet格式
数据生成后将text文件上传至HDFS，然后使用Spark程序将text文件转换为Parquet格式

```scala
package com.test

import org.apache.spark.rdd.RDD
import org.apache.spark.sql.types.{StringType, StructField, StructType}
import org.apache.spark.sql.{Row, SQLContext}
import org.apache.spark.{SparkConf, SparkContext}

object PeopleInfoGenParquet {
  private val schemaString = "id,gender,height"
  def main(args: Array[String]) {

    println(util.Properties.versionString)

    if (args.length < 1) {
      println("Usage:PeopleDataStatistics2 filePath")
      System.exit(1)
    }

    val conf = new SparkConf().setAppName("Spark Exercise:People Data Statistics 2")
    val sc = new SparkContext(conf)
    val peopleDataRDD = sc.textFile(args(0))
    val sqlCtx = new SQLContext(sc)
    // this is used to implicitly convert an RDD to a DataFrame.

    val schemaArray = schemaString.split(",")
    val schema = StructType(schemaArray.map(fieldName => StructField(fieldName, StringType, true)))

    val rowRDD: RDD[Row] = peopleDataRDD.map(_.split(" ")).map(
      eachRow => Row(eachRow(0), eachRow(1), eachRow(2)))

    val peopleDF = sqlCtx.createDataFrame(rowRDD, schema)

    peopleDF.write.parquet("/sample_people_info")
  }
}
```



使用Spark提交任务进行parquet转换：

```shell
spark-submit --class com.test.PeopleInfoGenParquet \
--master spark://master.test.com:7077 \
--driver-memory 2g \
--executor-memory 1g \
--total-executor-cores 4 \
target/spark-example-1.0-SNAPSHOT.jar hdfs://master.test.com:8020/sample_people_info.txt
```

+ 验证数据大小

```
[root@master spark]#  su hdfs -c 'hadoop fs -du -h -s /sample_people_info.txt'
1.4 G  2.8 G  /sample_people_info.txt
[root@master spark]# su hdfs -c 'hadoop fs -du -h -s /sample_people_info'
517.2 M  1.0 G  /sample_people_info
```

+ 验证parquet文件

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

### 2.2 测试SQL

序号| 操作 | 测试SQL|  
--|--|--|--
Query-1  | 统计男性中身高超过 180cm 的人数。 |select count(*) from people where height > 180 and gender='M'  |  
Query-2  |  统计女性中身高超过 170cm 的人数。| select count(*) from people where height > 170 and gender='F'  |  
Query-3  |  对人群按照性别分组并统计男女人数。| select count(*) from people group by gender |  
Query-4  |  统计并打印身高大于 210cm 的前 50 名男性。| select id, gender, height from people where gender='M' and height > 210 limit 50 |  
Query-5  |   对所有人按身高进行排序并打印前 50 名的信息。|select id, gender, height from people order by  height desc limit 50|  
Query-6  |   统计男性的平均身高。|select avg(height) from people where gender='M' |  
Query-7  |  统计女性身高的最大值。| select max(height) from people where gender='F' |

### 2.3 SparkSQL查询测试

#### 2.3.1 TEXT文件
- 测试代码

```scala
package com.test

import org.apache.spark.rdd.RDD
import org.apache.spark.sql.types.{StringType, StructField, StructType}
import org.apache.spark.sql.{Row, SQLContext}
import org.apache.spark.{SparkConf, SparkContext}

object PeopleDataStatistics {
  private val schemaString = "id,gender,height"
  def main(args: Array[String]) {

    println(util.Properties.versionString)

    if (args.length < 1) {
      println("Usage:PeopleDataStatistics2 filePath")
      System.exit(1)
    }

    val conf = new SparkConf().setAppName("Spark Exercise:People Data Statistics 2")
    val sc = new SparkContext(conf)
    val peopleDataRDD = sc.textFile(args(0))
    val sqlCtx = new SQLContext(sc)
    // this is used to implicitly convert an RDD to a DataFrame.
    import sqlCtx.implicits._

    val schemaArray = schemaString.split(",")
    val schema = StructType(schemaArray.map(fieldName => StructField(fieldName, StringType, true)))

    val rowRDD: RDD[Row] = peopleDataRDD.map(_.split(" ")).map(
      eachRow => Row(eachRow(0), eachRow(1), eachRow(2)))

    val peopleDF = sqlCtx.createDataFrame(rowRDD, schema)

    peopleDF.createOrReplaceTempView("people")
    //select count(*) from people where height > 180 and gender='M'

    //get the male people whose height is more than 180
    val higherMale180 = sqlCtx.sql("select id,gender, height from people where height > 180 and gender='M'")
    println("Men whose height are more than 180: " + higherMale180.count())
    println("<Display #1>")

    //get the female people whose height is more than 170
    val higherFemale170 = sqlCtx.sql("select id,gender, height from people where height > 170 and gender='F'")
    println("Women whose height are more than 170: " + higherFemale170.count())
    println("<Display #2>")

    //Grouped the people by gender and count the number
    peopleDF
      .groupBy(peopleDF("gender")).count().show()
    println("People Count Grouped By Gender")
    println("<Display #3>")

    //Men whose height is more than 210
    peopleDF
      .filter(peopleDF("gender").equalTo("M"))
      .filter(peopleDF("height") > 210)
      .show(50)
    println("Men whose height is more than 210")
    println("<Display #4>")

    //Sorted the people by height in descend order,Show top 50 people
    peopleDF.sort($"height".desc).take(50)
      .foreach { row => println(row(0) + "," + row(1) + "," + row(2)) }
    println("Sorted the people by height in descend order,Show top 50 people")
    println("<Display #5>")

    //The Average height for Men
    peopleDF
      .filter(peopleDF("gender").equalTo("M"))
      .agg(Map("height" -> "avg")).show()

    println("The Average height for Men")
    println("<Display #6>")

    //The Max height for Women
    peopleDF
      .filter(peopleDF("gender").equalTo("F"))
      .agg("height" -> "max").show()
    println("The Max height for Women:")
    println("<Display #7>")

    //......
    println("All the statistics actions are finished on structured People data.")
  }
}
```
- 提交查询

```shell
spark-submit --class com.test.PeopleDataStatistics \
--master spark://master.test.com:7077 \
--driver-memory 2g \
--executor-memory 1g \
--total-executor-cores 4 \
target/spark-example-1.0-SNAPSHOT.jar hdfs://master.test.com:8020/sample_people_info.txt 1>result.txt 2>&1
```

#### 2.3.2 Parquet格式

- 测试代码

```scala
package com.test

import org.apache.spark.rdd.RDD
import org.apache.spark.sql.types.{StringType, StructField, StructType}
import org.apache.spark.sql.{Row, SQLContext}
import org.apache.spark.{SparkConf, SparkContext}

object PeopleDataStatisticsParquet {
  private val schemaString = "id,gender,height"
  def main(args: Array[String]) {

    println(util.Properties.versionString)

    if (args.length < 1) {
      println("Usage:PeopleDataStatistics2 filePath")
      System.exit(1)
    }

    val conf = new SparkConf().setAppName("Spark Exercise:People Data Statistics 2")
    val sc = new SparkContext(conf)
//    val peopleDataRDD = sc.textFile(args(0))
    val sqlCtx = new SQLContext(sc)
    // this is used to implicitly convert an RDD to a DataFrame.

    import sqlCtx.implicits._

    val schemaArray = schemaString.split(",")
    val schema = StructType(schemaArray.map(fieldName => StructField(fieldName, StringType, true)))

    val peopleDF = sqlCtx.read.parquet("/sample_people_info")
    peopleDF.createOrReplaceTempView("people")

    //get the male people whose height is more than 180
    val higherMale180 = sqlCtx.sql("select id,gender, height from people where height > 180 and gender='M'")
    println("Men whose height are more than 180: " + higherMale180.count())
    println("<Display #1>")

    //get the female people whose height is more than 170
    val higherFemale170 = sqlCtx.sql("select id,gender, height from people where height > 170 and gender='F'")
    println("Women whose height are more than 170: " + higherFemale170.count())
    println("<Display #2>")

    //Grouped the people by gender and count the number
    peopleDF
      .groupBy(peopleDF("gender")).count().show()
    println("People Count Grouped By Gender")
    println("<Display #3>")

    //Men whose height is more than 210
    peopleDF
      .filter(peopleDF("gender").equalTo("M"))
      .filter(peopleDF("height") > 210)
      .show(50)
    println("Men whose height is more than 210")
    println("<Display #4>")

    //Sorted the people by height in descend order,Show top 50 people
    peopleDF.sort($"height".desc).take(50)
      .foreach { row => println(row(0) + "," + row(1) + "," + row(2)) }
    println("Sorted the people by height in descend order,Show top 50 people")
    println("<Display #5>")

    //The Average height for Men
    peopleDF
      .filter(peopleDF("gender").equalTo("M"))
      .agg(Map("height" -> "avg")).show()

    println("The Average height for Men")
    println("<Display #6>")

    //The Max height for Women
    peopleDF
      .filter(peopleDF("gender").equalTo("F"))
      .agg("height" -> "max").show()
    println("The Max height for Women:")
    println("<Display #7>")

    println("All the statistics actions are finished on structured People data.")
  }
}
```

- 提交查询

```shell
spark-submit --class com.test.PeopleDataStatisticsParquet \
--master spark://master.test.com:7077 \
--driver-memory 2g \
--executor-memory 1g \
--total-executor-cores 4 \
target/spark-example-1.0-SNAPSHOT.jar hdfs://master.test.com:8020/sample_people_info 1>parquet_result.txt 2>&1

```

#### 2.3.3 SparkSQL测试结果

序号|   TEXT格式|  Parquet格式
--|---|--
Query-1  | 33.51 | 5.76
Query-2  | 27.83 | 3.09
Query-3  | 0.52  | 0.60
Query-4  | 0.19  | 0.15
Query-5  | 31.05 | 8.29
Query-6  | 29.46 | 7.38
Query-7  | 26.86 | 4.63

### 2.4 Hive SQL查询测试

```
su hive -l -s /bin/bash -c '/opt/hive/bin/beeline'
> !connect jdbc:hive2://node2.test.com:10000/default
```

#### 2.4.1 TEXT文件

```sql
drop table people2;
create table people2(id STRING,gender STRING,height STRING) row format delimited fields terminated by ' ' stored as textfile;
load data inpath '/sample_people_info.txt' overwrite into table people2;
select count(*) from people2;

```

序号|   测试SQL|  
--|---|--
Query-1  | select count(*) from people2 where height > 180 and gender='M'  |  
Query-2  | select count(*) from people2 where height > 170 and gender='F'  |  
Query-3  |  select count(*) from people2 group by gender |  
Query-4  |  select id, gender, height from people2 where gender='M' and height > 210 limit 50 |  
Query-5  |   select id, gender, height from people2 order by  height desc limit 50|  
Query-6  |  select avg(height) from people2 where gender='M' |  
Query-7  |  select max(height) from people2 where gender='F' |  


#### 2.4.2 Parquet格式

创建parquet存储的外表

```sql
drop table people;
CREATE EXTERNAL TABLE people(id STRING,gender STRING,height STRING) STORED AS PARQUETFILE LOCATION '/sample_people_info';
select count(*) from people;
```

序号|   测试SQL|  
--|---|--
Query-1  | select count(*) from people where height > 180 and gender='M'  |  
Query-2  | select count(*) from people where height > 170 and gender='F'  |  
Query-3  |  select count(*) from people group by gender |  
Query-4  |  select id, gender, height from people where gender='M' and height > 210 limit 50 |  
Query-5  |   select id, gender, height from people order by  height desc limit 50|  
Query-6  |  select avg(height) from people where gender='M' |  
Query-7  |  select max(height) from people where gender='F' |  

#### 2.4.3 Hive SQL测试结果




序号|   Hive(TEXT)|  Hive(Parquet)
--|---|--
Query-1  | 60.92 | 44.92
Query-2  | 67.31 | 43.85
Query-3  | 61.54 | 42.35
Query-4  | 37.85  | 0.53
Query-5  | 59.40 | 63.30
Query-6  | 55.06| 49.17
Query-7  | 52.97 | 47.06


### 2.5 单表测试结果对比

序号|   Spark(TEXT)|  Spark(Parquet)|   Hive(TEXT)|  Hive(Parquet)
--|---|--|---|--
Query-1  | 33.51 | 5.76| 60.92 | 44.92
Query-2  | 27.83 | 3.09| 67.31 | 43.85
Query-3  | 0.52  | 0.60| 61.54 | 42.35
Query-4  | 0.19  | 0.15| 37.85  | 0.53
Query-5  | 31.05 | 8.29| 59.40 | 63.30
Query-6  | 29.46 | 7.38| 55.06| 49.17
Query-7  | 26.86 | 4.63| 52.97 | 47.06


## 3 多表测试

### 3.1 多表数据

在本案例中，我们将统计分析 1 千万用户和 1 亿条交易数据。对于用户数据，它是一个包含 6 个列 (ID, 性别, 年龄, 注册日期, 角色 (从事行业), 所在区域) 的文本文件，具有以下格式:


```
1 F 30 2015-10-9 ROLE001 REG002
2 F 15 2005-4-2 ROLE001 REG004
3 F 26 2000-11-18 ROLE005 REG002
4 M 27 2012-6-1 ROLE005 REG005
5 M 11 2001-2-23 ROLE001 REG005
6 M 49 2002-3-20 ROLE003 REG001
7 M 39 2014-12-22 ROLE001 REG005
8 M 43 2012-1-3 ROLE005 REG004
9 F 11 2014-10-11 ROLE001 REG005
```


对于交易数据，它是一个包含 5 个列 (交易单号, 交易日期, 产品种类, 价格, 用户 ID) 的文本文件，具有以下格式:

```
1 2000-8-9 5 312 1823359
2 2003-1-3 8 266 4426761
3 2011-11-16 7 1197 2504036
4 2007-9-27 3 1013 9093075
5 2015-9-18 7 1064 5729462
6 2008-11-16 1 985 5921470
7 2003-4-15 5 1464 5516412
8 2005-10-13 2 691 4493409
9 2009-5-8 8 1339 4353873
10 2009-9-23 2 1976 2144924
```



### 3.2 测试数据生成代码

+ 用户数据生成代码

```scala
import java.io.FileWriter

import scala.util.Random

object UserDataGenerator {
    private val FILE_PATH = "sample_user_data.txt"
    private val ROLE_ID_ARRAY = Array[String]("ROLE001", "ROLE002", "ROLE003", "ROLE004", "ROLE005")
    private val REGION_ID_ARRAY = Array[String]("REG001", "REG002", "REG003", "REG004", "REG005")
    private val MAX_USER_AGE = 60
    //how many records to be generated
    private val MAX_RECORDS = 10000000

    def main(args: Array[String]): Unit = {
        generateDataFile(FILE_PATH, MAX_RECORDS)
    }

    private def generateDataFile(filePath: String, recordNum: Int): Unit = {
        var writer: FileWriter = null
        try {
            writer = new FileWriter(filePath, true)
            val rand = new Random()
            for (i <- 1 to recordNum) {
                //generate the gender of the user
                var gender = getRandomGender
                var age = rand.nextInt(MAX_USER_AGE)
                if (age < 10) {
                    age = age + 10
                }
                var year = rand.nextInt(16) + 2000
                var month = rand.nextInt(12) + 1
                var day = rand.nextInt(28) + 1
                var registerDate = year + "-" + month + "-" + day
                //generate the role of the user

                var roleIndex: Int = rand.nextInt(ROLE_ID_ARRAY.length)
                var role = ROLE_ID_ARRAY(roleIndex)
                //generate the region where the user is
                var regionIndex: Int = rand.nextInt(REGION_ID_ARRAY.length)

                var region = REGION_ID_ARRAY(regionIndex)

                writer.write(i + " " + gender + " " + age + " " + registerDate
                    + " " + role + " " + region
                )
                writer.write(System.getProperty("line.separator"))

            }
            writer.flush()
        } catch {
            case e: Exception => println("Error occurred:" + e)
        } finally {
            if (writer != null) writer.close()
        }
        println("User Data File generated successfully.")
    }

    private def getRandomGender(): String = {
        val rand = new Random()
        val randNum = rand.nextInt(2) + 1
        if (randNum % 2 == 0) {
            "M"
        } else {
            "F"
        }
    }
}

```


+ 交易数据生成代码

```scala
import java.io.FileWriter
import scala.util.Random

object ConsumingDataGenerator {
    private val FILE_PATH = "sample_consuming_data.txt"
    // how many records to be generated
    private val MAX_RECORDS = 100000000
    // we suppose only 10 kinds of products in the consuming data
    private val PRODUCT_ID_ARRAY = Array[Int](1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
    // we suppose the price of most expensive product will not exceed 2000 RMB
    private val MAX_PRICE = 2000
    // we suppose the price of cheapest product will not be lower than 10 RMB
    private val MIN_PRICE = 10
    //the users number which should be same as the one in UserDataGenerator object
    private val USERS_NUM = 10000000

    def main(args: Array[String]): Unit = {
        generateDataFile(FILE_PATH, MAX_RECORDS);
    }

    private def generateDataFile(filePath: String, recordNum: Int): Unit = {
        var writer: FileWriter = null
        try {
            writer = new FileWriter(filePath, true)
            val rand = new Random()
            for (i <- 1 to recordNum) {
                //generate the buying date
                var year = rand.nextInt(16) + 2000
                var month = rand.nextInt(12) + 1
                //to avoid checking if it is a valid day for specific
                // month,we always generate a day which is no more than 28
                var day = rand.nextInt(28) + 1
                var recordDate = year + "-" + month + "-" + day
                //generate the product ID
                var index: Int = rand.nextInt(PRODUCT_ID_ARRAY.length)
                var productID = PRODUCT_ID_ARRAY(index)
                //generate the product price
                var price: Int = rand.nextInt(MAX_PRICE)
                if (price == 0) {
                    price = MIN_PRICE
                }
                // which user buys this product
                val userID = rand.nextInt(10000000) + 1
                writer.write(i + " " + recordDate + " " + productID
                    + " " + price + " " + userID)
                writer.write(System.getProperty("line.separator"))
            }
            writer.flush()
        } catch {
            case e: Exception => println("Error occurred:" + e)
        } finally {
            if (writer != null)
                writer.close()
        }
        println("Consuming Data File generated successfully.")
    }
}

```

上传至HDFS：

```shell
su hdfs -c 'hadoop fs -copyFromLocal /root/sample_user_data.txt /sample_user_data.txt'
su hdfs -c 'hadoop fs -copyFromLocal /root/sample_consuming_data.txt /sample_consuming_data.txt'
su hdfs -c 'hadoop fs -ls /'
```

之后将text文件转换为parquet格式：
```shell
spark-submit --class com.test.UserConsumingDataStatistics \
--master spark://master.test.com:7077 \
--driver-memory 2g \
--executor-memory 1g \
--total-executor-cores 4 \
target/spark-example-1.0-SNAPSHOT.jar hdfs://master.test.com:8020/sample_user_data.txt hdfs://master.test.com:8020/sample_consuming_data.txt parquet
```

> UserConsumingDataStatistics见3.3.1，添加parquet参数表示格式转换


### 3.3 SparkSQL测试
#### 3.3.1 TEXT文件

+ 测试代码

```scala
package com.test
import org.apache.spark.sql.SQLContext
import org.apache.spark.storage.StorageLevel
import org.apache.spark.{SparkConf, SparkContext}

object UserConsumingDataStatistics {
    def main(args: Array[String]) {
        println("args.length:" + args.length)

        if (args.length < 1) {
            println("Usage:UserConsumingDataStatistics userDataFilePath consumingDataFilePath")
            System.exit(1)
        }
        val conf = new SparkConf().setAppName("Spark Exercise:User Consuming Data Statistics")
        //Kryo serializer is more quickly by default java serializer
        conf.set("spark.serializer", "org.apache.spark.serializer.KryoSerializer")
        val ctx = new SparkContext(conf)
        val sqlCtx = new SQLContext(ctx)
        import sqlCtx.implicits._
        //Convert user data RDD to a DataFrame and register it as a temp table
        val userDF = ctx.textFile(args(0)).map(_.split(" ")).map(
            u => User(u(0), u(1), u(2).toInt, u(3), u(4), u(5))).toDF()
        userDF.createOrReplaceTempView("user")
        //Convert consuming data RDD to a DataFrame and register it as a temp table
        val orderDF = ctx.textFile(args(1)).map(_.split(" ")).map(o => Order(
            o(0), o(1), o(2).toInt, o(3).toInt, o(4))).toDF()
        orderDF.createOrReplaceTempView("orders")

        //转换成parquet格式
        if(args.length == 3){
            //just gen parquet data
            userDF.write.parquet("/sample_user_data")
            orderDF.write.parquet("/sample_consuming_data")
            return
        }

        //cache the DF in memory with serializer should make the program run much faster
        userDF.persist(StorageLevel.MEMORY_ONLY_SER)
        orderDF.persist(StorageLevel.MEMORY_ONLY_SER)

        //The number of people who have orders in the year 2015
        val count = orderDF.filter(orderDF("orderDate").contains("2015")).join(
            userDF, orderDF("userID").equalTo(userDF("userID"))).count()
        println("The number of people who have orders in the year 2015:" + count)

        //total orders produced in the year 2014
        val countOfOrders2014 = sqlCtx.sql("SELECT * FROM orders where  orderDate like '2014%'").count()
        println("total orders produced in the year 2014:" + countOfOrders2014)



        //Orders that are produced by user with ID 1 information overview
        val countOfOrdersForUser1 = sqlCtx.sql("SELECT o.orderID,o.productID, o.price,u.userID FROM orders o,user u where u.userID = 1 and u.userID = o.userID").show()
        println("Orders produced by user with ID 1 showed.")

        //Calculate the max,min,avg prices for the orders that are producted by user with ID 10
        val orderStatsForUser10 = sqlCtx.sql("SELECT max(o.price) as maxPrice, min(o.price) as minPrice,avg(o.price) as avgPrice,u.userID FROM orders o, user u where u.userID = 10 and u.userID = o.userID group by u.userID")
        println("Order statistic result for user with ID 10:")
        orderStatsForUser10.collect().map(order => "Minimum Price=" + order.getAs("minPrice")
            + ";Maximum Price=" + order.getAs("maxPrice")
            + ";Average Price=" + order.getAs("avgPrice")
        ).foreach(result => println(result))
    }
}
```

+ 提交任务
```shell
spark-submit --class com.test.UserConsumingDataStatistics \
--master spark://master.test.com:7077 \
--driver-memory 2g \
--executor-memory 1g \
--total-executor-cores 4 \
target/spark-example-1.0-SNAPSHOT.jar hdfs://master.test.com:8020/sample_user_data.txt hdfs://master.test.com:8020/sample_consuming_data.txt 1>consuming_result.txt 2>&1
```

+ 测试结果

```shell
Job 0 finished: count at UserConsumingDataStatistics.scala:45, took 103.472787 s
The number of people who have orders in the year 2015:6249355
Job 1 finished: count at UserConsumingDataStatistics.scala:50, took 74.912479 s
total orders produced in the year 2014:6251708
Job 2 finished: show at UserConsumingDataStatistics.scala:56, took 74.572010 s
Job 3 finished: show at UserConsumingDataStatistics.scala:56, took 0.111601 s
Job 4 finished: show at UserConsumingDataStatistics.scala:56, took 0.109862 s
Job 5 finished: show at UserConsumingDataStatistics.scala:56, took 0.481688 s
2019-09-19 16:08:25,699 INFO scheduler.DAGScheduler: Job 6 finished: show at UserConsumingDataStatistics.scala:56, took 0.309017 s
+--------+---------+-----+------+
| orderID|productID|price|userID|
+--------+---------+-----+------+
|25038167|        6| 1239|     1|
|64521701|        8| 1428|     1|
|75084459|        2|  101|     1|
| 8477710|        9|  425|     1|
+--------+---------+-----+------+
Orders produced by user with ID 1 showed.
Job 7 finished: collect at UserConsumingDataStatistics.scala:64, took 82.077812 s
Minimum Price=461;Maximum Price=1512;Average Price=955.6
```


序号|   Spark(TEXT)|  
--|---|--|---|--
Query-1  | 103.47 |
Query-2  | 74.91 |
Query-3  | 75.59  |
Query-4  | 82.08  |



#### 3.3.2 Parquet格式测试

+ 测试代码

```scala
package com.test
import org.apache.spark.sql.SQLContext
import org.apache.spark.storage.StorageLevel
import org.apache.spark.{SparkConf, SparkContext}
object UserConsumingDataStatisticsParquet {
    def main(args: Array[String]) {
        if (args.length < 1) {
            println("Usage:UserConsumingDataStatisticsParquet userDataFilePath consumingDataFilePath")
            System.exit(1)
        }
        val conf = new SparkConf().setAppName("Spark Exercise:User Consuming Data Statistics")
        //Kryo serializer is more quickly by default java serializer
        conf.set("spark.serializer", "org.apache.spark.serializer.KryoSerializer")
        val ctx = new SparkContext(conf)
        val sqlCtx = new SQLContext(ctx)
        import sqlCtx.implicits._

        val userDF = sqlCtx.read.parquet(args(0))
        userDF.createOrReplaceTempView("user")

        val orderDF = sqlCtx.read.parquet(args(1))
        orderDF.createOrReplaceTempView("orders")

        //cache the DF in memory with serializer should make the program run much faster
        userDF.persist(StorageLevel.MEMORY_ONLY_SER)
        orderDF.persist(StorageLevel.MEMORY_ONLY_SER)

        //The number of people who have orders in the year 2015
        val count = orderDF.filter(orderDF("orderDate").contains("2015")).join(
            userDF, orderDF("userID").equalTo(userDF("userID"))).count()
        println("The number of people who have orders in the year 2015:" + count)

        //total orders produced in the year 2014
        val countOfOrders2014 = sqlCtx.sql("SELECT * FROM orders where  orderDate like '2014%'").count()
        println("total orders produced in the year 2014:" + countOfOrders2014)

        //Orders that are produced by user with ID 1 information overview
        val countOfOrdersForUser1 = sqlCtx.sql("SELECT o.orderID,o.productID, o.price,u.userID FROM orders o,user u where u.userID = 1 and u.userID = o.userID").show()
        println("Orders produced by user with ID 1 showed.")

        //Calculate the max,min,avg prices for the orders that are producted by user with ID 10
        val orderStatsForUser10 = sqlCtx.sql("SELECT max(o.price) as maxPrice, min(o.price) as minPrice,avg(o.price) as avgPrice,u.userID FROM orders o, user u where u.userID = 10 and u.userID = o.userID group by u.userID")
        println("Order statistic result for user with ID 10:")
        orderStatsForUser10.collect().map(order => "Minimum Price=" + order.getAs("minPrice")
            + ";Maximum Price=" + order.getAs("maxPrice")
            + ";Average Price=" + order.getAs("avgPrice")
        ).foreach(result => println(result))
    }
}

```


+ 提交任务
```shell
spark-submit --class com.test.UserConsumingDataStatisticsParquet \
--master spark://master.test.com:7077 \
--driver-memory 2g \
--executor-memory 1g \
--total-executor-cores 4 \
target/spark-example-1.0-SNAPSHOT.jar hdfs://master.test.com:8020/sample_user_data hdfs://master.test.com:8020/sample_consuming_data 1>consuming_parquet_result.txt 2>&1
```

+ 测试结果

```
Job 0 finished: parquet at UserConsumingDataStatisticsParquet.scala:21, took 2.768159 s
Job 1 finished: parquet at UserConsumingDataStatisticsParquet.scala:25, took 1.965211 s
Job 2 finished: count at UserConsumingDataStatisticsParquet.scala:36, took 88.654541 s
The number of people who have orders in the year 2015:6249355
Job 3 finished: count at UserConsumingDataStatisticsParquet.scala:41, took 60.676918 s
total orders produced in the year 2014:6251708
Job 4 finished: show at UserConsumingDataStatisticsParquet.scala:47, took 70.043645 s
Job 5 finished: show at UserConsumingDataStatisticsParquet.scala:47, took 0.105641 s
Job 6 finished: show at UserConsumingDataStatisticsParquet.scala:47, took 0.123206 s
Job 7 finished: show at UserConsumingDataStatisticsParquet.scala:47, took 0.502567 s
Job 8 finished: show at UserConsumingDataStatisticsParquet.scala:47, took 0.397689 s
+--------+---------+-----+------+
| orderID|productID|price|userID|
+--------+---------+-----+------+
|75084459|        2|  101|     1|
| 8477710|        9|  425|     1|
|25038167|        6| 1239|     1|
|64521701|        8| 1428|     1|
+--------+---------+-----+------+
Orders produced by user with ID 1 showed.
Job 9 finished: collect at UserConsumingDataStatisticsParquet.scala:55, took 65.390210 s
Minimum Price=461;Maximum Price=1512;Average Price=955.6
```


序号|   Spark(Parquet)|  
--|---|--|---|--
Query-1  | 88.66 |
Query-2  | 60.68 |
Query-3  | 71.14  |
Query-4  | 65.39  |


### 3.4 Hive查询测试

#### 3.4.1 TEXT格式

```
su hive -l -s /bin/bash -c '/opt/hive/bin/beeline'
> !connect jdbc:hive2://node2.test.com:10000/default
```

+ 创建数据表

```sql
drop table users;
create table users(userID STRING, gender STRING, age INT, registerDate STRING, role STRING, region STRING) row format delimited fields terminated by ' ' stored as textfile;
load data inpath '/sample_user_data.txt' overwrite into table users;
select count(*) from users;

drop table orders;
create table orders (orderID STRING, orderDate STRING, productID INT, price INT, userID STRING) row format delimited fields terminated by ' ' stored as textfile;
load data inpath '/sample_consuming_data.txt' overwrite into table orders;
select count(*) from orders;
```

+ 测试SQL

序号|   测试SQL|  
:--:|---|--
Query-1  | select count(*) from users u join orders o on o.userID=u.userID where o.orderDate like '2015%' |  
Query-2  | select count(*) from orders where  orderDate like '2014%'|  
Query-3  |  SELECT o.orderID,o.productID, o.price,u.userID FROM orders o,users u where u.userID = 1 and u.userID = o.userID |  
Query-4  |  SELECT max(o.price) as maxPrice, min(o.price) as minPrice,avg(o.price) as avgPrice,u.userID FROM orders o, users u where u.userID = 10 and u.userID = o.userID group by u.userID; |  



#### 3.4.2 Parquet格式

+ 创建数据表

```sql
drop table users2;
create EXTERNAL table users2(userID STRING, gender STRING, age INT, registerDate STRING, role STRING, region STRING)  stored as PARQUETFILE LOCATION '/sample_user_data';
select count(*) from users2;

drop table orders2;
create EXTERNAL table orders2 (orderID STRING, orderDate STRING, productID INT, price INT, userID STRING) row format delimited fields terminated by ' ' stored as PARQUETFILE LOCATION '/sample_consuming_data';
select count(*) from orders2;
```

+ 测试SQL

序号|   测试SQL|  
--|---|--
Query-1  | select count(*) from users2 u join orders2 o on o.userID=u.userID where o.orderDate like '2015%' |  
Query-2  | select count(*) from orders2 where  orderDate like '2014%'|  
Query-3  |  SELECT o.orderID,o.productID, o.price,u.userID FROM orders2 o,users2 u where u.userID = 1 and u.userID = o.userID |  
Query-4  |  SELECT max(o.price) as maxPrice, min(o.price) as minPrice,avg(o.price) as avgPrice,u.userID FROM orders2 o, users2 u where u.userID = 10 and u.userID = o.userID group by u.userID; |  



#### 3.4.3 Hive SQL测试结果




序号|   Hive(TEXT)|  Hive(Parquet)
--|---|--
Query-1  | 345.078 | 160.117
Query-2  | 107.354 | 73.401
Query-3  | 403.658 | 101.742
Query-4  | 278.132  | 178.679



### 3.5 多表测试结果对比


序号|   Spark(TEXT)|  Spark(Parquet)|   Hive(TEXT)|  Hive(Parquet)
--|---|--|---|--
Query-1  | 103.47 | 88.66| 253.341 | 160.117
Query-2  | 74.91 | 60.68| 107.354 | 73.401
Query-3  | 75.59  | 71.14| 403.658 | 101.742
Query-4  | 82.08  | 65.39| 278.132  | 178.679




## 4. 参考链接

+ [SparkSQL简介及入门](https://my.oschina.net/u/3754001/blog/1811926)
+ [使用 Scala 语言开发 Spark 应用程序](https://www.ibm.com/developerworks/cn/opensource/os-cn-spark-practice1/)
+ [使用 Kafka 和 Spark Streaming 构建实时数据处理系统](https://www.ibm.com/developerworks/cn/opensource/os-cn-spark-practice2/)
+ [使用 Spark SQL 对结构化数据进行统计分析](https://www.ibm.com/developerworks/cn/opensource/os-cn-spark-practice3/)
+ [Presto与Spark SQL查询性能比较](https://blog.csdn.net/yiifaa/article/details/82788727)
+ [Presto介绍](https://yq.aliyun.com/articles/25581)
+ [Presto实现原理和美团的使用实践](https://tech.meituan.com/2014/06/16/presto.html)
+ [Spark、Impala、Hive 对比测试](https://doc.yonyoucloud.com/doc/ae/attachments/920762/920761.pdf)
+ [开源OLAP引擎测评报告(SparkSql、Presto、Impala、HAWQ、ClickHouse、GreenPlum)](http://www.clickhouse.com.cn/topic/5c453371389ad55f127768ea)
