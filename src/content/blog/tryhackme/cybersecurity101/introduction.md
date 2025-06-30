---
title: 'TryHackMe Introduction - Cybersecurity 101'
description: ''
pubDate: 'Jun 21 2025'
heroImage: 'cs101-tryhackme.png'
---

After a brief haitus, I am back to dive into some more cybersecurity learnings. My reflection after having worked through some of the HackTheBox exercises is that there are still some fundamentals that I need to learn. Therefore, the next port of call is TryHackMe. I've had this recommended by a few people, and it looks like it covers a lot of the basics. With that said, I'll be capturing my notes from the course in the next few posts. My goal is that these notes will provide a good reference for me to look back on (especially once I build a good and proper search for this site).

The goal is to complete 'Cybersecurity 101'.

## Offensive Security Intro

Looks like this is going to cover `gobuster` for web enumeration. We've seen this before. It gives us a vm and a dummy site. It provides a lot of things for me. In this case, we'll use gobuster for path enumeration

```bash
$ gobuster dir -u fakebank.thm -w ./wordlist.txt

...
images (Status: 301)
/bank-transfer (Status: 200)
```

Navigating to `/bank-transfer` shows an unauthenticated admin portal where the user can move money from one account to another. From here, it's trivial to transfer some money. 


## Defensive Security Intro

This is all about preventing and detecting intrusions, i.e. blue team. Includes managing assets, patching systems, implementing preventative measures, logging, etc. The intro will cover: Security Operations Center (SOC), and Digital Forensics and Incident Response (DFIR).


### Security Operations Center (SOC)

SOC monitors network and system events for any anomalies. It typically keeps track of: vulnerabilities, policy violations, unauthorized activities and network intrusions. Part of this comes from threat intelligence - gathering info about potential and actual enemies, considering the ways they may disrupt or adversely affect a system. This may help the SOC look for specific pieces of information or tailor their monitoring efforts in a certain way. This intelligence comes from data - such as logs, public information, etc. Given all of this, the SOC can anticipate an attacker's activities.

A SOC may use a Security Information and Event Management (SIEM) tool to gather all the info and events in a single place to help with analysis and monitoring. Alerts can be configured in the system.


### Digital Forensics and Incident Response (DFIR)

**Digital Forensics**
Digital forensics examines the evidence of an attack to try and piece together a timeline and the path of exploitation. It typically involves examining: the file system, system memory, system logs and network logs. All of these areas are useful to help determine what files an attacker may have touched, where they executed their payload, etc.

**Incident Response**
Once something occurs, the thing that needs to happen is incident response. This can be after a vulnerability is exploited, or perhaps a misconfiguration shipped to prod. The goal is to limit damage, recover and restore service ASAP. There are 4 main phases of incident response:

1. Preparation: Create SOPs, implement controls, etc.
1. Detection and analysis
1. Containment, eradication, and recovery
1. Post-incident activity: examine what happened and implement actions based on lessons learned.


**Malware Analysis**
Another part of DFIR is malware analysis. There are a few types of malware:

* Virus: code that attaches to a program and spreads to other computers. It alters, overwrites and deletes files once it infects a computer.
* Trojan horse: A program that disguises itself as one thing but contains some malicious code and does another.
* Ransomware: A program that encrypts user files and demands a ransom for the decryption key. 

Malware analysis is comprised of static analysis and dynamic analysis. Static analysis involves inspecting the program without running it - such as reading through the assembly code (*and reverse engineering it?*). Dynamic analysis involves running the malware in a controlled environment to learn about its behavior.

### Practical Example

Look through the SIEM for a suspicious IP and look it up in a tool like AbuseIPDB or Cisco Talos Intelligence.


## Search Skills

This will cover: search engine skills, reading docs, social media and news outlets

I mean, the basics are covered. When reading something, evaluate the source, the evidence and reasoning, as well as their objectivity and bias. Obviously something is more supported if the story is corroborated and consistent.

**Search Engines**

Useful tools:
* "Quotes" can be used to find an exact match
* `site:` limits the search results to a particular domain name.
* `-<term>` omits any search results that contains `<term>`
* `filetype:` allows you to search for a filetype such as PDF
* 

More details [here](https://github.com/cipher387/Advanced-search-operators-list), specific to each search (such as OS, mail servers, search engines). Also see my OSINT guide that was written a few years ago [here](https://github.com/benmeller/OSINT-Guide)


**Specialized Search Engines**

Beyond the regular search engines, there are many specialised tools. This lesson covered a few that look at servers and applications exposed to the internet, a virus search engine and ol' faithful `haveibeenpwned`:
* [Shodan](https://www.shodan.io/): A search engine for internet-connected devices (such as servers, routers, webcams, IOT, etc.). It allows us to search for specific versions of servers or hardware based on the responses that the IP address returns.
* [Censys](https://search.censys.io/): Similar to Shodan, but is more focused on higher level information (such as transport and application layers) or as the lesson put it "internet-connected hosts". This includes websites, certs, domain names, open ports.
* [VirusTotal](https://www.virustotal.com/gui/home/upload): This collects a lot of virus scanning data and tells you what different products return for a given file, URL or hash.
* [Have I Been Pwned](https://haveibeenpwned.com/): This site collects credentials that have been exposed in a data breach and allows a user to search their own credentials to check whether they are vulnerable.


## Vulnerabilities and Exploits

Common Vulnerabilities and Exposures (CVE) is a program that captures reported vulnerabilities for software and hardware that is used across the computing world. It provides a standard identifier for vulns in the format `CVE-YYYY-12345`. This provides a common name for everyone to refer to the vulnerability. It is maintained by MITRE. You can look up existing CVEs at [cve.org](https://www.cve.org/) or the [National Vulnerability Database](https://nvd.nist.gov/).

Once vulnerabilities are found, you can often find POC exploits online. You may find these exploits on a code repository website such as GitHub. Alternatively, you can use the [Exploit Database](https://www.exploit-db.com/) which will list exploits from various authors.

## Technical Docs

* Linux manual: `man <tool>`
* [Microsoft Learn - technical docs](https://learn.microsoft.com/en-gb/)
* Product docs - such as Apache, Snort (IPS), Node, etc.

Note to self: You're an engineer. You know this.

## Social Media

Social media is a treasure trove of information - from Facebook to LinkedIn, there is so much to learn - key contacts and locations, answers to security questions, and beyond! You can try creating an ephemeral email address to sign up to these sites and explore without having the data linked back to you. (See [10minutemail.com](https://10minutemail.com/))