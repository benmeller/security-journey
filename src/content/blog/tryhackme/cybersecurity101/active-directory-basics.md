---
title: 'Active Directory Basics - THM Cybersecurity 101'
description: ''
pubDate: 'Jul 9 2025'
heroImage: 'cs101-tryhackme.png'
---

Agenda:
* What is an AD and AD Domain
* Components of AD
* Forests and domain trust

A Windows Domain is simply a group of computers and users under some common umbrella (e.g. a business, network), and it provides ways of thinking and working to centralise the administration of common components - such as user identities and security policies. This can allow you to log on to any computer within the domain using your own credentials, or it can allow the administrator to lockdown certain functionality on device. This is all configured on the server that runs these AD services, which is known as the Domain Controller (DC). You have seen this before when logging on to a corporate network where you may need to specify a domain e.g. `ENTERPRISE\username`.

Questions:
* `Active Directory` is the centralised repository in a windows domain
* The server in charge is called a `Domain Controller`


## Active Directory

The Active Directory Domain Service (AD DS) is a service that stores all the information on "objects" on the domain, such as users, groups, machines, printers, shares, etc. As we explore each of these, it's worth noting that in Windows terms, a "security principal" is an object that can be authenticated by the domain and assigned privileges over domain resources. As THM puts it: "A security principal is an object that can act upon resources in the network".
* User: Security principal that represents a person (e.g. employee) or service (such as IIS or MSSQL). N.b. A service must run as a user, so we often create dedicated user accounts that only have the privileges necessary to run that particular service.
* Machines: Security principal represented as a machine object in AD. This is created as soon as the device joins the network and is then assigned an account like a regular user, though it's permissions within the domain are limited. N.b. the machine still maintains a local administrator account with a password that is automatically rotated. Machine names are easy to identify; it is the computer's name followed by a dollar sign, e.g. `machine$`.
* Security groups: Security principal that can be comprised of multiple users or machines. This allows you to assign *permissions* to a group and then add users/machines (or even other groups) to the group to assign permissions. These are some default groups that come with a domain:
    * Domain Admins: can administer entire domain - any computer including the DCs
    * Server Operators: can administer domain controllers but can't change administrative group memberships
    * Backup Operators: can access any file regardless of permissions - used to perform backups of data
    * Account Operators: can create/modify domain accounts
    * Domain Users: all users on domain
    * Domain Computers: all computers on domain
    * Domain Controllers: all DCs on domain

### Active Directory Users and Computers

Using the Domain Controller, we can open this application which will then show us a hierarchy of users, computers and groups on the domain. Navigating to different users, you can modify/add users or reset their password. All of these entities are all placed in to Organizational Groups (OUs) which help to logically group things together. They are typically used to group together entities that have similar policy requirements, such as users in a particular department. N.b. users can only be placed in a single OU, though you can have one OU as a child of another. AD also comes with some default OUs: builtin, computers, domain controllers, users, managed service accounts. It is worth noting that OUs are used for *policy*, whereas security groups are used for *permissions over resources*.

Questions:
* Domain admins normally administer all computers and resources in a domain
* Machine account name for machine `TOM-PC` would be `TOM-PC$`
* Use Organizational Units to group the new QA department and apply policies.

### Managing Users in AD

You can create, edit and move people as needed using Active Directory Users and Computers. By default, it protects from accidental deletion. In AD, you can specify delegation - give some users specific privileges on to perform tasks on an OU without needing a domain admin. This could look like IT having the privileges to reset user passwords.

In the lab, we assigned the reset password permission to an IT user. That user can now use powershell commands to reset a password and specify a password reset at next logon:

```ps1
Set-ADAccountPassword <user> -Reset -NewPassword (Read-Host -AsSecureString -Prompt 'New Password') -Verbose
Set-ADUser -ChangePasswordAtLogon $true -Identity <user> -Verbose
```

Questions:
* Flag on Sophie's desktop: `THM{thanks_for_contacting_support}`
* The process of granting privileges to a user over some OU or other AD Object is called delegation

### Managing Computers in AD

By default, all computers will be in the `Computers` container. The general advice is to put the computers into groups based on use case so that policies can be applied. The typical categories are: workstation (where normal employees work), servers (used to provide services to users or other servers), domain controllers (these are deemed most sensitive as they contain password hashes).

Questions:
* How many laptops in workstation OU? 7
* Is it recommendable to create separate OUs for Servers and Workstations? (yay/nay) yay.

## Group Policies

