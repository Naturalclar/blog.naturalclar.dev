---
name: 'post'
message: 'Enter Title of your article (no space)'
root: './content/blog/'
output: './content/blog/'
ignore: []
---

# {{ input }}/index.md`

```markdown
---
title: '{{ input }}'
date: '{{ 'new Date().toISOString()' | eval }}'
---
```
