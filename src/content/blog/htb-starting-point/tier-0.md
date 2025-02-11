---
title: 'HTB Starting Point - Tier 0'
description: 'Hack the Box Starting Point'
pubDate: 'Nov 19 2024'
heroImage: 'blog-placeholder-3.jpg'
---

So begins my journey into HTB. I am starting right at the beginning. It means this will cover the basics, such as connecting anonymously to:
* FTP
* SMB
* Telnet
* Rsync
* RDP

It will also include some work with `nmap` and `MongoDB`

## Summmary

Tier 0 covers the very basics of the protocols Telnet, SMB and FTP, as well as a basic introduction to nmap and Redis. When trying to hit a box, a connectivity test is always helpful, using `ping`. Below are some of the highlights:

### 1. `nmap`

`nmap` is the go to scanning tool. For these boxes, we only used it for port scanning. By default, nmap only scans the first 1000 ports.

These are the main options used in this tutorial:
* `-sV`: Scan for service and version. Takes a little longer
* `-p{x}-{y}` or `-p{x}`: Specify port(s) to scan
* `--min-rate=x` or `-T5`: Specify minimum number of packets to send per second, or use a speed template (0-5). It is worth noting I didn't have as much success with the speed templates.
* `-sC`: Default script scan. Checks for a bunch of services
* `-F`: Fast scan to check the most common ports
* `-A`: enable OS detection, version detection, script scanning, and traceroute


### 2. Protocols (Telnet, SMB, FTP)

```bash
telnet <host>
ftp <host>
smbclient <host as UNC path>
```

FTP is unencrypted, sFTP is an extension of ssh to securely transfer files. You can try log in to an ftp server as user `anonymous` and simply enter an empty password. This may let you in. A status code of `230` indicates a successful login

`smbclient` is useful for connecting to Server Message Block servers. It can list out shares and prompt for credentials. Handy flag for us is `-N` to suppress the password prompt


### 3. Redis

Redis is an in-memory db. It is flat and doesn't have indexes. It stores everything as a key-value pair (where the key is a string and the value can be any object/document). Redis typically operates on port 6379. Can interact with it via the `redis-cli` and the server commands. N.b. that the server cli is not that helpful, so it is good to keep google and their docs on hand to look things up. Some of the server commands that are useful:
* `INFO` returns server info
* `SELECT` chooses an index. 
* `KEYS *` retrieves all keys
* `GET <key>` retrieves the value for a given key

<br />

---

## Connection  
Use OpenVPN with the `.ovpn` file they provide. Once on their network, you can ssh into the machine

```bash
sudo openvpn <conf>.ovpn
ssh <ip>
```

---

## Meow
*Telnet, nmap*

**Task 1**  
What does the acronym VM stand for?  
Virtual Machine


**Task 2**  
What tool do we use to interact with the operating system in order to issue commands via the command line, such as the one to start our VPN connection? It's also known as a console or shell.  
Terminal


**Task 3**  
What service do we use to form our VPN connection into HTB labs?  
OpenVPN


**Task 4**  
What tool do we use to test our connection to the target with an ICMP echo request?  
`ping`


