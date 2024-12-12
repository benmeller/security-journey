---
title: 'Harvesting NTLM Credentials'
description: 'A summary of how to harvest NTLM credentials based on HTB Starting Point Tier 1 box "Responder"'
pubDate: 'Dec 1 2024'
heroImage: '/blog-placeholder-4.jpg'
---

## Responder Challenge Capture - Utilising `Responder`, `SMB` and Remote File Inclusion**  

This article is a high-level summary of the `Responder` challenge in HTB Starting Point Tier 1. It is purposely written as a high-level description in order to help myself conceptualise what is occurring in the exploit. To add some context to the challenge and to what is being achieved, we first begin by exploiting a PHP app that is unsafely using the `include()` function. Next, we attempt to utilise remote file inclusion to capture some NTLM credentials by triggering an SMB request back to our host machine. We capture the credentials by using the tool `Responder`, which sits listening for SMB connections.

Resources:
* [Places of Interest in Stealing NetNTLM Hashes - Osanda Malith](https://osandamalith.com/2017/03/24/places-of-interest-in-stealing-netntlm-hashes/)
* [Detailed Guide on Responder](https://www.hackingarticles.in/a-detailed-guide-on-responder-llmnr-poisoning/)

### The NTLM Protocol 

NTLM is a set of challenge-response Microsoft authentication protocols to authenticate a client resource on an AD domain. The general flow is as follows:

1. Client -> Server: `domain\username`
2. Server -> Client: `challenge=random_string`
3. Client -> Server: `challenge_response=enc(user_ntlm_hash_1, random_string)`
    * N.b. If we're being specific, the `challenge_response` is encrypted by HMAC-MD5 using the NTLM hash as the key
4. Server: Retrieve user password or equivalent to generate the user's NTLM hash
5. Server: `enc(user_ntlm_hash_2, random_string) == challenge_response` 

Useful concepts to know:
* Hash: a one-way function. You know this
* NTHash: This is the hash stored in the SAM DB or on domain controllers. It is the output of the hash algorithm used in the NTLM protocol
* NetNTLMv2: This is a specific string format used in the flow described above. This format has a particular way of capturing the challenge and the response. While not technically a hash, you may hear this referred to as a NetNTLMv2 hash. The reason for this is because it can be attacked in a very similar way to a hash.


### Responder 

#### LLMNR, MDNS Poisoning
Responder is a very capable tool. It is described as a LLMNR, NTB-NS and MDNS poisoner. These are all name resolution protocols. NTB-NS is the precursor to LLMNR. LLMNR and MDNS use multicast to resolve a hostname - it asks "who here is authoritatively known as the hostname in the query?". In MDNS, the device that responds informs all the other devices on the network too so that they may update their MDNS cache. 

The process of poisoning is when a malicious actor responds to the request saying "that's me (or I have access to that share)! Send me your creds and I'll authenticate you".

#### Poisoning through SMB

When a computer tries connecting with an SMB server for which the DNS server cannot resolve the hostname, the initiating device will send out an LLMNR query (multicast). If a share exists on the network, it can be accessed on the client machine by typing `\\<share-name>`. If it cannot be accessed, an error will be returned. Given this is a multicast, we can set up Responder to listen on the appropriate network interface to poison the multicast request. The client machine will see the challenge and prompt the user for credentials. However, even if the user doesn't enter their credentials, the hashes will be obtained!

#### Analyze Mode

By setting the `-A` flag, we can tell Responder not to poison any requests. Rather it will listen in and can be used to gather information like username, machine account, OS version, etc.


### The Exploit

In this challenge, we are using Responder as a malicious SMB server. Conceptually, we are getting the vulnerable site to attempt connecting to the SMB server. Responder is used to send a challenge back the client so it may authenticate itself. Once it receives the response from the client, it stores the result. Given that the user's domain + username is public and the challenge is known, we can attack this in a similar way to a hash. The encryption has no freshness (i.e. IV). By trying many different passwords (to generate the user ntlm hash), we can see if the output of the encryption returns the same results (using John The Ripper).

N.b. The exploit used in this HTB challenge didn't utilise this poisoning (i.e. responding to name resolution requests). Since the RFI pointed directly to our fake SMB server, the exploitation was completed leveraging the application's trust in our SMB server