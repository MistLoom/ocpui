#!/usr/bin/env node

/**
 * S5/S6: fill registry v2 extension fields that are NOT sourced from
 * registry-meta.json (motion four-tuple / overlay dispatchRole / focusPolicy).
 * Chinese semantic fields (duty / decisions / handlesStates / feedbackChannel)
 * are authored in registry-meta.json and emitted by build-registry.mjs.
 * This script only fills MISSING fields; it never overwrites manual entries.
 * motion.trigger is constrained by spec/foundation/perception.md section 5.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const VUE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ADMIN_ROOT = path.resolve(VUE_ROOT, '..', 'vue-admin');
const MANIFEST = path.join(VUE_ROOT, 'registry', 'manifest.json');

function fmHas(fmText, key) {
  return new RegExp(`^${key}:`, 'm').test(fmText);
}

function getFmBlock(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m?.[1] ?? '';
}

function insertBeforeSince(fmText, block) {
  if (fmHas(fmText, block.split(':')[0])) return fmText;
  if (/^since:/m.test(fmText)) {
    return fmText.replace(/^since:/m, `${block}\nsince:`);
  }
  return `${fmText.trimEnd()}\n${block}\n`;
}

function applyFm(raw, patchFn) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return raw;
  const next = patchFn(m[1]);
  return raw.replace(m[0], `---\n${next}\n---`);
}

const OVERLAY_SHELLS = ['Modal', 'Drawer', 'Dialog', 'PopupPanel', 'Overlay', 'ConfirmDialog'];

const MOTION_BY_NAME = {
  FadeTransition: { trigger: 'list_update', purpose: 'explain_state', tier: 'light', interruptible: true, stopWhen: 'result_readable', mustNot: ['steal_focus'] },
  SlideTransition: { trigger: 'expand_panel', purpose: 'explain_spatial_origin', tier: 'light', interruptible: true, stopWhen: 'focus_stable', mustNot: ['steal_focus'] },
  CollapseTransition: { trigger: 'expand_panel', purpose: 'explain_spatial_origin', tier: 'light', interruptible: true, stopWhen: 'result_readable', mustNot: ['reorder_selection'] },
  NumberAnimation: { trigger: 'system_event', purpose: 'explain_progress', tier: 'micro', interruptible: true, stopWhen: 'result_readable', mustNot: ['imply_success'] },
  InfiniteScroll: { trigger: 'list_update', purpose: 'explain_progress', tier: 'light', interruptible: true, stopWhen: 'result_readable', mustNot: ['steal_focus'] },
  Marquee: { trigger: 'system_event', purpose: 'explain_progress', tier: 'scene', interruptible: true, stopWhen: 'user_acknowledged', mustNot: ['steal_focus', 'reorder_selection'] },
  Modal: { trigger: 'overlay_open', purpose: 'explain_spatial_origin', tier: 'light', interruptible: true, stopWhen: 'focus_stable', mustNot: ['steal_focus'] },
  Drawer: { trigger: 'overlay_open', purpose: 'explain_spatial_origin', tier: 'light', interruptible: true, stopWhen: 'focus_stable', mustNot: ['steal_focus'] },
  Dialog: { trigger: 'overlay_open', purpose: 'explain_spatial_origin', tier: 'light', interruptible: true, stopWhen: 'focus_stable', mustNot: ['steal_focus'] },
  PopupPanel: { trigger: 'overlay_open', purpose: 'explain_spatial_origin', tier: 'micro', interruptible: true, stopWhen: 'focus_stable', mustNot: ['steal_focus'] },
  Overlay: { trigger: 'overlay_open', purpose: 'explain_spatial_origin', tier: 'light', interruptible: true, stopWhen: 'focus_stable', mustNot: ['steal_focus'] },
  ConfirmDialog: { trigger: 'overlay_open', purpose: 'explain_state', tier: 'medium', interruptible: false, stopWhen: 'user_acknowledged', mustNot: ['imply_success'] },
  Popover: { trigger: 'overlay_open', purpose: 'explain_spatial_origin', tier: 'micro', interruptible: true, stopWhen: 'focus_stable', mustNot: ['steal_focus'] },
  Tooltip: { trigger: 'pointer_hover', purpose: 'explain_focus', tier: 'micro', interruptible: true, stopWhen: 'focus_stable', mustNot: ['steal_focus'] },
  FloatingHint: { trigger: 'pointer_hover', purpose: 'explain_focus', tier: 'micro', interruptible: true, stopWhen: 'focus_stable', mustNot: ['steal_focus'] },
  Loading: { trigger: 'system_event', purpose: 'explain_progress', tier: 'micro', interruptible: true, stopWhen: 'result_readable', mustNot: ['imply_success'] },
  Spin: { trigger: 'system_event', purpose: 'explain_progress', tier: 'micro', interruptible: true, stopWhen: 'result_readable', mustNot: ['imply_success'] },
};

function motionYaml(m) {
  const mustNot = m.mustNot?.length ? `\n  mustNot: [${m.mustNot.join(', ')}]` : '';
  return `motion:
  trigger: ${m.trigger}
  purpose: ${m.purpose}
  tier: ${m.tier}
  interruptible: ${m.interruptible}
  stopWhen: ${m.stopWhen}${mustNot}`;
}

function enrichFile(raw, comp, registryRel) {
  let next = raw;
  const fm = getFmBlock(next);
  const isAnimation = registryRel.includes('/animation/');
  const hasMotion = MOTION_BY_NAME[comp.name];
  const isOverlayMotion = hasMotion && (isAnimation || registryRel.includes('/feedback/'));

  if (isOverlayMotion && !fmHas(fm, 'motion')) {
    next = applyFm(next, (t) => insertBeforeSince(t, motionYaml(MOTION_BY_NAME[comp.name])));
  }

  if (OVERLAY_SHELLS.includes(comp.name)) {
    if (!fmHas(getFmBlock(next), 'focusPolicy')) {
      next = applyFm(next, (t) => insertBeforeSince(t, 'focusPolicy: restore-trigger'));
    }
    if (!fmHas(getFmBlock(next), 'dispatchRole')) {
      next = applyFm(next, (t) => insertBeforeSince(t, 'dispatchRole: overlay-host'));
    }
  }

  return next;
}

const { components } = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
let changed = 0;

for (const c of components) {
  const root = c.package === '@ocpui/vue-admin' ? ADMIN_ROOT : VUE_ROOT;
  const regPath = path.join(root, c.registry);
  if (!fs.existsSync(regPath)) continue;
  const raw = fs.readFileSync(regPath, 'utf8');
  const next = enrichFile(raw, c, c.registry.replace(/\\/g, '/'));
  if (next !== raw) {
    fs.writeFileSync(regPath, next);
    changed += 1;
  }
}

console.log(`[enrich-registry-v2] updated ${changed} entries`);
