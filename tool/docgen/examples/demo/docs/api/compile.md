---
title: 编译 API
order: 3
---

# compile()

`compile()` 是 `@ocpui/markdown-core` 的统一编译入口。

```typescript
import { compile } from '@ocpui/markdown-core';

const result = await compile(markdown);
console.log(result.html);
```

参见 [指南](default:guide/intro.md)。
