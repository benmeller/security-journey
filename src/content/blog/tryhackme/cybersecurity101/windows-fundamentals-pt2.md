---
title: 'Windows Fundamentals Part 2 - THM Cybersecurity 101'
description: ''
pubDate: 'Jul 3 2025'
heroImage: 'cs101-tryhackme.png'
---

In this lesson, we shall cover:
* System configuration
* UAC settings
* Computer management
* System information
* Resource monitor
* Command prompt
* Registry editor


## System Configuration

`MSConfig` is a tool that is useful for advanced troubleshooting - particularly startup issues. You can use it to:
1. Manage startup - choose between normal, diagnostic and selective startup
1. Configure boot options (safe boot, show extra information, etc.)
1. Enable/disable any service (background task) configured on the system
1. Launch system tools to help configure/diagnose the OS further. 

To configure startup items, you can do that from from Task Manager.

Questions:
* Name of the service that lists System internals: PsShutdown
* Windows license is registered to Windows User
* Command for windows troubleshooting: `C:\Windows\System32\control.exe /name Microsoft.Troubleshooting`
* Command to open the control panel: `control.exe`

The next couple sections explore specific tools that are listed in the System Configuration 'Tools' tab.

### Change UAC Settings

With `UserAccountControlSettings.exe`, you can specify how often a user should be prompted for elevated privileges (always, only when apps make changes (don't notify changes to Windows settings), never)

### Computer Management

`compmgmt.msc` has three main sections: System Tools, Storage, and Services and Applications.

System Tools includes things like Task Scheduler, Event Viewer, Shared Folders, Sessions, Local Users and Groups, Performance, and Device Manager.
* Task Scheduler: This can be used to run something at some point. A task can be a script, application, etc., and can be triggered at a specific time or event (such as log on).
* Event Viewer: This is an audit trail to diagnose issues and examine what actions were executed on the computer. In Event Viewer, you can drill down through the log providers (i.e. who makes the logs). Once selected, you will see an overview/summary pane with an actions pane on the right. 
    * There are 5 log types `Error`, `Warning`, `Information`, `Success Audit`, `Failure Audit`. (The success/failure logs record any audited security access attempts such as log on)
    * Standard logs (i.e. logs produced by applications, security events, or the system) can be found under "Windows Logs"
* Shared Folders: View shares and folders on device that others can connect to. You can manage permissions in the folder's properties
* Sessions: View all users that are currently connected to a share on the device. You can see which files they have open too.
* Local Users and Groups: See Windows Fundamentals Pt 1
* Performance (Perfmon): View realtime or logged performance data such as memory consumption, network throughput, etc.
* Device manager: View and configure attached hardware

Storage includes:
* Windows Server Backup (applicable to Windows Server)
* Disk Management: Perform harddisk activities such as partitioning, setting up a new drive, changing a drive letter

Services and Applications allows you to do more than just view a list of services with the option to enable/disable. Here you can view the properties of the service.

Questions:
* Command to open Computer Management: `compmgmt.msc`
* GoogleUpdateTaskMachineUA scheduled to run at 6:15AM
* Hidden shared folder: `sh4r3dF0Ld3r`. (Note to self: is this hidden? Normally hidden folders end in `$`)

### System Information

`msinfo32.exe` gives a summary of the hardware resources, system components (such as hardware devices like display and input) and software environment. The software environment shows information about the OS and software that is installed on the system, such as drivers, env vars, services, loaded modules, etc. To find the info you're after, you can use the search bar at the bottom.

Questions:
* `msinfo32.exe` opens System Information
* System name is `THM-WINFUN2`
* ComSpec env var: `%SystemRoot%\system32\cmd.exe`

### Resource Monitor

`resmon.exe` displays metrics such as CPU, memory, disk and network usage information. It can also show in-use file handles and modules. All of these things can be displayed per process, or as an aggregation. It also includes a feature to look for deadlocked processes.

### Command Prompt

You know this one. What engineer doesn't? As mentioned in the lesson, some useful commands:
* `hostname`
* `whoami`
* `ipconfig`
* `netstat`: Display protocol stats and current TCP/IP connections, similar to Linux (though we should use `ss` in linux nowadays)
* `net`: Manage network resources - such as users on the computer

The help menu for a command can be retrieved using `/?`.

Questions:
* Full command in System Configuration for Internet Protocol Configuration: `C:\Windows\System32\cmd.exe /k %windir%\system32\ipconfig.exe`
* Show detailed info in `ipconfig` using the arg `/all`

### Registry Editor

The Windows Registry is a "central hierarchical database used to store information necessary to configure the system for one or more users, applications, and hardware devices". As Windows operates, it continually refers back to the registry to check information related to:
* User profiles
* Installed applications (and the document types it can create)
* What hardware exists on the system
* In-use ports
* A property sheet that stores settings for application and folder icons

Questions:
* `regedt32.exe` or `regedit.exe` can be used to open the registry editor

---

That was a whirlwind tour of the Windows System Configuration tool and brings us to the end of the Windows Fundamentals pt2 room. OF all the tools we looked at, some of them have shortcuts in the Start menu.