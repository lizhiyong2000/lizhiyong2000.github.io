
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>KeepAlive</key>
    <true/>
    <key>Label</key>
    <string>frpc</string>
    <key>ProgramArguments</key>
    <array>
    <string>/usr/local/bin/frpc</string>
    <string>-c</string>
    <string>/usr/local/etc/frp/frpc.ini</string>
    </array>
  </dict>
</plist>
```

```
sudo launchctl load -w ~/Library/LaunchAgents/frpc.plist
```



sudo lsof -iTCP -sTCP:LISTEN -P -n

### openresty
HOMEBREW_NO_AUTO_UPDATE=1 brew install openresty/brew/openresty

sudo brew services start openresty
sudo brew services stop openresty


### realpath not found
brew install coreutils


### sshpass
brew install https://raw.githubusercontent.com/kadwanev/bigboybrew/master/Library/Formula/sshpass.rb



### ssh
1) add following lines to the “Host *” block of ~/.ssh/config
Host *
    UseKeychain yes
    AddKeysToAgent yes
Just add the snippet at the very beginning of ~/.ssh/config file if there is no existingHost * configuration block.

2) Then execute the following commands

ssh-keygen -t rsa

ssh-add -K ~/.ssh/id_rsa

ssh-add -A


## 参考链接
* [MacOS安装frp实现内网穿透](https://chy.mobi/linux-study/mac-os-frp-cross-innet.html)
