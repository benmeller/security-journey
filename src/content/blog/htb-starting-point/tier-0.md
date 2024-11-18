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

## Meow

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

