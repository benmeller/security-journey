---
title: 'HTB Starting Point - Tier 0'
description: 'Hack the Box Starting Point'
pubDate: 'Nov 19 2024'
heroImage: '/blog-placeholder-3.jpg'
draft: true
---

# HTB Tier 0

So begins my journey into HTB. I am starting right at the beginning. It means this will cover the basics, such as connecting anonymously to:
* FTP
* SMB
* Telnet
* Rsync
* RDP

It will also include some work with `nmap` and `MongoDB`

## Connection

Use OpenVPN with the `.ovpn` file they provide. Once on their network, you can ssh into the machine

```bash
sudo openvpn <conf>.ovpn
ssh <ip>
```

---

## Meow

Telnet, nmap

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

`nmap -sC <ip>`

`-sC` is the default script. It covers a lot of the basics. Some other good options for quick scans:
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

ftp, nmap

**Task 1**  
What does the 3-letter acronym FTP stand for?

File Transfer Protocol


**Task 2**  
Which port does the FTP service listen on usually?

21 for control, 20 for data


**Task 3**  
FTP sends data in the clear, without any encryption. What acronym is used for a later protocol designed to provide similar functionality to FTP but securely, as an extension of the SSH protocol?

SFTP


**Task 4**  
What is the command we can use to send an ICMP echo request to test our connection to the target?

Ping


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

SMB, nmap

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