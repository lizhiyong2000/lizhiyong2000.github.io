### Homebrew切换国内源

+ 替换为阿里源

```shell
# 替换brew.git:
cd "$(brew --repo)"
git remote set-url origin https://mirrors.aliyun.com/homebrew/brew.git
# 替换homebrew-core.git:
cd "$(brew --repo)/Library/Taps/homebrew/homebrew-core"
git remote set-url origin https://mirrors.aliyun.com/homebrew/homebrew-core.git
# 应用生效
brew update
# 替换homebrew-bottles:
echo 'export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.aliyun.com/homebrew/homebrew-bottles' >> ~/.bash_profile
source ~/.bash_profile
```


### LaunchPad图标重置

```shell
sudo find /private/var/folders/ \( -name com.apple.dock.iconcache -or -name com.apple.iconservices \) -exec rm -rfv {} \;

sudo rm -rf /Library/Caches/com.apple.iconservices.store;

defaults write com.apple.dock ResetLaunchPad -bool true

killall Dock

killall Finder
```


### 软件重新签名：

codesign --force --deep --sign - /Applications/name.app






### FRP自启动

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

### 查看监听端口

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
