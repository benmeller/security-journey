---
title: 'Windows Fundamentals Part 3 - THM Cybersecurity 101'
description: ''
pubDate: 'Jul 8 2025'
heroImage: 'cs101-tryhackme.png'
---

This lesson will give an overview of Windows security features. This will cover:
* Windows Updates
* Windows Security
* Virus & Threat protection
* Firewall & network protection
* App & browser control
* Device security
* Bitlocker
* Volume shadow copy service

## Windows Updates

This is a Microsoft service for system and MS application updates (security patches, features, etc.). It's known as Patch Tuesday (2nd Tuesday of the month), though updates can be pushed out at any time - especially critical updates. Microsoft updates typically result in a reboot, and what's even more annoying is that these updates can only be postponed. At least in a corporate environment it can only be postponed so long before you may be forced into a lengthy update (who hasn't experienced this?). 

## Windows Security

This is another pane in Settings that allows you to protect your device and data. This includes: virus & threat protection, firewall & network protection, app & browser control; and device security. Each of these will have a r/y/g flag to indicate action required, recommendation or all good.

### Virus & Threat Protection

This is one of the areas within Windows Security and contains Current Threats, and Virus & Thread Protection Settings. The first allows you to scan your machine - for common virus location, check all files, or somewhere inbetween. You can then see your last scan, and any threats - quarantined or allowed. 

The virus & threat protection settings allows you to enable:
* Real-time protection - locate and stop malware from installing and running on your device
* Cloud-delivered protection - get the latest threat info from the cloud
* Automatic sample submission - send samples to Microsoft for analysis
* Controlled folder access - protect certain files, folders and memory
* Exclusions - don't scan with Microsoft Defender
* Notifications

Beyond that, you can check for updates and manage ransomware protection.

Question:
* Real-time protection is turned off

### Firewall & Network Protection

You know what a firewall is - allowing/denying ingress/egress traffic on different ports. Microsoft provide 3 out of the box: private, domain and public. Public is the default firewall that is applied to any new network you join; you can assign the private firewall to a network if you wish; domain applies when the computer is connected to a network with a domain controller. You can view and change the *applications* that are allowed through a firewall. This happens in a control panel window.

Question:
* The firewall profile that would apply for airport wifi would be the `public network` profile

### App & Browser Control

This is the settings for Microsoft Defender SmartScreen. This protects against phishing, malware websites, apps and files. You can set it to block, warn or not do anything.

### Device Security

This is some extra stuff that is covered briefly. Device security details: Core Isolation (which can provide memory integrity), and the security processor (ahh the old TPM. This hasn't caused any issues ever). The Trusted Platform Module (TPM) provides security-related functions from a hardware chip. This means it can complete cryptographically secure functions. It is tamper resistant - both at a hardware and software level.

## BitLocker

BitLocker is used to encrypt the hard drive. According to Microsoft, it works best when leveraged with a newer TPM module. BitLocker supports the need for a PIN or a removable device that contains a startup key - and in this way, BitLocker achieves 2FA. It's worth noting that when using BitLocker without TPM, you lose the pre-boot system integrity verification.

Question:
* We should use a removable drive on systems without TPM > 1.2. What should the drive contain? Startup key


## Volume Shadow Copy Service (VSS)

This service is used to generate shadow copies/snapshots/point-in-time copies of data that is waiting to be backed up. A shadow copy can be made of each drive that has protection enabled. Once enabled you can create and delete shadow copies, restore your system from a copy, and configure the restore settings. Ransomware often looks for these files and will delete them to make recovery even more difficult for the victim.


## Final Notes

An extra resource that was pointed out was Living off the Land. This is an approach attackers use on Windows where they leverage a lot of system services to move throughout the system undetected. It provides a bunch of binaries, scripts and libraries [here](https://lolbas-project.github.io/). 