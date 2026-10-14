/**
 * Schema 驱动的表单验证
 * 基于 Zod + vee-validate 提供声明式验证。
 *
 * 默认错误信息通过 i18n 键（common.validation.*）从全局 i18n 实例取，
 * 避免硬编码文案；语言切换后可通过 `setValidationSchemas(t)` 重新生成。
 */

import { computed } from 'vue';
import { z } from 'zod';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';

export { toTypedSchema };

/**
 * i18n translator signature。传入 useUiT().t 即可。
 */
export type ValidationTranslator = (
  key: string,
  params?: Record<string, string | number>
) => string;

let activeTranslator: ValidationTranslator = (key, params) => {
  if (!params) return key;
  return key.replace(/\{(\w+)\}/g, (_, k: string) =>
    params[k] != null ? String(params[k]) : `{${k}}`,
  );
};

/** 由消费方或 useUiT 注入校验文案 */
export function setValidationTranslator(t: ValidationTranslator): void {
  activeTranslator = t;
}

const defaultT: ValidationTranslator = (key, params) => activeTranslator(key, params);

export interface UseSchemaFormOptions<T extends z.ZodType> {
  validationSchema: T;
  initialValues?: z.infer<T>;
  keepValuesOnUnmount?: boolean;
}

export function useSchemaForm<T extends z.ZodType>(
  options: UseSchemaFormOptions<T>
) {
  const { validationSchema, initialValues, keepValuesOnUnmount } = options;

  const typedSchema = toTypedSchema(validationSchema);

  const { values, errors, validate, resetForm, setFieldValue } = useForm({
    validationSchema: typedSchema,
    initialValues,
    keepValuesOnUnmount,
  });

  return {
    values,
    errors,
    validate,
    resetForm,
    setFieldValue,
    schema: validationSchema,
  };
}

export function useSchemaField<T extends z.ZodType>(
  fieldName: string,
  schema: T
) {
  const { value, errorMessage, meta, handleChange, handleBlur } = useField(
    fieldName,
    toTypedSchema(schema)
  );

  return {
    value,
    error: computed(() => errorMessage.value),
    isValid: computed(() => !errorMessage.value),
    isDirty: computed(() => meta.dirty),
    isTouched: computed(() => meta.touched),
    handleChange,
    handleBlur,
  };
}

/**
 * 预置校验 schema 工厂。
 * 调用时传入翻译函数（一般用 useUiT().t），返回的 schema 即包含当前语言文案。
 * 不传则使用默认 i18n。
 */
export function createValidationSchemas(t: ValidationTranslator = defaultT) {
  return {
    email: z.string().email(t('validation.email')),
    url: z.string().url(t('validation.url')),
    phone: z.string().regex(/^1[3-9]\d{9}$/, t('validation.phone')),

    required: (message?: string) =>
      z.string().min(1, message ?? t('validation.required')),

    minLength: (min: number, message?: string) =>
      z.string().min(min, message ?? t('validation.minLength', { count: min })),

    maxLength: (max: number, message?: string) =>
      z.string().max(max, message ?? t('validation.maxLength', { count: max })),

    rangeLength: (min: number, max: number, message?: string) =>
      z.string()
        .min(min, message ?? t('validation.rangeLength', { min, max }))
        .max(max),

    min: (min: number, message?: string) =>
      z.number().min(min, message ?? t('validation.min', { min })),

    max: (max: number, message?: string) =>
      z.number().max(max, message ?? t('validation.max', { max })),

    range: (min: number, max: number, message?: string) =>
      z.number()
        .min(min, message ?? t('validation.range', { min, max }))
        .max(max),

    pattern: (regex: RegExp, message?: string) =>
      z.string().regex(regex, message ?? t('validation.pattern')),

    modelName: z.string().regex(/^[A-Z][a-zA-Z0-9]*$/, t('validation.modelName')),

    fieldName: z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, t('validation.fieldName')),

    password: z.string().regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,32}$/,
      t('validation.password')
    ),

    idCard: z.string().regex(
      /^[1-9]\d{5}(?:18|19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,
      t('validation.idCard')
    ),

    ipv4: z.string().regex(
      /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
      t('validation.ipv4')
    ),

    port: z.number().int().min(0).max(65535, t('validation.port')),

    domain: z.string().regex(
      /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
      t('validation.domain')
    ),

    json: z.string().refine(
      (val) => {
        try {
          JSON.parse(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: t('validation.json') }
    ),

    uuid: z.string().uuid(t('validation.uuid')),

    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, t('validation.date')),

    datetime: z.string().regex(
      /^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/,
      t('validation.datetime')
    ),
  };
}

/**
 * 默认 schemas，初始为 i18n 当前语言。
 * 切换语言后请重新调用 `createValidationSchemas(t)` 获取新文案。
 */
export const validationSchemas = createValidationSchemas();

export function createSchema<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape);
}

export { z };
