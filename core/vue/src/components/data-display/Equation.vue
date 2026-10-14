&lt;!--
Equation 数学方程组件

## 组件说明
数学方程组件，用于显示数学表达式，支持基本的数学符号和格式

## 公开属性
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| expression | string | '' | 数学表达式 |
| block | boolean | false | 是否以块级元素显示 |

## 事件
无

## 使用示例
```vue
&lt;template&gt;
  &lt;div&gt;
    &lt;!-- 内联方程 --&gt;
    &lt;p&gt;勾股定理：a&lt;sup&gt;2&lt;/sup&gt; + b&lt;sup&gt;2&lt;/sup&gt; = c&lt;sup&gt;2&lt;/sup&gt;&lt;/p&gt;
    
    &lt;!-- 块级方程 --&gt;
    &lt;Equation
      expression="x^2 + y^2 = r^2"
      :block="true"
    /&gt;
    
    &lt;!-- 分数 --&gt;
    &lt;Equation
      expression="1/2 + 1/3 = 5/6"
      :block="true"
    /&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import Equation from './Equation.vue';
&lt;/script&gt;
```
--&gt;
<template>
  <div
    :class="[
      'eq',
      {
        'eq--block': block,
        'eq--inline': !block
      }
    ]"
    v-html="sanitizedEquation"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  /**
   * Math equation expression
   */
  expression: string;
  /**
   * Whether to display as block level element
   */
  block?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  expression: '',
  block: false
});

// 简单的HTML转义函数，防止XSS攻击
const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// 格式化数学表达式
const formattedEquation = computed(() => {
  if (!props.expression) return '';
  
  // 先转义HTML，然后再处理数学符号
  let result = escapeHtml(props.expression);
  
  // 处理分数
  result = result.replace(/\/(\w+)/g, '<span class="eq__fraction">$1</span>');
  // 处理上标
  result = result.replace(/\^(\w+)/g, '<sup>$1</sup>');
  // 处理下标
  result = result.replace(/_(\w+)/g, '<sub>$1</sub>');
  
  return result;
});

// 最终渲染的安全方程
const sanitizedEquation = computed(() => {
  return formattedEquation.value;
});
</script>

<style scoped>
.eq {
  font-family: 'Times New Roman', serif;
  line-height: 1.5;
}

.eq--block {
  display: block;
  text-align: center;
  margin: 1rem 0;
}

.eq--inline {
  display: inline;
  vertical-align: middle;
}

.eq__fraction {
  display: inline-block;
  text-align: center;
  border-top: 1px solid currentColor;
  padding-top: 0.2em;
  margin: 0 0.2em;
}

sup, sub {
  font-size: 0.75em;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sup {
  top: -0.5em;
}

sub {
  bottom: -0.25em;
}
</style>