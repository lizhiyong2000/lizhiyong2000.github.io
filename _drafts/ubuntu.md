##安装tsocks
    apt-get install tsocks  

>使用前设置conf文件

    vi /etc/tsocks.conf  

>做一个简单的配置就好了：

    local = 192.168.1.0/255.255.255.0  #local表示本地的网络，也就是不使用socks代理的网络  
    local = 127.0.0.0/255.0.0.0  
    server = 127.0.0.1   #socks服务器的IP  
    server_type = 5  #socks服务版本  
    server_port = 1080  ＃socks服务使用的端口  

##安装 net-tools
>编辑 /etc/sudoers  
    lizhiyong ALL=(ALL) NOPASSWD:ALL

##安装 docker.io

##安装 JDK 
    sudo add-apt-repository ppa:linuxuprising/java
    sudo apt update
    sudo apt install oracle-java10-installer

##安装 shadowsocks-qt5

    sudo add-apt-repository ppa:hzwhuang/ss-qt5
    sudo apt-get update
    sudo apt-get install shadowsocks-qt5
>原来的如下:
    http://ppa.launchpad.net/hzwhuang/ss-qt5/ubuntu bionic main

>改成如下:
    http://ppa.launchpad.net/hzwhuang/ss-qt5/ubuntu artful main


##安装中文输入法
>编辑配置文件，将en_US.UTF-8 改为 zh_CN.UTF-8

    sudo nano /etc/default/locale
    LANG="zh_CN.UTF-8"
    LANGUAGE="en_US.UTF-8"


    sudo apt-get install ibus-pinyin

    sudo fc-cache -f -v

    sudo apt-get install gnome-tweak-tool


##修改 vm.max_map_count 
>Shell
    sudo sysctl -w vm.max_map_count=655360
>/etc/sysctl.conf
    add vm.max_map_count=655360

##修改 /etc/resolv.conf
    sudo ln -s /run/systemd/resolve/resolv.conf /etc/resolv.conf

##IDEA 2018
>把 idea.vmoptions 文件加一行如下的配置，根据你保存的文件名自行变更

    -javaagent:../bin/JetbrainsCrack-2.7-release-str.jar

