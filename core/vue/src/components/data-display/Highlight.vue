<!--
Highlight 文本高亮组件

## 组件说明
文本高亮组件，用于高亮显示文本中的关键词

## 公开属性
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| text | string | '' | 要显示的文本 |
| keywords | string \| string[] | '' | 要高亮的关键词 |
| caseSensitive | boolean | false | 是否区分大小写 |
| highlightStyle | 'default' \| 'primary' \| 'warning' \| 'error' | 'default' | 高亮样式 |
| customClass | string | '' | 自定义类名 |

## 事件
无

## 使用示例
```vue
<template>
  <div>
    <Highlight
      text="这是一段包含关键词的文本，关键词是关键词"
      :keywords="['关键词']"
      highlightStyle="primary"
    />
  </div>
</template>

<script setup lang="ts">
import Highlight from './Highlight.vue';
</script>
```
-->
<template>
  <span :class="highlightClass">
    <template v-for="(part, index) in parts" :key="index">
      <mark v-if="part.highlight" class="highlight-mark">{{ part.text }}</mark>
      <span v-else>{{ part.text }}</span>
    </template>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  text: string;
  keywords: string | string[];
  caseSensitive?: boolean;
  highlightStyle?: 'default' | 'primary' | 'warning' | 'error';
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
  keywords: '',
  caseSensitive: false,
  highlightStyle: 'default',
  customClass: '',
});

const highlightClass = computed(() => {
  const classes = ['highlight', `highlight--${props.highlightStyle}`];
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const keywordArray = computed(() => {
  if (Array.isArray(props.keywords)) {
    return props.keywords.filter(k => k.trim());
  }
  return props.keywords ? [props.keywords] : [];
});

const parts = computed(() => {
  if (!props.text || keywordArray.value.length === 0) {
    return [{ text: props.text, highlight: false }];
  }

  const result: Array<{ text: string; highlight: boolean }> = [];
  let remainingText = props.text;
  const flags = props.caseSensitive ? 'g' : 'gi';

  while (remainingText.length > 0) {
    let earliestMatch: { index: number; length: number } | null = null;

    for (const keyword of keywordArray.value) {
      const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      const match = regex.exec(remainingText);
      
      if (match && (earliestMatch === null || match.index < earliestMatch.index)) {
        earliestMatch = { index: match.index, length: match[0].length };
      }
    }

    if (earliestMatch) {
      if (earliestMatch.index > 0) {
        result.push({
          text: remainingText.substring(0, earliestMatch.index),
          highlight: false,
        });
      }
      
      result.push({
        text: remainingText.substring(earliestMatch.index, earliestMatch.index + earliestMatch.length),
        highlight: true,
      });
      
      remainingText = remainingText.substring(earliestMatch.index + earliestMatch.length);
    } else {
      result.push({ text: remainingText, highlight: false });
      break;
    }
  }

  return result;
});
</script>

<style scoped>
.highlight {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.highlight-mark {
  padding: 0 2px;
  border-radius: 3px;
  font-weight: 500;
}

.highlight--default .highlight-mark {
  background: hsl(var(--primary) / 0.15);
  color: hsl(var(--primary));
}

.highlight--primary .highlight-mark {
  background: hsl(var(--primary) / 0.2);
  color: hsl(var(--primary));
}

.highlight--warning .highlight-mark {
  background: hsl(var(--warning) / 0.2);
  color: hsl(var(--warning));
}

.highlight--error .highlight-mark {
  background: hsl(var(--error) / 0.2);
  color: hsl(var(--error));
}
</style>