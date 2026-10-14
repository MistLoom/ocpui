#!/usr/bin/env node

/** OCP 语义 ID：PascalCase name �?C:KEBAB-NAME；重名按 registry 目录消歧 */

/**
 * @param {string} name 组件�?PascalCase
 */
export function nameToIdBase(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toUpperCase();
}

/**
 * @param {string} name
 * @param {string} registryRel �?registry/feedback/context-menu.md
 * @param {boolean} disambiguate 重名组件加目录前缀
 */
export function componentSemanticId(name, registryRel, disambiguate = false) {
  const base = nameToIdBase(name);
  if (!disambiguate) return `C:${base}`;
  const parts = registryRel.replace(/\\/g, '/').split('/');
  const category = parts.length >= 2 ? parts[1] : 'misc';
  const catPrefix = category.replace(/-/g, '_').toUpperCase();
  return `C:${catPrefix}-${base}`;
}

const ID_PATTERN = /^C:[A-Z][A-Z0-9-]*$/;

export function isValidComponentId(id) {
  return typeof id === 'string' && ID_PATTERN.test(id);
}

/**
 * @param {string} raw markdown
 */
export function parseFrontmatterId(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return undefined;
  const line = m[1].split('\n').find((l) => /^id:\s*/.test(l));
  if (!line) return undefined;
  return line.replace(/^id:\s*/, '').trim();
}

/**
 * @param {string} raw
 * @param {string} id
 */
export function insertOrUpdateFrontmatterId(raw, id) {
  if (!/^---\r?\n/.test(raw)) return raw;
  const fmBlock = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  if (/^id:\s/m.test(fmBlock)) {
    return raw.replace(/^id:\s*.+$/m, `id: ${id}`);
  }
  if (/^type: Component\r?\n/m.test(fmBlock)) {
    return raw.replace(/^(type: Component\r?\n)/m, `$1id: ${id}\n`);
  }
  return raw.replace(/^(---\r?\n)/, `$1id: ${id}\n`);
}
