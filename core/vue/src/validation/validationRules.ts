/**
 * 内置验证规则库
 * 提供常用的验证规则
 */

export interface ValidationRule<T> {
  valid: (value: T, context?: unknown) => boolean;
  message: string;
  code: string;
}

export interface ValidationRuleResult {
  valid: boolean;
  errors: Array<{
    message: string;
    code: string;
    value?: unknown;
  }>;
}

export const validationRules = {
  required: (message = '此字段必填'): ValidationRule<unknown> => ({
    valid: (value) => value !== undefined && value !== null && value !== '',
    message,
    code: 'required',
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    valid: (value) => (value?.length || 0) >= min,
    message: message || `最少${min}个字符`,
    code: 'minLength',
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    valid: (value) => (value?.length || 0) <= max,
    message: message || `最多${max}个字符`,
    code: 'maxLength',
  }),

  pattern: (regex: RegExp, message = '格式不正确'): ValidationRule<string> => ({
    valid: (value) => regex.test(value || ''),
    message,
    code: 'pattern',
  }),

  email: (message = '邮箱格式不正确'): ValidationRule<string> => ({
    valid: (value) => {
      if (!value) return true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message,
    code: 'email',
  }),

  url: (message = 'URL格式不正确'): ValidationRule<string> => ({
    valid: (value) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
    code: 'url',
  }),

  phone: (message = '手机号格式不正确'): ValidationRule<string> => ({
    valid: (value) => {
      if (!value) return true;
      const phoneRegex = /^1[3-9]\d{9}$/;
      return phoneRegex.test(value);
    },
    message,
    code: 'phone',
  }),

  number: (message = '必须是数字'): ValidationRule<unknown> => ({
    valid: (value) => !isNaN(Number(value)),
    message,
    code: 'number',
  }),

  integer: (message = '必须是整数'): ValidationRule<unknown> => ({
    valid: (value) => {
      const num = Number(value);
      return !isNaN(num) && Number.isInteger(num);
    },
    message,
    code: 'integer',
  }),

  min: (min: number, message?: string): ValidationRule<number> => ({
    valid: (value) => (value ?? 0) >= min,
    message: message || `最小值为${min}`,
    code: 'min',
  }),

  max: (max: number, message?: string): ValidationRule<number> => ({
    valid: (value) => (value ?? 0) <= max,
    message: message || `最大值为${max}`,
    code: 'max',
  }),

  range: (min: number, max: number, message?: string): ValidationRule<number> => ({
    valid: (value) => {
      const num = Number(value);
      return !isNaN(num) && num >= min && num <= max;
    },
    message: message || `值必须在${min}到${max}之间`,
    code: 'range',
  }),

  enum: <T>(values: T[], message?: string): ValidationRule<T> => ({
    valid: (value) => values.includes(value),
    message: message || `必须是以下值之一: ${values.join(', ')}`,
    code: 'enum',
  }),

  oneOf: (values: unknown[], message?: string): ValidationRule<unknown> => ({
    valid: (value) => values.includes(value),
    message: message || `必须是以下值之一: ${values.join(', ')}`,
    code: 'oneOf',
  }),

  notEmpty: (message = '不能为空'): ValidationRule<unknown> => ({
    valid: (value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim().length > 0;
      return value !== undefined && value !== null;
    },
    message,
    code: 'notEmpty',
  }),

  alphanumeric: (message = '只能包含字母和数字'): ValidationRule<string> => ({
    valid: (value) => /^[a-zA-Z0-9]*$/.test(value || ''),
    message,
    code: 'alphanumeric',
  }),

  numeric: (message = '只能包含数字'): ValidationRule<string> => ({
    valid: (value) => /^[0-9]*$/.test(value || ''),
    message,
    code: 'numeric',
  }),

  alpha: (message = '只能包含字母'): ValidationRule<string> => ({
    valid: (value) => /^[a-zA-Z]*$/.test(value || ''),
    message,
    code: 'alpha',
  }),

  pascalCase: (message = '必须是PascalCase格式'): ValidationRule<string> => ({
    valid: (value) => /^[A-Z][a-zA-Z0-9]*$/.test(value || ''),
    message,
    code: 'pascalCase',
  }),

  camelCase: (message = '必须是camelCase格式'): ValidationRule<string> => ({
    valid: (value) => /^[a-z][a-zA-Z0-9]*$/.test(value || ''),
    message,
    code: 'camelCase',
  }),

  snakeCase: (message = '必须是snake_case格式'): ValidationRule<string> => ({
    valid: (value) => /^[a-z][a-z0-9_]*$/.test(value || ''),
    message,
    code: 'snakeCase',
  }),

  date: (message = '日期格式不正确'): ValidationRule<string> => ({
    valid: (value) => {
      if (!value) return true;
      const date = new Date(value);
      return !isNaN(date.getTime());
    },
    message,
    code: 'date',
  }),

  dateISO: (message = '日期必须是ISO格式'): ValidationRule<string> => ({
    valid: (value) => {
      if (!value) return true;
      const date = new Date(value);
      return !isNaN(date.getTime()) && value.includes('T');
    },
    message,
    code: 'dateISO',
  }),
};

export function applyRules<T>(
  value: T,
  rules: ValidationRule<T>[]
): ValidationRuleResult {
  const errors: ValidationRuleResult['errors'] = [];

  for (const rule of rules) {
    if (!rule.valid(value)) {
      errors.push({
        message: rule.message,
        code: rule.code,
        value,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
