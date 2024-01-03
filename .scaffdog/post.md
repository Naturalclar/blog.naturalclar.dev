---
name: 'post'
root: './content/blog/'
output: './content/blog/'
questions:
  title: 'Enter Title of your article (no space)'
ignore: []
---

# {{ inputs.title }}/index.md`

```markdown
---
title: '{{ inputs.title }}'
date: '{{ 'new Date().toISOString()' | eval }}'
---
```
