<!--
PasswordStrengthMeter 密码强度指示器组件

## 组件说明
密码强度指示器组件，用于显示密码强度评估结果

## 公开属性
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| score | number | 0 | 密码强度分数 |
| strength | 'weak' \| 'medium' \| 'strong' \| 'very-strong' | 'weak' | 密码强度等级 |
| label | string | '密码强度' | 标签文本 |
| checks | PasswordChecks | undefined | 密码检查结果 |
| showDetails | boolean | true | 是否显示详细检查结果 |
| estimatedCrackTime | string | '' | 预计破解时间 |
| customClass | string | '' | 自定义类名 |

## 事件
无

## 使用示例
```vue
<template>
  <PasswordStrengthMeter
    :score="passwordScore"
    :strength="passwordStrength"
    :checks="passwordChecks"
    :showDetails="true"
    :estimatedCrackTime="crackTime"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PasswordStrengthMeter from './PasswordStrengthMeter.vue';

const passwordScore = ref(75);
const passwordStrength = ref('strong');
const passwordChecks = ref({
  minLength: true,
  uppercase: true,
  lowercase: true,
  numbers: true,
  specialChars: false,
  notCommon: true,
  notSequential: true,
  notRepeated: true
});
const crackTime = ref('约 4 年');
</script>
```
-->
<template>
  <div :class="meterClass">
    <div class="strength-header">
      <span v-if="displayLabel" class="strength-label">{{ displayLabel }}</span>
      <div class="strength-info">
        <span class="strength-score">{{ score }}%</span>
        <Tag :variant="strengthVariant" size="sm" class="strength-tag">
          {{ strengthLabel }}
        </Tag>
      </div>
    </div>

    <div class="strength-bars">
      <div
        v-for="i in 4"
        :key="i"
        class="strength-bar"
        :class="{
          'strength-bar--active': i <= activeBars,
          [`strength-bar--${getBarVariant(i)}`]: i <= activeBars,
        }"
      />
    </div>

    <div v-if="showDetails && checks" class="strength-details">
      <div
        v-for="(passed, key) in checks"
        :key="key"
        class="strength-check-item"
        :class="{ 'strength-check-item--passed': passed }"
      >
        <Icon :name="passed ? 'check-circle' : 'x-circle'" :size="14" />
        <span>{{ getCheckLabel(key) }}</span>
      </div>
    </div>

    <div v-if="estimatedCrackTime" class="strength-estimate">
      <Icon name="clock" :size="12" />
      <span>{{ t('components.dataDisplay.passwordStrengthMeter.estimatedCrackTime', { time: estimatedCrackTime }) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Tag from './Tag.vue';
import { Icon } from '../utility';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

interface PasswordChecks {
  minLength?: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
  numbers?: boolean;
  specialChars?: boolean;
  notCommon?: boolean;
  notSequential?: boolean;
  notRepeated?: boolean;
}

interface Props {
  score: number;
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  label?: string;
  checks?: PasswordChecks;
  showDetails?: boolean;
  estimatedCrackTime?: string;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  score: 0,
  strength: 'weak',
  label: undefined,
  checks: undefined,
  showDetails: true,
  estimatedCrackTime: '',
  customClass: '',
});

const displayLabel = computed(() => props.label ?? t('components.dataDisplay.passwordStrengthMeter.label'));

const meterClass = computed(() => {
  const classes = ['password-strength-meter'];
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const strengthVariant = computed(() => {
  const variants: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
    weak: 'error',
    medium: 'warning',
    strong: 'success',
    'very-strong': 'primary',
  };
  return variants[props.strength] || 'default';
});

const strengthLabel = computed(() => {
  const keyMap: Record<string, string> = {
    weak: 'weak',
    medium: 'medium',
    strong: 'strong',
    'very-strong': 'veryStrong',
  };
  const key = keyMap[props.strength] || 'unknown';
  return t(`components.dataDisplay.passwordStrengthMeter.strengthLabels.${key}`);
});

const activeBars = computed(() => {
  if (props.score >= 81) return 4;
  if (props.score >= 61) return 3;
  if (props.score >= 41) return 2;
  if (props.score >= 1) return 1;
  return 0;
});

const getBarVariant = (barIndex: number) => {
  if (barIndex === 1) return 'weak';
  if (barIndex === 2) return 'medium';
  if (barIndex === 3) return 'strong';
  return 'very-strong';
};

const getCheckLabel = (key: string): string => {
  return t(`components.dataDisplay.passwordStrengthMeter.checkLabels.${key}`) || key;
};
</script>

<script lang="ts">
export default { name: 'PasswordStrengthMeter' };
</script>

<style scoped>
.password-strength-meter {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: hsl(var(--surface-container-high));
  border-radius: 12px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.strength-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.strength-label {
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--text));
}

.strength-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.strength-score {
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--text-secondary));
}

.strength-tag {
  font-weight: 600;
}

.strength-bars {
  display: flex;
  gap: 4px;
  height: 6px;
}

.strength-bar {
  flex: 1;
  background: hsl(var(--border));
  border-radius: 3px;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.strength-bar--active {
  border-radius: 3px;
}

.strength-bar--weak {
  background: hsl(var(--error));
}

.strength-bar--medium {
  background: hsl(var(--warning));
}

.strength-bar--strong {
  background: hsl(var(--success));
}

.strength-bar--very-strong {
  background: hsl(var(--primary));
}

.strength-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 16px;
  padding-top: 12px;
  border-top: 1px solid hsl(var(--border));
}

.strength-check-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: hsl(var(--text-muted));
  transition: color 0.2s;
}

.strength-check-item :deep(svg) {
  color: hsl(var(--text-muted));
  transition: color 0.2s;
}

.strength-check-item--passed {
  color: hsl(var(--success));
}

.strength-check-item--passed :deep(svg) {
  color: hsl(var(--success));
}

.strength-estimate {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: 12px;
  border-top: 1px solid hsl(var(--border));
  font-size: 12px;
  color: hsl(var(--text-secondary));
}

.strength-estimate :deep(svg) {
  color: hsl(var(--text-muted));
}

/* 响应式 */
@media (max-width: 575.98px) {
  .password-strength-meter {
    padding: 12px;
    gap: 10px;
  }

  .strength-label {
    font-size: 13px;
  }

  .strength-score {
    font-size: 13px;
  }

  .strength-bars {
    height: 8px;
  }

  .strength-bar {
    border-radius: 4px;
  }

  .strength-bar--active {
    border-radius: 4px;
  }

  .strength-details {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .strength-check-item {
    font-size: 13px;
  }

  .strength-estimate {
    font-size: 13px;
  }
}
</style>
