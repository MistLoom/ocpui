/**
 * 通用验证框架
 * 支持字段级验证和表单级验证
 */

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export type ValidatorRule<T> = (value: T, context?: unknown) => ValidationResult;

/**
 * 验证器类
 */
export class Validator<T = unknown> {
  private rules: Map<string, ValidatorRule<T>[]> = new Map();

  /**
   * 添加验证规则
   */
  addRule(field: string, rule: ValidatorRule<T>): this {
    if (!this.rules.has(field)) {
      this.rules.set(field, []);
    }
    this.rules.get(field)!.push(rule);
    return this;
  }

  /**
   * 验证整个对象
   */
  validate(data: Record<string, T>, context?: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    for (const [field, fieldRules] of this.rules) {
      const value = data[field];

      for (const rule of fieldRules) {
        const result = rule(value, context);
        if (!result.valid) {
          errors.push(...result.errors.map(e => ({ ...e, field })));
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证单个字段
   */
  validateField(field: string, value: T, context?: unknown): ValidationResult {
    const rules = this.rules.get(field) || [];
    const errors: ValidationError[] = [];

    for (const rule of rules) {
      const result = rule(value, context);
      if (!result.valid) {
        errors.push(...result.errors.map(e => ({ ...e, field })));
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 移除字段的所有规则
   */
  removeField(field: string): this {
    this.rules.delete(field);
    return this;
  }

  /**
   * 清除所有规则
   */
  clear(): this {
    this.rules.clear();
    return this;
  }
}

/**
 * 内置验证规则
 */
export const builtInRules = {
  /**
   * 必填验证
   */
  required: (message = '此字段必填'): ValidatorRule<unknown> => (value) => ({
    valid: value !== undefined && value !== null && value !== '',
    errors: value !== undefined && value !== null && value !== ''
      ? []
      : [{ field: '', message, code: 'required', value }],
  }),

  /**
   * 最小长度验证
   */
  minLength: (min: number, message?: string): ValidatorRule<string> => (value) => ({
    valid: (value?.length || 0) >= min,
    errors: (value?.length || 0) >= min
      ? []
      : [{ field: '', message: message || `最少${min}个字符`, code: 'minLength', value }],
  }),

  /**
   * 最大长度验证
   */
  maxLength: (max: number, message?: string): ValidatorRule<string> => (value) => ({
    valid: (value?.length || 0) <= max,
    errors: (value?.length || 0) <= max
      ? []
      : [{ field: '', message: message || `最多${max}个字符`, code: 'maxLength', value }],
  }),

  /**
   * 正则表达式验证
   */
  pattern: (regex: RegExp, message = '格式不正确'): ValidatorRule<string> => (value) => ({
    valid: regex.test(value || ''),
    errors: regex.test(value || '')
      ? []
      : [{ field: '', message, code: 'pattern', value }],
  }),

  /**
   * 唯一性验证
   */
  unique: <T>(
    items: T[],
    getter: (item: T) => unknown,
    message = '该值已存在',
  ): ValidatorRule<unknown> => (value) => {
    const exists = items.some(item => getter(item) === value);
    return {
      valid: !exists,
      errors: exists ? [{ field: '', message, code: 'unique', value }] : [],
    };
  },

  /**
   * 枚举值验证
   */
  enum: <T>(values: T[], message?: string): ValidatorRule<T> => (value) => ({
    valid: values.includes(value),
    errors: values.includes(value)
      ? []
      : [{ field: '', message: message || `必须是以下值之一: ${values.join(', ')}`, code: 'enum', value }],
  }),

  /**
   * 自定义验证
   */
  custom: <T>(
    validator: (value: T) => boolean,
    message: string,
    code = 'custom',
  ): ValidatorRule<T> => (value) => ({
    valid: validator(value),
    errors: validator(value) ? [] : [{ field: '', message, code, value }],
  }),
};

/**
 * 组合多个验证规则
 */
export function combineRules<T>(...rules: ValidatorRule<T>[]): ValidatorRule<T> {
  return (value: T, context?: unknown): ValidationResult => {
    const errors: ValidationError[] = [];

    for (const rule of rules) {
      const result = rule(value, context);
      if (!result.valid) {
        errors.push(...result.errors);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  };
}

/**
 * Vue组合式函数：使用验证器
 */
export function useValidator<T>() {
  const validator = new Validator<T>();

  return {
    addRule: validator.addRule.bind(validator),
    validate: validator.validate.bind(validator),
    validateField: validator.validateField.bind(validator),
    removeField: validator.removeField.bind(validator),
    clear: validator.clear.bind(validator),
  };
}
