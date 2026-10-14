/** @ocpui/vue-admin 校验适配层：统一从 @ocpui/vue/validation 透出 */
export * from '@ocpui/vue/validation';

import { toTypedSchema } from '@ocpui/vue/validation';
import type { z } from 'zod';

/** 将 Zod schema 转为 vee-validate 可用 schema */
export function toVeeValidateSchema<T extends z.ZodType>(schema: T) {
  return toTypedSchema(schema);
}
