/**
 * 主题 Token 约定检查脚本
 * 规则说明见 docs/主题与组件样式规范.md
 * 契约见 docs/conventions/theme/tokens.contract.ts
 * 检测硬编码颜色、子区域背景滥用、弃用 token 等违规用法
 *
 * 内置硬编码豁免机制：
 *   1. excludeFiles：整文件豁免（ColorPicker/QRCode/HeatmapChart 等天然需要硬编码颜色的组件）
 *   2. 行级豁免标记：在硬编码颜色同行追加 @theme-inherent 注释并附带理由，
 *      用于页面/业务代码中天然需要固定颜色的场景（如饱和色板上的白色前景、
 *      服务端下发二维码图片的纯白底色）。标记必须附带理由，便于审计与 grep。
 *      该机制是项目对"天然硬编码"的统一模式规范，禁止滥用——
 *      凡是能用 token 表达的颜色一律不得使用此标记。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');

const extensions = new Set(['.vue', '.css', '.scss']);
const excludeDirs = new Set(['node_modules', 'dist', '.refer', 'docs', '.bak']);
const excludeFiles = new Set(['ColorPicker.vue', 'QRCode.vue', 'HeatmapChart.vue']);

/** 弃用 token，新代码应使用 semantic-tokens.css 中的语义 token */
const DEPRECATED_TOKENS = ['--bg-base', '--bg-elevated', '--bg-muted'];

/** 在 container 子区域（footer/section）中禁止单独铺设 canvas 背景 */
const CHILD_SECTION_BG_PATTERN = /\.(footer-section|layout-sider-footer|card-footer|section-footer)[\s\S]{0,300}?background(?:-color)?\s*:\s*hsl\(var\(--(?:bg-base|background|surface-canvas)/;

/** 硬编码十六进制颜色（排除文档注释中的示例） */
const HEX_COLOR_PATTERN = /(?<!\/\/.*)(?<!--[^>]*)(?:background|color|border(?:-color)?|fill|stroke)\s*:\s*[^;{]*#[0-9a-fA-F]{3,8}/;

/** 硬编码 rgb/rgba */
const RGB_PATTERN = /(?:background|color|border(?:-color)?)\s*:\s*[^;{]*rgba?\([^v][^;)]+\)/;

const violations = [];

function shouldProcessDir(dirName) {
  return !excludeDirs.has(dirName);
}

function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  const base = path.basename(filePath);
  if (!extensions.has(ext)) return false;
  if (excludeFiles.has(base)) return false;
  return true;
}

/** 获取 HTML / 块注释在源码中的字符区间 */
function getCommentRanges(content) {
  const ranges = [];
  for (const re of [/<!--[\s\S]*?-->/g, /\/\*[\s\S]*?\*\//g]) {
    let match;
    while ((match = re.exec(content))) {
      ranges.push([match.index, match.index + match[0].length]);
    }
  }
  return ranges;
}

/** 判断某行是否落在注释区间内 */
function isLineInComment(content, lineIndex, ranges) {
  const lines = content.split('\n');
  let offset = 0;
  for (let i = 0; i < lineIndex; i++) offset += lines[i].length + 1;
  const lineEnd = offset + lines[lineIndex].length;
  return ranges.some(([start, end]) => offset < end && lineEnd > start);
}

function checkContent(content, filePath) {
  const relPath = path.relative(projectRoot, filePath).replace(/\\/g, '/');
  const commentRanges = getCommentRanges(content);
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    if (isLineInComment(content, index, commentRanges)) return;
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
    // 文档示例中的转义 HTML（如 &lt;Element :style=...）非真实样式
    if (line.includes('&lt;') || line.includes('&gt;')) return;
    // 组件展示页的 preview 字段为演示 HTML 字符串，允许硬编码示例色
    if (line.includes('preview:') || line.includes('preview :')) return;
    // 行级豁免：天然需要固定颜色的场景（须附带 @theme-inherent: <理由> 注释）
    if (line.includes('@theme-inherent')) return;

  for (const token of DEPRECATED_TOKENS) {
      if (line.includes(`var(${token})`) && !relPath.includes('themes/')) {
        violations.push({
          file: relPath,
          line: lineNum,
          rule: 'deprecated-token',
          message: `使用了弃用 token ${token}，请改用 --surface-* 语义 token`,
        });
      }
    }

    if (HEX_COLOR_PATTERN.test(line) && !line.includes('data:image') && !line.includes('url(')) {
      violations.push({
        file: relPath,
        line: lineNum,
        rule: 'hardcoded-hex',
        message: '样式中存在硬编码十六进制颜色，应使用 hsl(var(--token))',
      });
    }

    if (RGB_PATTERN.test(line) && !line.includes('var(--')) {
      violations.push({
        file: relPath,
        line: lineNum,
        rule: 'hardcoded-rgb',
        message: '样式中存在硬编码 rgb/rgba 颜色',
      });
    }
  });

  if (CHILD_SECTION_BG_PATTERN.test(content)) {
    violations.push({
      file: relPath,
      line: 0,
      rule: 'child-section-bg',
      message: '子区域（footer-section 等）不应单独使用 canvas 级背景，应继承父容器或使用 transparent',
    });
  }
}

function walkDir(dirPath) {
  for (const item of fs.readdirSync(dirPath)) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && shouldProcessDir(item)) {
      walkDir(fullPath);
    } else if (stat.isFile() && shouldProcessFile(fullPath)) {
      checkContent(fs.readFileSync(fullPath, 'utf8'), fullPath);
    }
  }
}

function main() {
  console.log('检查主题 Token 约定...\n');
  walkDir(srcDir);

  const deprecated = violations.filter(v => v.rule === 'deprecated-token');
  const hardcoded = violations.filter(v => v.rule === 'hardcoded-hex' || v.rule === 'hardcoded-rgb');
  const childBg = violations.filter(v => v.rule === 'child-section-bg');

  if (violations.length === 0) {
    console.log('✓ 未发现违规');
    process.exit(0);
  }

  const grouped = new Map();
  for (const v of violations) {
    const key = `${v.file}:${v.line}`;
    if (!grouped.has(key)) grouped.set(key, v);
  }

  for (const v of grouped.values()) {
    console.log(`✗ ${v.file}${v.line ? `:${v.line}` : ''} [${v.rule}] ${v.message}`);
  }

  console.log('\n--- 统计 ---');
  console.log(`弃用 token: ${deprecated.length}`);
  console.log(`硬编码颜色: ${hardcoded.length}`);
  console.log(`子区域背景滥用: ${childBg.length}`);
  console.log(`合计: ${grouped.size}`);

  console.log('\n检查失败：存在违规项');
  process.exit(1);
}

main();
