/**
 * JSON Schema 验证器
 * 支持 JSON Schema Draft-07 规范的子集
 */

export interface Schema {
  type?: string;
  properties?: Record<string, Schema>;
  required?: string[];
  items?: Schema;
  enum?: unknown[];
  const?: unknown;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  oneOf?: Schema[];
  allOf?: Schema[];
  anyOf?: Schema[];
  not?: Schema;
  $ref?: string;
  definitions?: Record<string, Schema>;
}

export interface SchemaValidationResult {
  valid: boolean;
  errors: SchemaError[];
}

export interface SchemaError {
  path: string;
  message: string;
  keyword: string;
  value?: unknown;
}

export class SchemaValidator {
  private schemas: Map<string, Schema> = new Map();

  registerSchema(id: string, schema: Schema): void {
    this.schemas.set(id, schema);
  }

  getSchema(id: string): Schema | undefined {
    return this.schemas.get(id);
  }

  validate(data: unknown, schema: Schema): SchemaValidationResult {
    const errors: SchemaError[] = [];
    this.validateValue(data, schema, '', errors);
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private validateValue(value: unknown, schema: Schema, path: string, errors: SchemaError[]): void {
    if (schema.$ref) {
      const refSchema = this.resolveRef(schema.$ref);
      if (refSchema) {
        this.validateValue(value, refSchema, path, errors);
      }
      return;
    }

    if (schema.not) {
      const notErrors: SchemaError[] = [];
      this.validateValue(value, schema.not, path, notErrors);
      if (notErrors.length === 0) {
        errors.push({ path, message: '不应匹配此规则', keyword: 'not', value });
      }
      return;
    }

    if (schema.oneOf) {
      const matchingSchemas = schema.oneOf.filter(s => {
        const oneOfErrors: SchemaError[] = [];
        this.validateValue(value, s, path, oneOfErrors);
        return oneOfErrors.length === 0;
      });
      if (matchingSchemas.length !== 1) {
        errors.push({
          path,
          message: `必须精确匹配一个schema，当前匹配了 ${matchingSchemas.length} 个`,
          keyword: 'oneOf',
          value,
        });
      }
      return;
    }

    if (schema.anyOf) {
      const matchingSchemas = schema.anyOf.filter(s => {
        const anyOfErrors: SchemaError[] = [];
        this.validateValue(value, s, path, anyOfErrors);
        return anyOfErrors.length === 0;
      });
      if (matchingSchemas.length === 0) {
        errors.push({
          path,
          message: '必须匹配至少一个schema',
          keyword: 'anyOf',
          value,
        });
      }
      return;
    }

    if (schema.allOf) {
      for (const allOfSchema of schema.allOf) {
        this.validateValue(value, allOfSchema, path, errors);
      }
      return;
    }

    if (schema.enum) {
      if (!schema.enum.includes(value)) {
        errors.push({
          path,
          message: `值必须是枚举值之一: ${schema.enum.join(', ')}`,
          keyword: 'enum',
          value,
        });
      }
      return;
    }

    if (schema.const !== undefined) {
      if (value !== schema.const) {
        errors.push({
          path,
          message: `值必须为常量: ${JSON.stringify(schema.const)}`,
          keyword: 'const',
          value,
        });
      }
      return;
    }

    const type = schema.type || 'any';

    switch (type) {
      case 'string':
        this.validateString(value, schema, path, errors);
        break;
      case 'number':
      case 'integer':
        this.validateNumber(value, schema, path, errors);
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push({
            path,
            message: `期望类型为 boolean，实际为 ${typeof value}`,
            keyword: 'type',
            value,
          });
        }
        break;
      case 'null':
        if (value !== null) {
          errors.push({
            path,
            message: `期望类型为 null，实际为 ${typeof value}`,
            keyword: 'type',
            value,
          });
        }
        break;
      case 'array':
        this.validateArray(value, schema, path, errors);
        break;
      case 'object':
        this.validateObject(value, schema, path, errors);
        break;
      case 'any':
        break;
      default:
        if (typeof value !== type) {
          errors.push({
            path,
            message: `期望类型为 ${type}，实际为 ${typeof value}`,
            keyword: 'type',
            value,
          });
        }
    }
  }

