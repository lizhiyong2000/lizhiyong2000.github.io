





目前，使用前后端分离的开发模式比较常见，后端提供RESTful的API接口供前端调用，负责后端业务逻辑，前端负责页面交互逻辑。

近期正好学习了Django和Ant-Design-Pro的相关知识，打算写个登录的demo先看看。



### 1. 新建工程目录

目录工程前端和后端分开：

```bash
mkdir django-antd-pro
cd django-antd-pro
mkdir frontend
mkdir backend
```



### 2. 后端工程

后端将使用Django提供REST接口，数据库采用mysql，支持JWT认证。

#### 2.1 Django工程准备

- **进入venv后，安装相关python包**：

```shell
cd backend
virtualenv venv
source venv/bin/activate

pip install django
pip install djangorestframework	
pip install djangorestframework-jwt
pip install mysqlclient
```

- **新加Django工程，添加一个account模块：**

```shell
django-admin startproject dj_admin
django-admin startapp account
```

- **修改settings文件，加入新添加的account配置及rest framework和数据库相关配置：**

```
vi dj_admin/settings.py
```

修改如下：

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'account.apps.AccountConfig',
]
```

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'CONN_MAX_AGE': 0,
        'NAME': 'dj_admin',
        'USER': 'root',
        'PASSWORD': '123456',
        'HOST': 'localhost',
        'PORT': '3306',
    },
}
```



```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
        'rest_framework.authentication.BasicAuthentication',
        'rest_framework.authentication.SessionAuthentication',

    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),

    'DEFAULT_THROTTLE_CLASSES': [
        # 'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.ScopedRateThrottle',

    ],
    'DEFAULT_THROTTLE_RATES': {
        # 'anon': '1/minute',
        'login': '10/minute'
    }
}
```

- 使能Django自带的admin功能，测试能正常登录：

```shell
python manage.py createsuperuser

python manage.py makemigrations
python manage.py migrate
```



![image-20200329161752456](http://carforeasy.cn/2020-03-29_image-20200329161752456.png)



#### 2.2 加入用户列表API

用户列表接口提供2个API：用户列表接口和用户详情接口。

操作如下：

- 添加Serializers

```
from django.contrib.auth.models import User
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'last_login', 'is_active' ]
```

- 添加接口对应的View

```
from django.contrib.auth.models import User

from rest_framework import generics
from .serializers import UserSerializer


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
```

- 修改URLS配置

account urls:

```
from django.urls import path
from . import views

app_name = 'account'

urlpatterns = [
    path('users/',
         views.UserListView.as_view(),
         name='user_list'),

    path('users/<pk>/',
         views.UserDetailView.as_view(),
         name='user_detail'),
```

dj_admin urls:

```
urlpatterns = [
    path('admin/', admin.site.urls),
    path('account/', include('account.urls', namespace='account')),
]
```



之后启动工程，在浏览其中使用admin用户登录后可访问接口如下：

- 用户列表接口：

![image-20200329183640139](http://carforeasy.cn/2020-03-29_2020-03-29_image-20200329183640139.png)



- 用户详情接口：

![image-20200329183712210](http://carforeasy.cn/2020-03-29_2020-03-29_image-20200329183712210.png)



#### 2.3 加入登录API

现在登录使用的还是django admin提供的接口，需要自己实现一下登录接口。

### 3. 前端工程