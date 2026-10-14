/**
 * T0–T2 组件根级间距契约检查
 * 依据：docs/spec/guides/component-authoring.md §10、visual-language.md §2.1
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.SPACING_CONTRACT_ROOT
  ? path.resolve(process.env.SPACING_CONTRACT_ROOT)
  : path.resolve(__dirname, '..');
const COMPONENTS_DIR = process.env.SPACING_CONTRACT_COMPONENTS
  ? path.resolve(process.env.SPACING_CONTRACT_COMPONENTS)
  : path.join(ROOT, 'src', 'components');

const excludeFiles = new Set(['Divider.vue']);

/** 块根尺寸/类型变体后缀（单段，非 BEM 子元素） */
const ROOT_VARIANT_SUFFIX =
  /^(sm|md|lg|xl|2xl|full|vertical|horizontal|line|card|inline|block|centered|transparent|blur|top|bottom|left|right)$/;

const SCOPED_STYLE_RE = /<style\s+scoped(?:\s+lang="[^"]*")?\s*>([\s\S]*?)<\/style>/gi;

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** 从模板 + 根 :class 计算提取块级 class */
function extractBlockClasses(vueContent) {
  const blocks = new Set();
  const template = vueContent.match(/<template>([\s\S]*?)<\/template>/)?.[1] ?? '';
  const withoutComments = template.replace(/<!--[\s\S]*?-->/g, '');
  const firstEl = withoutComments.match(/<([A-Za-z][\w-]*)\s([^>]*)\/?>/);
  if (!firstEl) return blocks;

  const attrs = firstEl[2];
  const staticClass = attrs.match(/\bclass="([^"]+)"/)?.[1];
  if (staticClass) {
    for (const c of staticClass.split(/\s+/)) {
      if (c) blocks.add(c);
    }
  }

  const boundName = attrs.match(/:class="(\w+)"/)?.[1];
  if (boundName) {
    const script = vueContent.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1] ?? '';
    const arrayBody =
      script.match(new RegExp(`const\\s+${boundName}[\\s\\S]*?\\[([\\s\\S]*?)\\]`))?.[1] ??
      script.match(new RegExp(`${boundName}\\(\\)[\\s\\S]*?\\[([\\s\\S]*?)\\]`))?.[1];
    if (arrayBody) {
      for (const m of arrayBody.matchAll(/['"]([\w-]+)['"]/g)) {
        blocks.add(m[1]);
      }
    }
  }

  return blocks;
}

function selectorClassName(selector) {
  return selector.split(',')[0].trim().replace(/^\./, '').split(':')[0].split('::')[0];
}

function isBlockRootSelector(selector, blockClasses) {
  const name = selectorClassName(selector);
  for (const block of blockClasses) {
    if (name === block) return true;
    if (name.startsWith(`${block}--`)) return true;
    const variant = name.match(new RegExp(`^${escapeRegExp(block)}-([a-z0-9]+)$`));
    if (variant && ROOT_VARIANT_SUFFIX.test(variant[1])) return true;
  }
  return false;
}

function stripCssComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function isRootSelector(selector) {
  const s = selector.trim();
  if (!s.startsWith('.')) return false;
  if (/[\s>+~]/.test(s)) return false;
  if (/:deep\(|:slotted\(|:global\(/i.test(s)) return false;
  if (/:(hover|focus|active|disabled|not\(|first|last|nth-|where|is|has)\b/i.test(s)) return false;
  const first = s.split(',')[0].trim().replace(/::(before|after)$/i, '');
  return /^\.[\w-]+(?:--[\w-]+)*$/.test(first);
}

function marginShorthandHasOutward(value) {
  const v = value.replace(/\s+/g, ' ').trim().toLowerCase().replace(/\s*!important\s*$/, '');
  if (!v || v === '0' || v === '0px') return false;
  const parts = v.split(/\s+/);
  let top, right, bottom, left;
  if (parts.length === 1) [top, right, bottom, left] = [parts[0], parts[0], parts[0], parts[0]];
  else if (parts.length === 2) { top = bottom = parts[0]; right = left = parts[1]; }
  else if (parts.length === 3) { [top, right, bottom] = parts; left = right; }
  else [top, right, bottom, left] = parts;
  const isZero = (x) => x === '0' || x === '0px';
  if (top === '-1px' && isZero(right) && isZero(bottom) && isZero(left)) return false;
  return !isZero(top) || !isZero(right) || !isZero(bottom) || !isZero(left);
}

function isAllowedMarginProp(prop, value) {
  const p = prop.toLowerCase();
  const v = value.replace(/\s+/g, ' ').trim().toLowerCase().replace(/\s*!important\s*$/, '');
  if (p === 'margin') return !marginShorthandHasOutward(v);
  if (p === 'margin-top' && v === '-1px') return true;
  if (p.startsWith('margin') && (v === '0' || v === '0px')) return true;
  return false;
}

function isSpacingViolation(prop, value) {
  const p = prop.toLowerCase();
  const v = value.replace(/\s+/g, ' ').trim().toLowerCase().replace(/\s*!important\s*$/, '');
  if (p === 'margin' || p.startsWith('margin-')) return !isAllowedMarginProp(p, v);
  if (p === 'padding-block' || p === 'padding-block-start' || p === 'padding-block-end') {
    return v !== '0' && v !== '0px';
  }
  if (p === 'padding') {
    const parts = v.split(/\s+/);
    if (parts.length === 2 && parts[1] === '0' && parts[0] !== '0' && parts[0] !== '0px') return true;
  }
  return false;
}

function analyzeScopedCssBlocks(css, fileRel, blockClasses) {
  const violations = [];
  const cleaned = stripCssComments(css);
  let depth = 0;
  let atDepth = 0;
  let i = 0;
  let line = 1;
  let buf = '';
  let selectorStartLine = 1;
  let activeRoot = null;

  function flushSelector(sel, selLine) {
    const s = sel.trim();
    if (!s || s.startsWith('@')) return null;
    if (!isRootSelector(s.split(',')[0].trim())) return null;
    if (!isBlockRootSelector(s, blockClasses)) return null;
    return { selector: s, line: selLine };
  }

  while (i < cleaned.length) {
    const c = cleaned[i];
    if (c === '\n') { line++; i++; continue; }
    if (c === '{') {
      const sel = buf.trim();
      buf = '';
      depth++;
      if (depth === 1 || (atDepth > 0 && depth === atDepth + 1)) {
        activeRoot = flushSelector(sel, selectorStartLine);
      } else activeRoot = null;
      i++;
      continue;
    }
    if (c === '}') {
      depth--;
      if (atDepth > 0 && depth < atDepth) atDepth = 0;
      activeRoot = null;
      buf = '';
      selectorStartLine = line;
      i++;
      continue;
    }
    if (depth === 0) {
      if (c === '@') {
        const j = cleaned.indexOf('{', i);
        if (j !== -1) {
          atDepth = 1;
          i = j + 1;
          depth = 1;
          buf = '';
          selectorStartLine = line;
          continue;
        }
      }
      buf += c;
      if (buf.trim() && selectorStartLine === 1) selectorStartLine = line;
      i++;
      continue;
    }
    const bodyDepth = atDepth > 0 ? atDepth + 1 : 1;
    if (activeRoot && depth === bodyDepth) {
      let decl = '';
      while (i < cleaned.length && cleaned[i] !== ';' && cleaned[i] !== '}') {
        if (cleaned[i] === '\n') line++;
        decl += cleaned[i++];
      }
      decl = decl.trim();
      if (decl) {
        const m = decl.match(/^([\w-]+)\s*:\s*(.+)$/);
        if (m) {
          const [, prop, val] = m;
          if (isSpacingViolation(prop, val)) {
            violations.push({ file: fileRel, line, selector: activeRoot.selector, prop, value: val.trim() });
          }
        }
      }
      if (cleaned[i] === ';') i++;
      continue;
    }
    i++;
  }
  return violations;
}

function extractScopedStyles(content) {
  const parts = [];
  let m;
  SCOPED_STYLE_RE.lastIndex = 0;
  while ((m = SCOPED_STYLE_RE.exec(content))) parts.push(m[1]);
  return parts.join('\n');
}

function relUnderComponents(absPath) {
  return path.relative(COMPONENTS_DIR, absPath).replace(/\\/g, '/');
}

function isExemptFile(absPath) {
  return excludeFiles.has(path.basename(absPath));
}

function walkVueFiles(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === '__tests__') continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkVueFiles(full, out);
    else if (ent.name.endsWith('.vue')) out.push(full);
  }
  return out;
}

function main() {
  console.log('检查组件根级间距契约（component-authoring §10 / visual-language §2.1）...\n');
  const allViolations = [];
  for (const file of walkVueFiles(COMPONENTS_DIR)) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf8');
    const scoped = extractScopedStyles(content);
    if (!scoped.trim()) continue;
    const blockClasses = extractBlockClasses(content);
    for (const v of analyzeScopedCssBlocks(scoped, rel, blockClasses)) {
      v.exempt = isExemptFile(file);
      allViolations.push(v);
    }
  }
  const blocking = allViolations.filter((v) => !v.exempt);
  const exempt = allViolations.filter((v) => v.exempt);
  const byFile = new Map();
  for (const v of allViolations) {
    if (!byFile.has(v.file)) byFile.set(v.file, []);
    byFile.get(v.file).push(v);
  }
  const topFiles = [...byFile.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 10);
  for (const v of blocking) {
    console.log(`[error] ${v.file}:${v.line} ${v.selector} { ${v.prop}: ${v.value}; }`);
  }
  if (exempt.length) {
    console.log('\n--- 豁免违规（legacy / Divider）---');
    const exemptOnly = [...byFile.entries()].filter(([, items]) => items.every((x) => x.exempt))
      .sort((a, b) => b[1].length - a[1].length).slice(0, 10);
    for (const [file, items] of exemptOnly) {
      console.log(`[exempt] ${file} (${items.length})`);
    }
    console.log(`… 豁免合计 ${exempt.length} 处 / ${new Set(exempt.map((v) => v.file)).size} 文件`);
  }
  console.log('\n--- 统计 ---');
  console.log(`总违规: ${allViolations.length}`);
  console.log(`豁免: ${exempt.length}`);
  console.log(`阻断: ${blocking.length}`);
  console.log('\nTop 10 文件:');
  for (const [file, items] of topFiles) {
    const tag = items.every((x) => x.exempt) ? 'exempt' : 'error';
    console.log(`  ${items.length}\t[${tag}]\t${file}`);
  }
  if (blocking.length) {
    console.log('\n检查失败：存在未豁免的根级间距违规。');
    process.exit(1);
  }
  console.log('\n✓ 间距契约检查通过（无阻断项）。');
}

main();