In the above few sections, we moved some users and computers into different OUs. Let's now apply policies. Policies are stored as Group Policy Objects (GPOs) - these contain a collection of settings. Once created, they can be assigned to an OU. (N.b. child OUs will inherit the GPO too). When configuring a GPO, you can add rules that target users only, machines only, or both. As you edit a GPO, you can double click any property and go to the Explain tab for more information.

GPOs are distributed to the network using a network share called `SYSVOL` which is stored on the DCs (typically in `C:\Windows\SYSVOL\sysvol\`). Computers on the domain will periodically sync - typically within 2 hours or if forced via `gpupdate /force`. In the lab, we restricted access to the control panel and added an auto screen lock for 5 minutes of inactivity.

Questions:
* `SYSVOL` is the network share used to distribute GPOs
* Yes, GPOs can be used to apply settings to users and computers

## Authentication Methods

The DC stores all credentials on the domain. Computers can make requests to the DC to authenticate a user using either the Kerberos (default on newer Windows machines) or NetNTLM protocol (legacy). N.b. a lot of networks keep NetNTLM enabled for compatibility.

### Kerberos Authentication

Kerberos works by assigning *tickets* - a proof of previous authentication. This proof then allows the entity through to whatever they were trying to access. As we delve into the process, these are the entities involved:
* Client - the user's machine
* Key Distribution Center (KDC) - a service on the DC in charge of creating Kerberos tickets
* Ticket Granting Ticket (TGT) - a ticket granted by the KDC that will allow the user to request more tickets in future with different permissions. It is encrypted by the `krbtgt` account's password hash thus protecting it from the user accessing its contents. The TGT contains a copy of the SessionKey that is provided to the user. This allows the KDC to validate the session matches the TGT and frees the KDC from needing to store the  since it can be retrieved from the TGT.
* Ticket Granting Service (TGS) - a ticket that allows connection to a specific service. It is encrypted using a key derived from the Service Owner Hash. (The password hash of the user/machine account that the service runs under)
* Service Principal Name (SPN) - the name of a service and server name that the user intends to access
* ServiceSessionKey - A key that the service (SPN) will use to authenticate the user

Here is the process:
1. `User -> KDC: username, enc_pwd(timestamp)` - the timestamp is encrypted using a key derived from the user's password.
1. `KDC -> User: TGT, SessionKey` - the TGT will act in place of sending user credentials. The session key will be used to generate subsequent requests.
1. `User -> KDC: username, enc_SessionKey(timestamp), TGT, SPN` - user requests TGS to access the SPN.
1. `KDC -> User: enc_ServiceOwnerHash(TGS), ServiceSessionKey` - The TGS contains a copy of the ServiceSessionKey too.
1. `User -> Service: username, timestamp, enc_ServiceOwnerHash(TGS)` - establish connection. The service validates the service session key in the TGS

### NetNTLM Authentication

A challenge-response mechanism. This has been described in my blog post [Harvesting NTLM Credentials](../../htb-starting-point/harvesting-ntlm-creds.md). Copying it over to here:

1. `Client -> Server: domain\username`
2. `Server -> Client: challenge=random_string`
3. `Client -> Server: challenge_response=enc_userNtlmHash1(random_string)`
4. `Server -> DC: challenge_response`
5. `DC: Validate challenge_response` (n.b. it has access to the user's hash)
5. `DC -> Server: result`
6. `Server -> Client: Allow/deny`

N.b. when using a local account, the server can act in place of the DC since the account credentials would be stored in the SAM.

Questions:
* Will a current version of Windows use NetNTLM as the preferred authentication protocol by default? (yay/nay) Nay
* When referring to Kerberos, what type of ticket allows us to request further tickets known as TGS? Ticket Granting Ticket
* When using NetNTLM, is a user's password transmitted over the network at any point? (yay/nay) Nay

## Trees, Forests and Trusts

As enterprises grow, you may end up having more than one domain - e.g. different country, security zones, etc. Instead of having a single large domain with complex delegations, you can instead integrate multiple domains. If domains share the same namespace (e.g. `thm.local`), then the domains can be joined into a tree. (You can specify subdomains like `test.thm.local`). GPOs can be figured individually for each domain in the tree. Enterprise admins are a security group that allows admin privileges over all domains in a tree.

Forests integrate domains in different namespaces - e.g. two companies merge.

Trust relationships can be established in trees and forests to allow access to a shared network resource. e.g. User in domain A can access resource in domain B (this is a one-way trust relationship). Two-way is exactly what you'd expect. By default, joining domains as a tree or forest creates a two-way trust relationship.

Questions:
* What is a group of Windows domains that share the same namespace called? Tree
* What should be configured between two domains for a user in Domain A to access a resource in Domain B? A Trust Relationship
