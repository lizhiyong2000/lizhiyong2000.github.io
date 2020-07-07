# Provides UDP syslog reception
$ModLoad imudp
$UDPServerRun 514

# Provides TCP syslog reception
$ModLoad imtcp
$InputTCPServerRun 514


$template Remote,"/var/log/host/%fromhost-ip%/%$YEAR%-%$MONTH%-%$DAY%.log"                           
:fromhost-ip, !isequal, "127.0.0.1" ?Remote

*.*        @@192.168.1.100