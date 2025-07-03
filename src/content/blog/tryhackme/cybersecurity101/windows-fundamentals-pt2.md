---
title: 'Windows Fundamentals Part 2 - THM Cybersecurity 101'
description: ''
pubDate: 'Jul 2 2025'
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


More on this lesson coming soon...
