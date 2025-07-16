---
title: 'Windows Command Line - THM Cybersecurity 101'
description: ''
pubDate: 'Jul 16 2025'
heroImage: 'cs101-tryhackme.png'
---

This module will look at the command line. You already know a fair bit, so these notes will be brief.

## Windows Command Prompt

Basic commands:
* `set`: View system info, including the current path.
* `ver`: Show windows version
* `systeminfo`: More in depth info about system, processor, memory, etc.

Network:
* `ipconfig {/all}` shows details of the different network interfaces on the device
* `ping <IP>`: yep.
* `tracert`: Trace route - view all the hops made by a network request to a destination
* `nslookup <domain> {IP Addr}`: Show IP address associated with domain name, optionally using a name server specified by IP address (like `1.1.1.1`)
* `netstat {-abon}`: Show current network connections and listening ports.

Directories:
* `cd`: yep
* `dir`: view child directories
* `tree`: View child directories and subdirectories as a tree
* `mkdir`, `rmdir`: yep

Files:
* `type`: View file contents
* `more`: A program to display text files
* `copy`: Copy file A to file B
* `move`: yep
* `del`/`erase`: Delete a file

Tasks and Processes:
* `tasklist`: Show running processes
* `taskkill /PID <pid>`: Kill process

Other:
* `chkdsk`: Check file system and disk volumes for errors and bad sectors
* `driverquery`: Display list of installed drivers
* `sfc /scannow`: Scan system files for corruption and repair if possible.


Powershell and Linux command lines were premium rooms :'(. Skipping them for now.