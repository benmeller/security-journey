---
title: 'TryHackMe Introduction - Cybersecurity 101'
description: ''
pubDate: 'Jun 21 2025'
heroImage: 'blog-placeholder-2.jpg'
---

After a brief haitus, I am back to dive into some more cybersecurity learnings. My reflection after having worked through some of the HackTheBox exercises is that there are still some fundamentals that I need to learn. Therefore, the next port of call is TryHackMe. I've had this recommended by a few people, and it looks like it covers a lot of the basics. With that said, I'll be capturing my notes from the course in the next few posts. My goal is that these notes will provide a good reference for me to look back on (especially once I build a good and proper search for this site).

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
*TODO*