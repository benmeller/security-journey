---
title: 'Responder - HTB Starting Point Tier 1'
description: 'Writeup for Responder box'
pubDate: 'Nov 29 2024'
heroImage: '/blog-placeholder-2.jpg'
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

Read a high level summary of this challenge [here](/blog/htb-starting-point/harvesting-ntlm-creds).
