<template>
  <form :class="formClass" @submit.prevent="handleSubmit">
    <slot />
  </form>
</template>

<script setup lang="ts">
/**
 * 表单组件
 * @description 提供表单管理、验证和提交功能
 * 
 * @props {
 *   model?: Record<string, any>; // 表单数据模型
 *   rules?: Record<string, any[]>; // 验证规则
 *   labelPlacement?: 'left' | 'top'; // 标签位置
 *   labelWidth?: string | number; // 标签宽度
 *   disabled?: boolean; // 是否禁用
 *   size?: 'sm' | 'md' | 'lg'; // 尺寸
 *   customClass?: string; // 自定义类名
 * }
 * 
 * @emits {
 *   submit: [event: Event]; // 提交事件
 *   validate: [valid: boolean]; // 验证事件
 *   reset: []; // 重置事件
 * }
 * 
 * @example
 * // 基本使用
 * <Form @submit="handleSubmit">
 *   <FormItem label="姓名" prop="name">
 *     <Input v-model="form.name" />
 *   </FormItem>
 * </Form>
 * 
 * // 带验证规则
 * <Form :model="form" :rules="rules" @submit="handleSubmit">
 *   <FormItem label="姓名" prop="name">
 *     <Input v-model="form.name" />
 *   </FormItem>
 * </Form>
 */
import { computed, provide, reactive, ref, watch } from 'vue';
import { FORM_CONTEXT_KEY } from '@ocpui/vue/types';

interface FormItem {
  validate: () => Promise<boolean>;
  reset: () => void;
}

interface Props {
  model?: Record<string, any>;
  rules?: Record<string, any[]>;
  labelPlacement?: 'left' | 'top';
  labelWidth?: string | number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  model: () => ({}),
  rules: () => ({}),
  labelPlacement: 'top',
  labelWidth: 'auto',
  disabled: false,
  size: 'md',
  customClass: '',
});

const emit = defineEmits<{
  submit: [event: Event];
  validate: [valid: boolean];
  reset: [];
}>();

const formItems = ref<FormItem[]>([]);

const formClass = computed(() => {
  const classes = ['form', `form-${props.labelPlacement}`, `form-${props.size}`];
  if (props.disabled) {
    classes.push('form-disabled');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const registerItem = (item: FormItem) => {
  formItems.value.push(item);
};

const unregisterItem = (item: FormItem) => {
  const index = formItems.value.indexOf(item);
  if (index > -1) {
    formItems.value.splice(index, 1);
  }
};

const validate = async (): Promise<boolean> => {
  const results = await Promise.all(
    formItems.value.map(item => item.validate())
  );
  const valid = results.every(r => r);
  emit('validate', valid);
  return valid;
};

const reset = () => {
  formItems.value.forEach((item: FormItem) => item.reset());
  emit('reset');
};

const handleSubmit = async (event: Event) => {
  const valid = await validate();
  if (valid) {
    emit('submit', event);
  }
};

const formContext = reactive({
  model: props.model,
  rules: props.rules,
  disabled: props.disabled,
  size: props.size,
  labelPlacement: props.labelPlacement,
  labelWidth: props.labelWidth,
  registerItem,
  unregisterItem,
});

provide(FORM_CONTEXT_KEY, formContext);

// 监听 props 变化，更新 formContext
watch(() => props.model, (newModel) => {
  formContext.model = newModel;
}, { deep: true });

watch(() => props.rules, (newRules) => {
  formContext.rules = newRules;
}, { deep: true });

watch(() => props.disabled, (newDisabled) => {
  formContext.disabled = newDisabled;
});

watch(() => props.size, (newSize) => {
  formContext.size = newSize;
});

watch(() => props.labelPlacement, (newPlacement) => {
  formContext.labelPlacement = newPlacement;
});

watch(() => props.labelWidth, (newWidth) => {
  formContext.labelWidth = newWidth;
});

const getValues = () => {
  return { ...props.model };
};

defineExpose({
  validate,
  reset,
  getValues,
});
</script>

<style scoped>
.form {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  width: 100%;
}

.form-left {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-top {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-disabled {
  pointer-events: none;
  opacity: 0.6;
}

/* 尺寸变体 */
.form-sm {
  .form-left {
    gap: 16px;
  }
  
  .form-top {
    gap: 20px;
  }
}

.form-md {
  .form-left {
    gap: 20px;
  }
  
  .form-top {
    gap: 24px;
  }
}

.form-lg {
  .form-left {
    gap: 24px;
  }
  
  .form-top {
    gap: 28px;
  }
}

/* 响应式样式 */
@media (max-width: 768px) {
  .form-left {
    gap: 16px;
  }
  
  .form-top {
    gap: 20px;
  }
}

@media (max-width: 576px) {
  .form {
    padding: 0 8px;
  }
  
  .form-left {
    gap: 14px;
  }
  
  .form-top {
    gap: 18px;
  }
}
</style>