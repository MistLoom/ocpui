/**
 * 全局校验器系统
 * 支持通过 validatorType 属性自动匹配校验规则
 */

import { ref, unref, readonly, type ComputedRef, type Ref } from 'vue';

export type ValidatorType =
  | 'email'
  | 'url'
  | 'phone'
  | 'required'
  | 'number'
  | 'integer'
  | 'positiveNumber'
  | 'password'
  | 'username'
  | 'modelName'
  | 'fieldName'
  | 'camelCase'
  | 'pascalCase'
  | 'snakeCase'
  | 'kebabCase'
  | 'date'
  | 'datetime'
  | 'time'
  | 'ip'
  | 'ipv4'
  | 'ipv6'
  | 'port'
  | 'domain'
  | 'slug'
  | 'color'
  | 'hexColor'
  | 'json'
  | 'base64'
  | 'uuid'
  | 'creditCard'
  | 'chinese'
  | 'english'
  | 'idCard'
  | 'zipCode'
  | 'qq'
  | 'wechat';

export interface GlobalValidatorRule {
  pattern?: RegExp;
  validate?: (value: unknown, context?: ValidationContext) => boolean | string;
  message: string;
  code: string;
}

export interface ValidationContext {
  form?: Record<string, unknown>;
  field?: string;
  label?: string;
  [key: string]: unknown;
}

export interface GlobalValidationResult {
  valid: boolean;
  message?: string;
  code?: string;
}

export type ValidatorFunction = (
  value: unknown,
  context?: ValidationContext
) => GlobalValidationResult;

export interface ValidatorConfig {
  type: ValidatorType;
  rules: GlobalValidatorRule[];
  async?: boolean;
  debounce?: number;
}

const EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const URL_PATTERN = /^(https?:\/\/)?(([\da-z.-]+)\.([a-z.]{2,6})|localhost|(\d{1,3}\.){3}\d{1,3})(:[\d]+)?(\/[\w#%&()+./:=?@~-]*)?$/i;
const PHONE_PATTERN = /^1[3-9]\d{9}$/;
const USERNAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]{2,19}$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,32}$/;
const MODEL_NAME_PATTERN = /^[A-Z][a-zA-Z0-9]*$/;
const FIELD_NAME_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const CAMEL_CASE_PATTERN = /^[a-z][a-zA-Z0-9]*$/;
const PASCAL_CASE_PATTERN = /^[A-Z][a-zA-Z0-9]*$/;
const SNAKE_CASE_PATTERN = /^[a-z][a-z0-9_]*$/;
const KEBAB_CASE_PATTERN = /^[a-z][a-z0-9-]*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/;
const TIME_PATTERN = /^\d{2}:\d{2}:\d{2}$/;
const IPV4_PATTERN = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
const IPV6_PATTERN = /^(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$|^::(?:[a-fA-F0-9]{1,4}:){0,6}[a-fA-F0-9]{1,4}$|^(?:[a-fA-F0-9]{1,4}:){1,7}:$|^(?:[a-fA-F0-9]{1,4}:){0,6}::(?:[a-fA-F0-9]{1,4}:){0,5}[a-fA-F0-9]{1,4}$/;
const DOMAIN_PATTERN = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX_COLOR_PATTERN = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const BASE64_PATTERN = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const CREDIT_CARD_PATTERN = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$/;
const CHINESE_PATTERN = /^[\u4e00-\u9fa5]+$/;
const ENGLISH_PATTERN = /^[a-zA-Z]+$/;
const ID_CARD_PATTERN = /^[1-9]\d{5}(?:18|19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
const ZIP_CODE_PATTERN = /^\d{6}$/;
const QQ_PATTERN = /^[1-9]\d{4,10}$/;
const WECHAT_PATTERN = /^[a-zA-Z][-_a-zA-Z0-9]{5,19}$/;

export const builtInValidators: Record<ValidatorType, ValidatorConfig> = {
  email: {
    type: 'email',
    rules: [
      { pattern: EMAIL_PATTERN, message: '请输入有效的邮箱地址', code: 'email' },
    ],
  },
  url: {
    type: 'url',
    rules: [
      { pattern: URL_PATTERN, message: '请输入有效的URL地址', code: 'url' },
    ],
  },
  phone: {
    type: 'phone',
    rules: [
      { pattern: PHONE_PATTERN, message: '请输入有效的手机号码', code: 'phone' },
    ],
  },
  required: {
    type: 'required',
    rules: [
      {
        validate: (value) => {
          if (value === undefined || value === null) return false;
          if (typeof value === 'string') return value.trim().length > 0;
          if (Array.isArray(value)) return value.length > 0;
          return true;
        },
        message: '此字段为必填项',
        code: 'required',
      },
    ],
  },
  number: {
    type: 'number',
    rules: [
      {
        validate: (value) => !isNaN(Number(value)),
        message: '请输入有效的数字',
        code: 'number',
      },
    ],
  },
  integer: {
    type: 'integer',
    rules: [
      {
        validate: (value) => Number.isInteger(Number(value)),
        message: '请输入整数',
        code: 'integer',
      },
    ],
  },
  positiveNumber: {
    type: 'positiveNumber',
    rules: [
      {
        validate: (value) => Number(value) > 0,
        message: '请输入正数',
        code: 'positiveNumber',
      },
    ],
  },
  password: {
    type: 'password',
    rules: [
      { pattern: PASSWORD_PATTERN, message: '密码需包含大小写字母和数字，长度8-32位', code: 'password' },
    ],
  },
  username: {
    type: 'username',
    rules: [
      { pattern: USERNAME_PATTERN, message: '用户名需以字母开头，3-20位字母数字下划线', code: 'username' },
    ],
  },
  modelName: {
    type: 'modelName',
    rules: [
      { pattern: MODEL_NAME_PATTERN, message: '模型名称必须为PascalCase格式', code: 'modelName' },
    ],
  },
  fieldName: {
    type: 'fieldName',
    rules: [
      { pattern: FIELD_NAME_PATTERN, message: '字段名称必须以字母或下划线开头', code: 'fieldName' },
    ],
  },
  camelCase: {
    type: 'camelCase',
    rules: [
      { pattern: CAMEL_CASE_PATTERN, message: '必须为camelCase格式', code: 'camelCase' },
    ],
  },
  pascalCase: {
    type: 'pascalCase',
    rules: [
      { pattern: PASCAL_CASE_PATTERN, message: '必须为PascalCase格式', code: 'pascalCase' },
    ],
  },
  snakeCase: {
    type: 'snakeCase',
    rules: [
      { pattern: SNAKE_CASE_PATTERN, message: '必须为snake_case格式', code: 'snakeCase' },
    ],
  },
  kebabCase: {
    type: 'kebabCase',
    rules: [
      { pattern: KEBAB_CASE_PATTERN, message: '必须为kebab-case格式', code: 'kebabCase' },
    ],
  },
  date: {
    type: 'date',
    rules: [
      { pattern: DATE_PATTERN, message: '请输入有效的日期格式 (YYYY-MM-DD)', code: 'date' },
    ],
  },
  datetime: {
    type: 'datetime',
    rules: [
      { pattern: DATETIME_PATTERN, message: '请输入有效的日期时间格式', code: 'datetime' },
    ],
  },
  time: {
    type: 'time',
    rules: [
      { pattern: TIME_PATTERN, message: '请输入有效的时间格式 (HH:mm:ss)', code: 'time' },
    ],
  },
  ip: {
    type: 'ip',
    rules: [
      {
        validate: (value) => IPV4_PATTERN.test(String(value)) || IPV6_PATTERN.test(String(value)),
        message: '请输入有效的IP地址',
        code: 'ip',
      },
    ],
  },
  ipv4: {
    type: 'ipv4',
    rules: [
      { pattern: IPV4_PATTERN, message: '请输入有效的IPv4地址', code: 'ipv4' },
    ],
  },
  ipv6: {
    type: 'ipv6',
    rules: [
      { pattern: IPV6_PATTERN, message: '请输入有效的IPv6地址', code: 'ipv6' },
    ],
  },
  port: {
    type: 'port',
    rules: [
      {
        validate: (value) => {
          const port = Number(value);
          return Number.isInteger(port) && port >= 0 && port <= 65535;
        },
        message: '请输入有效的端口号 (0-65535)',
        code: 'port',
      },
    ],
  },
  domain: {
    type: 'domain',
    rules: [
      { pattern: DOMAIN_PATTERN, message: '请输入有效的域名', code: 'domain' },
    ],
  },
  slug: {
    type: 'slug',
    rules: [
      { pattern: SLUG_PATTERN, message: '请输入有效的slug格式', code: 'slug' },
    ],
  },
  color: {
    type: 'color',
    rules: [
      {
        validate: (value) => {
          if (HEX_COLOR_PATTERN.test(String(value))) return true;
          if (/^(rgb|rgba|hsl|hsla)\([^)]+\)$/i.test(String(value))) return true;
          return CSS.supports('color', String(value));
        },
        message: '请输入有效的颜色值',
        code: 'color',
      },
    ],
  },
  hexColor: {
    type: 'hexColor',
    rules: [
      { pattern: HEX_COLOR_PATTERN, message: '请输入有效的十六进制颜色值', code: 'hexColor' },
    ],
  },
  json: {
    type: 'json',
    rules: [
      {
        validate: (value) => {
          try {
            JSON.parse(String(value));
            return true;
          } catch {
            return false;
          }
        },
        message: '请输入有效的JSON格式',
        code: 'json',
      },
    ],
  },
  base64: {
    type: 'base64',
    rules: [
      { pattern: BASE64_PATTERN, message: '请输入有效的Base64编码', code: 'base64' },
    ],
  },
  uuid: {
    type: 'uuid',
    rules: [
      { pattern: UUID_PATTERN, message: '请输入有效的UUID', code: 'uuid' },
    ],
  },
  creditCard: {
    type: 'creditCard',
    rules: [
      { pattern: CREDIT_CARD_PATTERN, message: '请输入有效的信用卡号', code: 'creditCard' },
    ],
  },
  chinese: {
    type: 'chinese',
    rules: [
      { pattern: CHINESE_PATTERN, message: '请输入中文字符', code: 'chinese' },
    ],
  },
  english: {
    type: 'english',
    rules: [
      { pattern: ENGLISH_PATTERN, message: '请输入英文字母', code: 'english' },
    ],
  },
  idCard: {
    type: 'idCard',
    rules: [
      { pattern: ID_CARD_PATTERN, message: '请输入有效的身份证号', code: 'idCard' },
    ],
  },
  zipCode: {
    type: 'zipCode',
    rules: [
      { pattern: ZIP_CODE_PATTERN, message: '请输入有效的邮政编码', code: 'zipCode' },
    ],
  },
  qq: {
    type: 'qq',
    rules: [
      { pattern: QQ_PATTERN, message: '请输入有效的QQ号', code: 'qq' },
    ],
  },
  wechat: {
    type: 'wechat',
    rules: [
      { pattern: WECHAT_PATTERN, message: '请输入有效的微信号', code: 'wechat' },
    ],
  },
};

class GlobalValidator {
  private validators: Map<ValidatorType, ValidatorConfig> = new Map();
  private customValidators: Map<string, ValidatorFunction> = new Map();

  constructor() {
    Object.entries(builtInValidators).forEach(([type, config]) => {
      this.validators.set(type as ValidatorType, config);
    });
  }

  register(type: ValidatorType, config: ValidatorConfig): void {
    this.validators.set(type, config);
  }

  registerCustom(name: string, validator: ValidatorFunction): void {
    this.customValidators.set(name, validator);
  }

  getValidator(type: ValidatorType): ValidatorConfig | undefined {
    return this.validators.get(type);
  }

  validate(
    value: unknown,
    type: ValidatorType | ValidatorType[],
    context?: ValidationContext
  ): GlobalValidationResult {
    const types = Array.isArray(type) ? type : [type];

    for (const t of types) {
      const config = this.validators.get(t);
      if (!config) continue;

      for (const rule of config.rules) {
        const result = this.applyRule(value, rule, context);
        if (!result.valid) {
          return result;
        }
      }
    }

    return { valid: true };
  }

  validateCustom(
    value: unknown,
    name: string,
    context?: ValidationContext
  ): GlobalValidationResult {
    const validator = this.customValidators.get(name);
    if (!validator) {
      console.warn(`Custom validator "${name}" not found`);
      return { valid: true };
    }
    return validator(value, context);
  }

  private applyRule(
    value: unknown,
    rule: GlobalValidatorRule,
    context?: ValidationContext
  ): GlobalValidationResult {
    if (rule.validate) {
      const result = rule.validate(value, context);
      if (result === true) {
        return { valid: true };
      }
      return {
        valid: false,
        message: typeof result === 'string' ? result : rule.message,
        code: rule.code,
      };
    }

    if (rule.pattern) {
      const isValid = rule.pattern.test(String(value ?? ''));
      return {
        valid: isValid,
        message: isValid ? undefined : rule.message,
        code: isValid ? undefined : rule.code,
      };
    }

    return { valid: true };
  }

  getValidatorTypes(): ValidatorType[] {
    return Array.from(this.validators.keys());
  }

  hasValidator(type: ValidatorType): boolean {
    return this.validators.has(type);
  }
}

export const globalValidator = new GlobalValidator();

export function validateByType(
  value: unknown,
  type: ValidatorType | ValidatorType[],
  context?: ValidationContext
): GlobalValidationResult {
  return globalValidator.validate(value, type, context);
}

export function registerValidator(type: ValidatorType, config: ValidatorConfig): void {
  globalValidator.register(type, config);
}

export function registerCustomValidator(name: string, validator: ValidatorFunction): void {
  globalValidator.registerCustom(name, validator);
}

export interface UseFieldValidationOptions {
  validatorType?: ValidatorType | ValidatorType[];
  customRules?: GlobalValidatorRule[];
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  validate?: (value: unknown) => boolean | string;
  message?: string;
  debounce?: number;
  name?: string;
}

export function useFieldValidation(
  value: Ref<unknown> | ComputedRef<unknown>,
  options: UseFieldValidationOptions = {}
) {
  const error = ref<string>('');
  const isValid = ref(true);
  const isDirty = ref(false);
  const isTouched = ref(false);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const getValidatorType = (): ValidatorType | ValidatorType[] | undefined => {
    if (options.validatorType) {
      return options.validatorType;
    }
    
    // 从 name 属性推断校验类型
    if (options.name) {
      const name = options.name.toLowerCase();
      if (name.includes('email')) return 'email';
      if (name.includes('phone') || name.includes('tel')) return 'phone';
      if (name.includes('url') || name.includes('website')) return 'url';
      if (name.includes('password') || name.includes('pass')) return 'password';
      if (name.includes('username') || name.includes('user')) return 'username';
      if (name.includes('ak') || name.includes('access') || name.includes('api') && name.includes('key')) return 'password';
      if (name.includes('sk') || name.includes('secret')) return 'password';
    }
    
    return undefined;
  };

  const validate = (): boolean => {
    const val = unref(value);

    if (options.required) {
      if (val === undefined || val === null || val === '') {
        error.value = options.message || '此字段为必填项';
        isValid.value = false;
        return false;
      }
    }

    if (options.minLength !== undefined && typeof val === 'string') {
      if (val.length < options.minLength) {
        error.value = `最少需要 ${options.minLength} 个字符`;
        isValid.value = false;
        return false;
      }
    }

    if (options.maxLength !== undefined && typeof val === 'string') {
      if (val.length > options.maxLength) {
        error.value = `最多允许 ${options.maxLength} 个字符`;
        isValid.value = false;
        return false;
      }
    }

    if (options.min !== undefined) {
      if (Number(val) < options.min) {
        error.value = `最小值为 ${options.min}`;
        isValid.value = false;
        return false;
      }
    }

    if (options.max !== undefined) {
      if (Number(val) > options.max) {
        error.value = `最大值为 ${options.max}`;
        isValid.value = false;
        return false;
      }
    }

    if (options.pattern && !options.pattern.test(String(val))) {
      error.value = options.message || '格式不正确';
      isValid.value = false;
      return false;
    }

    const validatorType = getValidatorType();
    if (validatorType) {
      const result = validateByType(val, validatorType);
      if (!result.valid) {
        error.value = result.message || options.message || '验证失败';
        isValid.value = false;
        return false;
      }
    }

    if (options.customRules) {
      for (const rule of options.customRules) {
        if (rule.pattern && !rule.pattern.test(String(val))) {
          error.value = rule.message;
          isValid.value = false;
          return false;
        }
        if (rule.validate) {
          const result = rule.validate(val);
          if (result !== true) {
            error.value = typeof result === 'string' ? result : rule.message;
            isValid.value = false;
            return false;
          }
        }
      }
    }

    if (options.validate) {
      const result = options.validate(val);
      if (result !== true) {
        error.value = typeof result === 'string' ? result : options.message || '验证失败';
        isValid.value = false;
        return false;
      }
    }

    error.value = '';
    isValid.value = true;
    return true;
  };

  const debouncedValidate = options.debounce
    ? () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(validate, options.debounce);
      }
    : validate;

  const markDirty = () => {
    isDirty.value = true;
  };

  const markTouched = () => {
    isTouched.value = true;
  };

  const reset = () => {
    error.value = '';
    isValid.value = true;
    isDirty.value = false;
    isTouched.value = false;
  };

  return {
    error: readonly(error),
    isValid: readonly(isValid),
    isDirty: readonly(isDirty),
    isTouched: readonly(isTouched),
    validate,
    debouncedValidate,
    markDirty,
    markTouched,
    reset,
  };
}

export { ref, computed, unref, readonly, watch } from 'vue';