>idea 激活码

    K71U8DBPNE-eyJsaWNlbnNlSWQiOiJLNzFVOERCUE5FIiwibGljZW5zZWVOYW1lIjoibGFuIHl1IiwiYXNzaWduZWVOYW1lIjoiIiwiYXNzaWduZWVFbWFpbCI6IiIsImxpY2Vuc2VSZXN0cmljdGlvbiI6IkZvciBlZHVjYXRpb25hbCB1c2Ugb25seSIsImNoZWNrQ29uY3VycmVudFVzZSI6ZmFsc2UsInByb2R1Y3RzIjpbeyJjb2RlIjoiSUkiLCJwYWlkVXBUbyI6IjIwMTktMDUtMDQifSx7ImNvZGUiOiJSUzAiLCJwYWlkVXBUbyI6IjIwMTktMDUtMDQifSx7ImNvZGUiOiJXUyIsInBhaWRVcFRvIjoiMjAxOS0wNS0wNCJ9LHsiY29kZSI6IlJEIiwicGFpZFVwVG8iOiIyMDE5LTA1LTA0In0seyJjb2RlIjoiUkMiLCJwYWlkVXBUbyI6IjIwMTktMDUtMDQifSx7ImNvZGUiOiJEQyIsInBhaWRVcFRvIjoiMjAxOS0wNS0wNCJ9LHsiY29kZSI6IkRCIiwicGFpZFVwVG8iOiIyMDE5LTA1LTA0In0seyJjb2RlIjoiUk0iLCJwYWlkVXBUbyI6IjIwMTktMDUtMDQifSx7ImNvZGUiOiJETSIsInBhaWRVcFRvIjoiMjAxOS0wNS0wNCJ9LHsiY29kZSI6IkFDIiwicGFpZFVwVG8iOiIyMDE5LTA1LTA0In0seyJjb2RlIjoiRFBOIiwicGFpZFVwVG8iOiIyMDE5LTA1LTA0In0seyJjb2RlIjoiR08iLCJwYWlkVXBUbyI6IjIwMTktMDUtMDQifSx7ImNvZGUiOiJQUyIsInBhaWRVcFRvIjoiMjAxOS0wNS0wNCJ9LHsiY29kZSI6IkNMIiwicGFpZFVwVG8iOiIyMDE5LTA1LTA0In0seyJjb2RlIjoiUEMiLCJwYWlkVXBUbyI6IjIwMTktMDUtMDQifSx7ImNvZGUiOiJSU1UiLCJwYWlkVXBUbyI6IjIwMTktMDUtMDQifV0sImhhc2giOiI4OTA4Mjg5LzAiLCJncmFjZVBlcmlvZERheXMiOjAsImF1dG9Qcm9sb25nYXRlZCI6ZmFsc2UsImlzQXV0b1Byb2xvbmdhdGVkIjpmYWxzZX0=-Owt3/+LdCpedvF0eQ8635yYt0+ZLtCfIHOKzSrx5hBtbKGYRPFDrdgQAK6lJjexl2emLBcUq729K1+ukY9Js0nx1NH09l9Rw4c7k9wUksLl6RWx7Hcdcma1AHolfSp79NynSMZzQQLFohNyjD+dXfXM5GYd2OTHya0zYjTNMmAJuuRsapJMP9F1z7UTpMpLMxS/JaCWdyX6qIs+funJdPF7bjzYAQBvtbz+6SANBgN36gG1B2xHhccTn6WE8vagwwSNuM70egpahcTktoHxI7uS1JGN9gKAr6nbp+8DbFz3a2wd+XoF3nSJb/d2f/6zJR8yJF8AOyb30kwg3zf5cWw==-MIIEPjCCAiagAwIBAgIBBTANBgkqhkiG9w0BAQsFADAYMRYwFAYDVQQDDA1KZXRQcm9maWxlIENBMB4XDTE1MTEwMjA4MjE0OFoXDTE4MTEwMTA4MjE0OFowETEPMA0GA1UEAwwGcHJvZDN5MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxcQkq+zdxlR2mmRYBPzGbUNdMN6OaXiXzxIWtMEkrJMO/5oUfQJbLLuMSMK0QHFmaI37WShyxZcfRCidwXjot4zmNBKnlyHodDij/78TmVqFl8nOeD5+07B8VEaIu7c3E1N+e1doC6wht4I4+IEmtsPAdoaj5WCQVQbrI8KeT8M9VcBIWX7fD0fhexfg3ZRt0xqwMcXGNp3DdJHiO0rCdU+Itv7EmtnSVq9jBG1usMSFvMowR25mju2JcPFp1+I4ZI+FqgR8gyG8oiNDyNEoAbsR3lOpI7grUYSvkB/xVy/VoklPCK2h0f0GJxFjnye8NT1PAywoyl7RmiAVRE/EKwIDAQABo4GZMIGWMAkGA1UdEwQCMAAwHQYDVR0OBBYEFGEpG9oZGcfLMGNBkY7SgHiMGgTcMEgGA1UdIwRBMD+AFKOetkhnQhI2Qb1t4Lm0oFKLl/GzoRykGjAYMRYwFAYDVQQDDA1KZXRQcm9maWxlIENBggkA0myxg7KDeeEwEwYDVR0lBAwwCgYIKwYBBQUHAwEwCwYDVR0PBAQDAgWgMA0GCSqGSIb3DQEBCwUAA4ICAQC9WZuYgQedSuOc5TOUSrRigMw4/+wuC5EtZBfvdl4HT/8vzMW/oUlIP4YCvA0XKyBaCJ2iX+ZCDKoPfiYXiaSiH+HxAPV6J79vvouxKrWg2XV6ShFtPLP+0gPdGq3x9R3+kJbmAm8w+FOdlWqAfJrLvpzMGNeDU14YGXiZ9bVzmIQbwrBA+c/F4tlK/DV07dsNExihqFoibnqDiVNTGombaU2dDup2gwKdL81ua8EIcGNExHe82kjF4zwfadHk3bQVvbfdAwxcDy4xBjs3L4raPLU3yenSzr/OEur1+jfOxnQSmEcMXKXgrAQ9U55gwjcOFKrgOxEdek/Sk1VfOjvS+nuM4eyEruFMfaZHzoQiuw4IqgGc45ohFH0UUyjYcuFxxDSU9lMCv8qdHKm+wnPRb0l9l5vXsCBDuhAGYD6ss+Ga+aDY6f/qXZuUCEUOH3QUNbbCUlviSz6+GiRnt1kA9N2Qachl+2yBfaqUqr8h7Z2gsx5LcIf5kYNsqJ0GavXTVyWh7PYiKX4bs354ZQLUwwa/cG++2+wNWP+HtBhVxMRNTdVhSm38AknZlD+PTAsWGu9GyLmhti2EnVwGybSD2Dxmhxk3IPCkhKAK+pl0eWYGZWG3tJ9mZ7SowcXLWDFAk0lRJnKGFMTggrWjV8GYpw5bq23VmIqqDLgkNzuoog==


