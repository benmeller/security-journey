---
title: 'Crocodile - HTB Starting Point Tier 1'
description: 'Writeup for Crocodile box'
pubDate: 'Nov 26 2024'
heroImage: 'blog-placeholder-2.jpg'
---

## Crocodile
*Apache, FTP, Website Structure Discovery*

**Task 1**  
What Nmap scanning switch employs the use of default scripts during a scan?  
`-sC`


**Task 2**  
What service version is found to be running on port 21?  
```bash
$ nmap -sC $TARGET

PORT   STATE SERVICE
21/tcp open  ftp
| ftp-syst:
|   STAT:
| FTP server status:
|      Connected to ::ffff:$HOST_IP
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 3
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
| -rw-r--r--    1 ftp      ftp            33 Jun 08  2021 allowed.userlist
|_-rw-r--r--    1 ftp      ftp            62 Apr 20  2021 allowed.userlist.passwd
80/tcp open  http
|_http-title: Smash - Bootstrap Business Template

Nmap done: 1 IP address (1 host up) scanned in 19.67 seconds
```

`vsFTPd 3.0.3`


**Task 3**  
What FTP code is returned to us for the "Anonymous FTP login allowed" message?  
`340` (see task 2)


**Task 4**  
After connecting to the FTP server using the ftp client, what username do we provide when prompted to log in anonymously?  
`anonymous`


**Task 5**  
After connecting to the FTP server anonymously, what command can we use to download the files we find on the FTP server?  
```bash
kali$ ftp anonymous@$TARGET

ftp> ls
ftp> get <file>
```

Answer: `get`


**Task 6**  
What is one of the higher-privilege sounding usernames in 'allowed.userlist' that we download from the FTP server?  
`admin`


**Task 7**  
What version of Apache HTTP Server is running on the target host?  
```
nmap -sV --version-all -p80 $TARGET

PORT   STATE SERVICE VERSION
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
```


**Task 8**  
What switch can we use with Gobuster to specify we are looking for specific filetypes?  
`gobuster dir -x`


**Task 9**  
Which PHP file can we identify with directory brute force that will provide the opportunity to authenticate to the web service?  
```bash
kali$ gobuster dir -x php -u $TARGET -w ~/Documents/git/SecLists/Discovery/Web-Content/common.txt
===============================================================
Gobuster v3.6
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.129.68.207
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /home/kali/Documents/git/SecLists/Discovery/Web-Content/common.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.6
[+] Extensions:              php
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/.htaccess            (Status: 403) [Size: 278]
/.htaccess.php        (Status: 403) [Size: 278]
/.htpasswd            (Status: 403) [Size: 278]
/.hta.php             (Status: 403) [Size: 278]
/.hta                 (Status: 403) [Size: 278]
/.htpasswd.php        (Status: 403) [Size: 278]
/assets               (Status: 301) [Size: 315] [--> http://10.129.68.207/assets/]
/config.php           (Status: 200) [Size: 0]
/css                  (Status: 301) [Size: 312] [--> http://10.129.68.207/css/]
/dashboard            (Status: 301) [Size: 318] [--> http://10.129.68.207/dashboard/]
/fonts                (Status: 301) [Size: 314] [--> http://10.129.68.207/fonts/]
/index.html           (Status: 200) [Size: 58565]
/js                   (Status: 301) [Size: 311] [--> http://10.129.68.207/js/]
/login.php            (Status: 200) [Size: 1577]
/logout.php           (Status: 302) [Size: 0] [--> login.php]
/server-status        (Status: 403) [Size: 278]
Progress: 8173 / 9472 (86.29%)^C
[!] Keyboard interrupt detected, terminating.
Progress: 8173 / 9472 (86.29%)
===============================================================
Finished
===============================================================
```


**Task 10**  
Submit root flag  

From connecting to the ftp server earlier, we got the user list and their passwords:
```bash
kali$ cat allowed.userlist
aron
pwnmeow
egotisticalsw
admin

kali$ cat allowed.userlist.passwd
root
Supersecretpassword1
@BaASD&9032123sADS
rKXM59ESxesUFHAd
```

Logging in as admin takes you to the dashboard with the flag
