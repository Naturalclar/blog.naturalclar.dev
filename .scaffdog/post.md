---
name: 'post'
root: './content/blog/'
output: './content/blog/'
questions:
  slug: 'Slug — the URL segment, English kebab-case (e.g. patching-with-pnpm)'
  title: 'Title — shown on the page, Japanese is fine'
  # The vocabulary lives in src/data/tags.json; these choices are a copy,
  # because scaffdog parses this frontmatter before it renders anything and
  # so cannot read the file. `readTags` in src/lib/posts.ts is what actually
  # enforces the list, and it fails the build on a tag that is not in the
  # JSON — so if the two ever diverge, the build says so rather than the
  # scaffold quietly offering a tag that no longer exists.
  tags:
    message: 'Tags — at least one, space to select'
    multiple: true
    choices:
      - 'react-native'
      - 'react'
      - 'typescript'
      - 'tooling'
      - 'conference'
      - 'retrospective'
      - 'memo'
ignore: []
---

# `{{ inputs.slug }}/index.md`

```markdown
---
title: '{{ inputs.title }}'
date: '{{ 'new Date().toISOString()' | eval }}'
tags: ['{{ inputs.tags | join "', '" }}']
---
```
