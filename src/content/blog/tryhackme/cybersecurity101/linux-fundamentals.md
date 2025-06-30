---
title: 'Linux Fundamentals - THM Cybersecurity 101'
description: ''
pubDate: 'Jun 30 2025'
heroImage: 'cs101-tryhackme.png'
---

Since this lesson will cover a lot of things I already know, the details captured in this post may be fairly light on. Something I didn't know: Linux was first released in 1991! 

The basic commands covered included: `echo`, `whoami`, `ls`, `cd`, `cat`, `pwd`. All the standard stuff, so I'm not going bother writing down notes for this. Search tools like `find` and `grep` are great to have under the belt too, e.g.

```bash
$ find -name *.txt

$ grep "10.0.0.1" access.log
```

## Shell Operators

A lot of these I know already, but capturing here for reference.

| Operator | Description |
| -------- | ----------- |
| &        | Run process in background. Use `fg` to bring it back in focus |
| &&       | Chain commands together. N.b. It will only chain if the first command is successful |
| >        | Redirect output of command to another command or to a file. Will overwrite a pre-existing file |
| >>       | Append output of command to a file |

---

There are 2 more parts to the linux fundamentals in the premium plan. I will come back to them if needed, particularly since I have a familiarity with Linux already. For now, I shall continue on the parts of the course that are free.