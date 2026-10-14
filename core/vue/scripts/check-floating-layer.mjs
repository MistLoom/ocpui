#!/usr/bin/env node
/**
 * 浮层规范门禁：禁止图表等组件在容器内 absolute 定位 hover 提示
 * 规范：@ocpui/docs/spec/foundation/layer-stack.md
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DISPLAY = path.join(ROOT, 'src/components/data-display');

/** 已迁移为 FloatingHint / Teleport 的图表组件 */
const CHART_HINT_COMPONENTS = [
  'MiniLineChart.vue',
  'TrendChart.vue',
  'NetworkTrafficChart.vue',
  'GaugeChart.vue',
];

/** 禁止出现的内联 absolute tooltip 类名 */
const INLINE_TOOLTIP_CLASS = [
  'chart-tooltip',
  'traffic-tooltip',
  'gauge-tooltip',
];

console.log('[check-floating-layer] 开始');

// 层级 token
{
  const css = fs.readFileSync(path.join(ROOT, 'src/themes/layer-tokens.css'), 'utf8');
  assert.match(css, /--z-tooltip:/);
  assert.match(css, /\.ocpui-floating-hint/);
}

// FloatingHint 必须 Teleport
{
  const hint = fs.readFileSync(
    path.join(ROOT, 'src/components/feedback/FloatingHint.vue'),
    'utf8',
  );
  assert.match(hint, /Teleport to="body"/);
  assert.match(hint, /useFloatingPosition/);
}

// 图表组件：使用 FloatingHint，且无 inline absolute tooltip 样式
for (const file of CHART_HINT_COMPONENTS) {
  const src = fs.readFileSync(path.join(DATA_DISPLAY, file), 'utf8');
  assert.match(src, /FloatingHint/, `${file} 应使用 FloatingHint`);
  for (const cls of INLINE_TOOLTIP_CLASS) {
    assert.doesNotMatch(
      src,
      new RegExp(`\\.${cls.replace('-', '\\-')}[\\s\\S]*position:\\s*absolute`),
      `${file} 不得保留 .${cls} position:absolute`,
    );
  }
}

// HeatmapChart：已有 Teleport + fixed
{
  const src = fs.readFileSync(path.join(DATA_DISPLAY, 'HeatmapChart.vue'), 'utf8');
  assert.match(src, /Teleport to="body"/);
  assert.match(src, /var\(--z-tooltip\)/);
}

// Tooltip 基线：Teleport
{
  const src = fs.readFileSync(
    path.join(ROOT, 'src/components/feedback/Tooltip.vue'),
    'utf8',
  );
  assert.match(src, /Teleport to="body"/);
}

// 全局浮层（position: fixed）禁止数字 z-index，必须引用 --z-* token（P1-2）。
// 组件内部局部堆叠使用 relative/absolute 小值，不在此约束内。
{
  const componentsDir = path.join(ROOT, 'src/components');
  const offenders = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.vue')) {
        const src = fs.readFileSync(full, 'utf8');
        // 逐个样式规则块判断：fixed 定位块内出现数字 z-index 即违规
        for (const block of src.split('}')) {
          if (/position:\s*fixed/.test(block) && /z-index:\s*\d/.test(block)) {
            offenders.push(path.relative(ROOT, full));
            break;
          }
        }
      }
    }
  };
  walk(componentsDir);
  assert.equal(
    offenders.length,
    0,
    `以下组件在 position:fixed 规则内硬编码数字 z-index，必须改用 var(--z-*)：\n${offenders.join('\n')}`,
  );
}

console.log('[check-floating-layer] ok');