**Task 5**  
What is the name of the most common tool for finding open ports on a target?  
`nmap` ([Docs](https://nmap.org/book/nse-usage.html))


**Task 6**  
What service do we identify on port 23/tcp during our scans?  

```bash
nmap -sC <ip>
```

`-sC` is the default script. It covers a lot of the basics. By default, `nmap` only scans the first 1000 ports.

Some other good options for quick scans:
* `-F`: scans the most common ports
* `-A`: enable OS detection, version detection, script scanning, and traceroute

From this we see tcp/23 is running telnet


**Task 7**  
What username is able to log into the target over telnet with a blank password?  

```bash
telnet <ip>
meow login: root
```

Root is a common account on Linux systems, so worth giving a shot here. In this case, it was correct.

**Task 8**  
Submit flag

```bash
cat flag.txt
```

---

## Fawn
*ftp, nmap*

**Task 1**  
What does the 3-letter acronym FTP stand for?  
File Transfer Protocol


**Task 2**  
Which port does the FTP service listen on usually?  
21 for control


**Task 3**  
FTP sends data in the clear, without any encryption. What acronym is used for a later protocol designed to provide similar functionality to FTP but securely, as an extension of the SSH protocol?  
SFTP


**Task 4**  
What is the command we can use to send an ICMP echo request to test our connection to the target?  
`ping`


**Task 5**  
From your scans, what version is FTP running on the target?  

```bash
nmap -sV <ip>
```

`-sV` is used to probe open ports and determine service/version info

This tells us ftp is using vsftpd 3.0.3

**Task 6**  
From your scans, what OS type is running on the target?  

* `-O` to enable OS detection. *n.b. This didn't return anything conclusive*
* `-sV` returned Service Info: OS: Unix based on the info from port 21


**Task 7**  
What is the command we need to run in order to display the 'ftp' client help menu?  
Answer was `ftp -?`, but generally `-h` is also valid...


**Task 8**  
What is username that is used over FTP when you want to log in without having an account?  
`anonymous`


**Task 9**  
What is the response code we get for the FTP message 'Login successful'?  
`230`


**Task 10**  
There are a couple of commands we can use to list the files and directories available on the FTP server. One is dir. What is the other that is a common way to list files on a Linux system.  
`ls`


**Task 11**  
What is the command used to download the file we found on the FTP server?  
`get`


**Task 12**  
Submit root flag  
`get flag.txt`

---

## Dancing
*SMB, nmap*

**Task 1**  
What does the 3-letter acronym SMB stand for?  
Server Message Block


**Task 2**  
What port does SMB use to operate at?  
445


**Task 3**  
What is the service name for port 445 that came up in our Nmap scan?

```bash
$ nmap -p445 <ip>

PORT    STATE SERVICE
445/tcp open  microsoft-ds
```


**Task 4**  
What is the 'flag' or 'switch' that we can use with the smbclient utility to 'list' the available shares on Dancing?  
`-L`


**Task 5**  
How many shares are there on Dancing?  

```bash
$ smbclient -L <ip> -N

Sharename       Type      Comment
---------       ----      -------
ADMIN$          Disk      Remote Admin
C$              Disk      Default share
IPC$            IPC       Remote IPC
WorkShares      Disk    
```

`-L` to list, `-N` to suppress password prompt. 
4 shares


**Task 6**  
What is the name of the share we are able to access in the end with a blank password?

```bash
smbclient //<ip>/WorkShares -N

smb: \>
```

WorkShares!

**Task 7**  
What is the command we can use within the SMB shell to download the files we find?  
`get`


**Task 8**  
Submit root flag

```bash
get James.P/flag.txt
```

---

## Redeemer  
*Redis, MongoDB*

**Task 1**  
Which TCP port is open on the machine?  

```bash
$ nmap $TARGET -p1-10000 --min-rate=5000

PORT     STATE    SERVICE
6379/tcp open     redis
```


**Task 2**  
Which service is running on the port that is open on the machine?  
Redis


**Task 3**  
What type of database is Redis? Choose from the following options: (i) In-memory Database, (ii) Traditional Database  
In-memory database


**Task 4**  
Which command-line utility is used to interact with the Redis server? Enter the program name you would enter into the terminal without any arguments.  
`redis-cli`


**Task 5**  
Which flag is used with the Redis command-line utility to specify the hostname?  
`-h <host>`

**Task 6**  
Once connected to a Redis server, which command is used to obtain the information and statistics about the Redis server?  
`INFO`

**Task 7**  
What is the version of the Redis server being used on the target machine?  
`5.0.7`

**Task 8**  
Which command is used to select the desired database in Redis?  
`SELECT`

**Task 9**  
How many keys are present inside the database with index 0?  

```sql
> SELECT 0

> DBSIZE 
(integer) 4

> info keyspace
# Keyspace
db0:keys=4,expires=0,avg_ttl=0
```


**Task 10**  
Which command is used to obtain all the keys in a database?  
`keys *`

**Task 11**  
Submit root flag  

```sql
SELECT 0
KEYS *
GET flag
```