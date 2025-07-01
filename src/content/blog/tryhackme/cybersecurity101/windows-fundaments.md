---
title: 'Windows Fundamentals Part 1 - THM Cybersecurity 101'
description: ''
pubDate: 'Jun 31 2025'
heroImage: 'cs101-tryhackme.png'
---

In this lesson, we shall cover:
* Filesystem
* System32 folders
* User accounts, profiles and permissions
* User account control (UAC)
* Settings and the Control Panel
* Task Manager

VM credentials: `administrator\letmein123!`

Windows dates back to 1985 with Windows 1 running on MS-DOS. Since then, we've had XP (the GOAT), Vista (lol), then versions 7, 8, 10 and 11. In that time, there have been many flavours for home, pro, server, etc.


## The File System - NTFS

Windows uses the "New Technology File System" (NTFS), which succeeds FAT16/32 (File Allocation Table) and HPFS (High Performance File System) and addresses some of their key limitations, such as:
* Max file size can now be bigger than 4GB
* Encryption of the filesystem is supported
* Compression of folders and files
* Permissions can be applied to individual folders and files

Beyond this, NTFS is a "journaling file system". This means it keeps a record of information in a log file and can use that in order to automatically repair damaged files/folders.


**File permissions**

Permissions in NTFS are quite different to the way permissions are managed on Linux (`rwx`, sticky bits, etc.). Within NTFS, you can apply the following permissions to files and folders:

| Permission | Description for Folder | Description for File |
| ---------- | ---------------------- | -------------------- |
| Read | View/list files and subfolders | View/access file contents |
| Write | Add files/subfolders | Write to file |
| Read & Execute | Same as 'Read' and able to execute files. This is inherited by files and subfolders | Same as read and able to execute the file |
| List folder contents | Same as 'Read & Execute'. Inherited only by folders | N/A |
| Modify | Read and write to files/subfolders. Delete folder | Read and write to file. Delete file |
| Full control | Read, write, change, delete files/subfolders | Read, write, change, delete file|

You can view the permissions of an item by inspecting the properties and going to the security tab. Windows also defines "special permissions". These really just appear to be different combinations of the aforementioned permissions. You can read more on it in the Microsoft [docs](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-2000-server/bb727008(v=technet.10)?redirectedfrom=MSDN).


**Alternate Data Streams (ADS)**

ADS is a file attribute that is specific to NTFS. Every file contains the `$DATA` file stream (i.e. the file contents). However NTFS supports more streams - these are called alternate. It can be used to record hidden data, and has been abused by many a malware in its time. It can essentially be a hidden file within a file. It can be used to store metadata. 

In an NTFS filesystem, you can add an ADS to the file by appending a colon and data stream name, such as `Myfile.txt:secretstuff`. You can write anything you want to it - text, images, etc, and it won't show up when listing directory contents.

## `Windows\System32` Folders

* `C:\Windows` typically contains the Windows OS and will be the value used for `%windir%` (the env variable for the Windows directory).
* `C:\Windows\System32` contains the most important files for the OS. When dealing in this folder, you can screw your machine up big time!

## User Accounts, Profiles, and Permissions

Windows users can be either:
* `Administrator`: Can make changes to system such as adding/deleting users, modifying groups and settings, install programs, etc. 
* `Standard User`: Can make changes to folders/files assigned to the user.

You can view existing user accounts on the system by:
* Searching `Other users` in the start menu or system settings. 
* Inspecting the directory `C:\Users`, which creates a folder when a user account is created and the user logs on to that machine
* Using `Local User and Group Management` (or `lusrmgr.msc`)