  private validateString(value: unknown, schema: Schema, path: string, errors: SchemaError[]): void {
    if (typeof value !== 'string') {
      if (value !== null && value !== undefined) {
        errors.push({
          path,
          message: `期望类型为 string，实际为 ${typeof value}`,
          keyword: 'type',
          value,
        });
      }
      return;
    }

    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push({
        path,
        message: `字符串长度不能少于 ${schema.minLength}`,
        keyword: 'minLength',
        value,
      });
    }

    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      errors.push({
        path,
        message: `字符串长度不能超过 ${schema.maxLength}`,
        keyword: 'maxLength',
        value,
      });
    }

    if (schema.pattern) {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(value)) {
        errors.push({
          path,
          message: `字符串不符合模式: ${schema.pattern}`,
          keyword: 'pattern',
          value,
        });
      }
    }

    if (schema.format) {
      this.validateFormat(value, schema.format, path, errors);
    }
  }

  private validateNumber(value: unknown, schema: Schema, path: string, errors: SchemaError[]): void {
    if (typeof value !== 'number' || isNaN(value)) {
      errors.push({
        path,
        message: `期望类型为 number，实际为 ${typeof value}`,
        keyword: 'type',
        value,
      });
      return;
    }

    if (schema.type === 'integer' && !Number.isInteger(value)) {
      errors.push({
        path,
        message: '期望整数，实际为浮点数',
        keyword: 'type',
        value,
      });
    }

    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push({
        path,
        message: `值不能小于 ${schema.minimum}`,
        keyword: 'minimum',
        value,
      });
    }

    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push({
        path,
        message: `值不能大于 ${schema.maximum}`,
        keyword: 'maximum',
        value,
      });
    }
  }

  private validateArray(value: unknown, schema: Schema, path: string, errors: SchemaError[]): void {
    if (!Array.isArray(value)) {
      errors.push({
        path,
        message: `期望类型为 array，实际为 ${typeof value}`,
        keyword: 'type',
        value,
      });
      return;
    }

    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push({
        path,
        message: `数组长度不能少于 ${schema.minItems}`,
        keyword: 'minItems',
        value,
      });
    }

    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      errors.push({
        path,
        message: `数组长度不能超过 ${schema.maxItems}`,
        keyword: 'maxItems',
        value,
      });
    }

    if (schema.uniqueItems && new Set(value).size !== value.length) {
      errors.push({
        path,
        message: '数组元素必须唯一',
        keyword: 'uniqueItems',
        value,
      });
    }

    if (schema.items) {
      value.forEach((item, index) => {
        this.validateValue(item, schema.items!, `${path}[${index}]`, errors);
      });
    }
  }

  private validateObject(value: unknown, schema: Schema, path: string, errors: SchemaError[]): void {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      errors.push({
        path,
        message: `期望类型为 object，实际为 ${typeof value}`,
        keyword: 'type',
        value,
      });
      return;
    }

    const obj = value as Record<string, unknown>;

    if (schema.required) {
      for (const required of schema.required) {
        if (!(required in obj) || obj[required] === undefined) {
          errors.push({
            path,
            message: `缺少必需属性: ${required}`,
            keyword: 'required',
            value,
          });
        }
      }
    }

    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in obj) {
          this.validateValue(obj[key], propSchema, `${path}.${key}`, errors);
        }
      }
    }
  }

  private validateFormat(value: string, format: string, path: string, errors: SchemaError[]): void {
    const formatValidators: Record<string, (value: string) => boolean> = {
      'date-time': (v) => !isNaN(new Date(v).getTime()) && v.includes('T'),
      date: (v) => !isNaN(new Date(v).getTime()) && !v.includes('T'),
      time: (v) => !isNaN(new Date(`1970-01-01T${v}`).getTime()),
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      'idn-email': (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      hostname: (v) => /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(v),
      ipv4: (v) => /^(\d{1,3}\.){3}\d{1,3}$/.test(v) && v.split('.').every((p) => parseInt(p) <= 255),
      ipv6: (v) => /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(v),
      uri: (v) => {
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      'uri-reference': (v) => {
        try {
          new URL(v, 'http://example.com');
          return true;
        } catch {
          return false;
        }
      },
    };

    const validator = formatValidators[format];
    if (validator && !validator(value)) {
      errors.push({
        path,
        message: `格式不符合 ${format} 规范`,
        keyword: 'format',
        value,
      });
    }
  }

  private resolveRef($ref: string): Schema | undefined {
    if ($ref.startsWith('#/')) {
      const path = $ref.slice(2).split('/');
      let current: unknown = this.schemas;
      for (const key of path) {
        if (typeof current === 'object' && current !== null) {
          current = (current as Record<string, unknown>)[key];
        } else {
          return undefined;
        }
      }
      return current as Schema;
    }

    return this.schemas.get($ref);
  }
}

export const schemaValidator = new SchemaValidator();
