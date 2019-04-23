常用的OpenSSL命令

这些命令可生成CSR，证书，私钥，并执行其他任务。

生成新的私钥和证书签名请求

    openssl req -out server.csr -new -newkey rsa:2048 -nodes -keyout server.key

生成自签名证书

    openssl req -x509 -sha256 -nodes -days 3650 -newkey rsa:2048 -keyout server.key -out server.crt

生成现有私钥的证书签名请求（CSR）

    openssl req -out CSR.csr -key privateKey.key -new

根据现有证书生成证书签名请求

    openssl x509 -x509toreq -in certificate.crt -out CSR.csr -signkey privateKey.key

从私钥中删除密码

    openssl rsa -in privateKey.pem -out newPrivateKey.pem

使用OpenSSL进行检查

如果需要检查证书，CSR或私钥中的信息，请使用这些命令。

检查证书签名请求（CSR）

    openssl req -text -noout -verify -in CSR.csr

检查私钥

    openssl rsa -in privateKey.key -check

检查证书

    openssl x509 -in certificate.crt -text -noout

检查PKCS＃12文件（.pfx或.p12）

    openssl pkcs12 -info -in keyStore.p12


  ## 验证证书与key是否配对
   openssl rsa -in server.key -pubout -text
openssl x509 -in server.crt -pubkey -noout -text


使用OpenSSL进行调试

如果收到私有密码与证书不匹配或安装到站点的证书不受信任的错误，请尝试其中一个命令。尝试验证SSL证书是否正确安装，请查看SSL Checker。

检查公钥的MD5哈希值，以确保它与CSR或私有密钥相匹配。

    openssl x509 -noout -modulus -in certificate.crt | openssl md5

    openssl rsa -noout -modulus -in privateKey.key | openssl md5

    openssl req -noout -modulus -in CSR.csr | openssl md5

检查SSL连接。应显示所有证书（包括中间体）

    openssl s_client -connect www.paypal.com:443

使用OpenSSL进行转换

下面命令是将证书和密钥转换为不同的格式，使其与特定类型的服务器或软件兼容。例如，可以将适用于Apache的普通PEM文件转换为PFX（PKCS＃12）文件，并将其用于Tomcat或IIS。或使用SSL转换器转换证书。

将DER文件（.crt .cer .der）转换为PEM

    openssl x509 -inform der -in certificate.cer -out certificate.pem

将PEM文件转换为DER

    openssl x509 -outform der -in certificate.pem -out certificate.der

将包含私钥和证书的PKCS＃12文件（.pfx .p12 ）转换为PEM

    openssl pkcs12 -in keyStore.pfx -out keyStore.pem -nodes

添加-nocerts输出私钥或添加-nokeys输出证书。

将PEM证书文件和私钥转换为PKCS＃12（.pfx .p12）

    openssl pkcs12 -export -out certificate.pfx -inkey privateKey.key -in certificate.crt -certfile CACert.crt