##32位支持
    sudo dpkg --add-architecture i386
    sudo apt-get install libc6-i386


##rc.local启动
    cd /etc/systemd/system/  
    cat rc-local.service  
> rc-local.service 

    #  SPDX-License-Identifier: LGPL-2.1+  
    #  
    #  This file is part of systemd.  
    #  
    #  systemd is free software; you can redistribute it and/or modify it  
    #  under the terms of the GNU Lesser General Public License as published by  
    #  the Free Software Foundation; either version 2.1 of the License, or  
    #  (at your option) any later version.  
      
    # This unit gets pulled automatically into multi-user.target by  
    # systemd-rc-local-generator if /etc/rc.local is executable.  
    [Unit]  
    Description=/etc/rc.local Compatibility  
    Documentation=man:systemd-rc-local-generator(8)  
    ConditionFileIsExecutable=/etc/rc.local  
    After=network.target  
      
    [Service]  
    Type=forking  
    ExecStart=/etc/rc.local start  
    TimeoutSec=0  
    RemainAfterExit=yes  
    GuessMainPID=no  
      
    [Install]  
    WantedBy=multi-user.target  
    Alias=rc-local.service  
>rc.local 

    touch /etc/rc.local
    chmod 755 /etc/rc.local 

>>test

    #!/bin/bash  
    echo "test rc " > /var/test.log 

##SublimeText 3
>加入到hosts文件

    127.0.0.1       www.sublimetext.com
    127.0.0.1       license.sublimehq.com

>License

    
    ----- BEGIN LICENSE -----
    sgbteam
    Single User License
    EA7E-1153259
    8891CBB9 F1513E4F 1A3405C1 A865D53F
    115F202E 7B91AB2D 0D2A40ED 352B269B
    76E84F0B CD69BFC7 59F2DFEF E267328F
    215652A3 E88F9D8F 4C38E3BA 5B2DAAE4
    969624E7 DC9CD4D5 717FB40C 1B9738CF
    20B3C4F1 E917B5B3 87C38D9C ACCE7DD8
    5F7EF854 86B9743C FADC04AA FB0DA5C0
    F913BE58 42FEA319 F954EFDD AE881E0B
    ------ END LICENSE ------

## Kuberctl
>Add apt key 

    sudo tsocks curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add 

>Next add a repository by creating the file /etc/apt/sources.list.d/kubernetes.list and enter the following content:

    deb http://apt.kubernetes.io/ kubernetes-xenial main


>Save and close that file. Install Kubernetes with the following commands:

    sudo tsocks apt-get update
    sudo tsocks apt-get install -y kubectl
