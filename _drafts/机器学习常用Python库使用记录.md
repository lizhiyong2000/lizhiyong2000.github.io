### NumPy

#### argsort方法

argsort()函数是将x中的元素从小到大排列，提取其对应的index(索引号)
例如：x[4]=-10最小，所以y[0]=4,
同理：x[2]=5最大，所以y[5]=2。

看以下官方案例：

+ 一维数组

```python
    >>> x = np.array([3, 1, 2])
    >>> np.argsort(x)
    array([1, 2, 0])
```


+ 二维数组

```python
    >>> x = np.array([[0, 3], [2, 2]])
    >>> x
    array([[0, 3],
           [2, 2]])

    >>> np.argsort(x, axis=0) #按列排序
    array([[0, 1],
           [1, 0]])

    >>> np.argsort(x, axis=1) #按行排序
    array([[0, 1],
           [0, 1]])
```


### matplotlib
#### arrow
+ arrow函数

```python
matplotlib.pyplot.arrow( x, y, dx, dy, hold=None, **kwargs)
```

+ 参数
  x, y : 箭头起点坐标
  dx, dy : 箭头x上的长度和y轴上的长度
  width: 箭头宽度，默认0.001
  length_includes_head: bool，箭"头"是否包含在长度之中 默认False
  head_width: float,箭"头"的宽度，默认: 3*width
  head_length: float 箭"头"的长度，默认1.5 * head_width
  shape: [‘full’, ‘left’, ‘right’]，箭头形状， 默认 ‘full’
  overhang: float (default: 0)
  head_starts_at_zero: bool (default: False)开始坐标是否是0

+ 返回值
FancyArrow

+ 参数对比实例

```python
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation

ax = plt.subplot(331)
ax.arrow(0, 0, 0.5, 0.5, width=0.05)
ax.set_title("0, 0, 0.5, 0.5, width=0.05")

ax = plt.subplot(332)
ax.arrow(0, 0, 0.5, 0.5, width=0.05,length_includes_head=True)
ax.set_title("0, 0, 0.5, 0.5, width=0.05,length_includes_head=True")

ax = plt.subplot(333)
ax.arrow(0, 0, 0.5, 0.5, width=0.1)
ax.set_title("0, 0, 0.5, 0.5, width=0.1")

ax = plt.subplot(334)
ax.arrow(0, 0, 0.5, 0.5, width=0.05,shape="left")
ax.set_title("0, 0, 0.5, 0.5, width=0.05,shape=left")

ax = plt.subplot(335)
ax.arrow(0, 0, 0.5, 0.5, width=0.05,shape="right")
ax.set_title("0, 0, 0.5, 0.5, width=0.05,shape=right")

ax = plt.subplot(336)
ax.arrow(0, 0, 0.5, 0.5, width=0.05,overhang=0.5)
ax.set_title("0, 0, 0.5, 0.5, width=0.05,overhang=0.5")

ax = plt.subplot(337)
ax.arrow(0, 0, 0.5, 0.5, width=0.05,head_starts_at_zero=True)
ax.set_title("0, 0, 0.5, 0.5, width=0.05,head_starts_at_zero=True")

ax = plt.subplot(338)
ax.arrow(0, 0, 0.5, 0.5, width=0.05,fill=False,ec='red')
ax.set_title("0, 0, 0.5, 0.5, width=0.05,fill=False,ec='red'")

ax = plt.subplot(339)
ax.arrow(0, 0, 0.5, 0.5, width=0.05,fc='red',ec='blue',alpha=0.3)
ax.set_title("0, 0, 0.5, 0.5, width=0.05,fc='red',ec='blue',alpha=0.3")

plt.gcf().set_size_inches(14,12)
plt.savefig('arrow.png')
plt.show()
```

![](http://carforeasy.cn/机器学习常用Python库使用记录-d9756a99.png)

### Scikit

#### sklearn.datasets.make_blobs方法
make_blobs方法常被用来生成聚类算法的测试数据，根据用户指定的特征数量、中心点数量、范围等来生成聚类数据，这些数据可用于测试聚类算法的效果。

+ 方法声明:

```python
sklearn.datasets.make_blobs(n_samples=100, n_features=2,centers=3, cluster_std=1.0, center_box=(-10.0, 10.0), shuffle=True, random_state=None)
```

+ 其中：
n_samples是待生成的样本的总数。
n_features是每个样本的特征数。
centers表示类别数。
cluster_std表示每个类别的方差，例如我们希望生成2类数据，其中一类比另一类具有更大的方差，可以将cluster_std设置为[1.0,3.0]。

+ 例：生成3类数据用于聚类（100个样本，每个样本有2个特征）

```python
from sklearn.datasets import make_blobs
from matplotlib import pyplot

data,target=make_blobs(n_samples=100,n_features=2,centers=3)

# 在2D图中绘制样本，每个样本颜色不同
pyplot.scatter(data[:,0],data[:,1],c=target);
pyplot.show()
```
![](http://carforeasy.cn/机器学习常用Python库使用记录-2969217c.png)


+ 为每个类别设置不同的方差，只需要在上述代码中加入cluster_std参数即可：

```python
from sklearn.datasets import make_blobs
from matplotlib import pyplot

data,target=make_blobs(n_samples=100,n_features=2,centers=3,cluster_std=[1.0,3.0,2.0])

#在2D图中绘制样本，每个样本颜色不同
pyplot.scatter(data[:,0],data[:,1],c=target);
pyplot.show()
```
![](http://carforeasy.cn/机器学习常用Python库使用记录-d5d341d1.png)

## 参考链接




* [matplotlib之arrow](https://my.oschina.net/u/2474629/blog/1794901)
* [argsort(）函数的总结](https://blog.csdn.net/u014745194/article/details/73496836)
* [【scikit-learn】06：make_blobs聚类数据生成器](https://blog.csdn.net/kevinelstri/article/details/52622960)
* [matplotlib Changes to the default style](https://matplotlib.org/users/dflt_style_changes.html)
