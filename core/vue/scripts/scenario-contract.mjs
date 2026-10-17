#!/usr/bin/env node
/**
 * OCP 规格场景对照：@ocpui/docs/spec 关键契约 → 可执行断言（纯 registry/CSS，无 TS 运行时）
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatterId } from './registry-id.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ADMIN_ROOT = path.resolve(ROOT, '..', 'vue-admin');

function readRegistry(name) {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'registry', 'manifest.json'), 'utf8'),
  );
  const entry = manifest.components.find((c) => c.name === name);
  assert.ok(entry, `manifest 缺少 ${name}`);
  const pkgRoot = entry.package === '@ocpui/vue-admin' ? ADMIN_ROOT : ROOT;
  return {
    raw: fs.readFileSync(path.join(pkgRoot, entry.registry), 'utf8'),
    entry,
  };
}

function fmHas(raw, key) {
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  return new RegExp(`^${key}:`, 'm').test(fm);
}

console.log('[scenario-contract] 开始');

// K:ADMIN-LIST-PAGE 场景：Shell 组合要素 registry 可达
{
  for (const name of ['AdminPage', 'AdminWorkList', 'DataTable']) {
    const { raw } = readRegistry(name);
    assert.ok(fmHas(raw, 'id'), `${name} 缺 id`);
    assert.ok(fmHas(raw, 'duty'), `${name} 缺 duty`);
    assert.ok(fmHas(raw, 'dispatchRole'), `${name} 缺 dispatchRole`);
  }
}

// F:STATE-SYSTEM — AdminWorkList handlesStates
{
  const { raw } = readRegistry('AdminWorkList');
  assert.match(raw, /handlesStates:/, 'AdminWorkList handlesStates');
  assert.match(raw, /regionState|region-state/i, 'AdminWorkList 文档/实现含 regionState');
}

// F:INTERACTION-NET — 双通道 registry 标记
{
  const { raw } = readRegistry('AdminWorkList');
  assert.match(raw, /feedbackChannel:/, 'AdminWorkList feedbackChannel');
}

// F:MOTION — overlay + animation
{
  for (const name of ['Modal', 'Drawer', 'FadeTransition', 'ListTransition', 'AdminWorkList']) {
    const { raw } = readRegistry(name);
    assert.ok(fmHas(raw, 'motion'), `${name} 缺 motion`);
  }
}

// F:MOTION — CSS 别名
{
  const css = fs.readFileSync(path.join(ROOT, 'src/themes/animation-tokens.css'), 'utf8');
  assert.match(css, /--duration-micro:/);
  assert.match(css, /--ease-enter:/);
}

// 语义 ID — CLI 可解析
{
  const { raw } = readRegistry('Button');
  assert.equal(parseFrontmatterId(raw), 'C:BUTTON');
}

// 场景：系统事件组件 notify 通道
{
  const { raw } = readRegistry('Notification');
  assert.ok(fmHas(raw, 'id'), 'Notification 缺 id');
}

// 运行时系统层导出
{
  const systemIndex = fs.readFileSync(path.join(ROOT, 'src/system/index.ts'), 'utf8');
  assert.match(systemIndex, /useUiMotion/);
  assert.match(systemIndex, /useUiActionFeedback/);
  assert.match(systemIndex, /shellDispatchAttrs/);
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.ok(pkg.exports['./system'], 'package.json 导出 ./system');
}

// UiRoot 运行时：presentationMode + reduced-motion
{
  const uiRoot = fs.readFileSync(path.join(ROOT, 'src/root/UiRoot.vue'), 'utf8');
  assert.match(uiRoot, /presentationMode/);
  assert.match(uiRoot, /ocpui-root--reduced-motion/);
  assert.match(uiRoot, /data-ui-presentation-mode/);
}

// Admin patterns + dispatch attrs
{
  const adminPkg = JSON.parse(fs.readFileSync(path.join(ADMIN_ROOT, 'package.json'), 'utf8'));
  assert.ok(adminPkg.exports['./patterns'], 'vue-admin 导出 ./patterns');
  const adminPage = fs.readFileSync(
    path.join(ADMIN_ROOT, 'src/components/layout/AdminPage.vue'),
    'utf8',
  );
  assert.match(adminPage, /data-ui-dispatch-role="focus-host"/);
  const workList = fs.readFileSync(
    path.join(ADMIN_ROOT, 'src/components/layout/AdminWorkList.vue'),
    'utf8',
  );
  assert.match(workList, /data-ui-dispatch-role="content-host"/);
}

// F:CONTAINER-CHAIN — overlay-host dispatch + 背景降焦
{
  const modal = fs.readFileSync(
    path.join(ROOT, 'src/components/feedback/Modal.vue'),
    'utf8',
  );
  assert.match(modal, /overlay-host/);
  assert.match(modal, /restore-trigger/);
  const deemphasis = fs.readFileSync(
    path.join(ROOT, 'src/themes/shared/focus-deemphasis.css'),
    'utf8',
  );
  assert.match(deemphasis, /data-ui-overlay-active/);
  const lock = fs.readFileSync(
    path.join(ROOT, 'src/components/feedback/overlayScrollLock.ts'),
    'utf8',
  );
  assert.match(lock, /data-ui-overlay-active/);
}

console.log('[scenario-contract] ok');
