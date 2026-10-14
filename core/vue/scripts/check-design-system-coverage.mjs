#!/usr/bin/env node

/**

 * 设计系统覆盖门禁：防止组件/模式逃逸 spacing、overlay、类型 CSS、组合模式

 *

 * 覆盖矩阵（阻断 / 告警）：

 * | 维度           | 门禁                         | 逃逸面（告警或不覆盖）        |

 * |----------------|------------------------------|-------------------------------|

 * | 间距           | check-spacing-contract       | 非 scoped、inline style       |

 * | 类型 CSS       | 8 类映射 + index 引入        | vue-admin 包                  |

 * | 组合模式       | combination-patterns class   | 业务页未用 class              |

 * | 密度 token     | type-data-display 消费       | 组件 scoped 覆盖 token        |

 * | Overlay 锁滚   | lockBodyScroll + overlay-host| PopupPanel 等非全屏浮层       |
 * | vue-admin      | admin lockBodyScroll 扫描    | admin spacing（playground 兜底）|
 * | playground     | 7 组合模式 class 演示        | apps 业务页                   |

 * | Registry 对账  | manifest ↔ .vue              | —                             |

 * | 浮层 Teleport  | check-floating-layer         | ContextMenu 等锚定浮层        |

 */

import fs from 'node:fs';

import path from 'node:path';

import { fileURLToPath } from 'node:url';



const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const ADMIN_ROOT = path.resolve(ROOT, '..', 'vue-admin');

const PLAYGROUND_SRC = path.resolve(ROOT, '..', '..', 'casus', 'playground', 'src');

const COMPONENTS = path.join(ROOT, 'src', 'components');

const SHARED = path.join(ROOT, 'src', 'themes', 'shared');

const MANIFEST = path.join(ROOT, 'registry', 'manifest.json');



/** 8 类组件 → 类型 CSS（须存在于 shared 且被 index 引入） */

const CATEGORY_TYPE_CSS = {

  utility: 'type-primitives.css',

  'data-entry': 'type-data-entry.css',

  'data-display': 'type-data-display.css',

  feedback: 'type-feedback.css',

  navigation: 'type-navigation.css',

  layout: 'type-layout.css',

  interaction: 'type-interaction.css',

  animation: 'type-animation.css',

};



/** 主题链必备文件 */

const REQUIRED_THEME_MODULES = [

  'combination-patterns.css',

  'presentation-density.css',

  'focus-deemphasis.css',

  'interaction-base.css',

  ...Object.values(CATEGORY_TYPE_CSS),

];



/** 组合模式 class（须在 combination-patterns.css 声明） */

const COMBINATION_PATTERNS = [

  'ocp-filter-row',

  'ocp-form-action-bar',

  'ocp-list-page-stack',

  'ocp-list-selection-bar',

  'ocp-detail-panel',

  'ocp-chart-dashboard',

  'ocp-progressive-wizard',

];



/** 允许非 scoped style 的组件（SVG/动画基元） */

const NON_SCOPED_ALLOW = new Set(['Icon.vue', 'ListTransition.vue']);



/** manifest 对账豁免（测试桩，非对外组件） */

const MANIFEST_SYNC_ALLOW = new Set(['DatePicker.theme.test']);



/** 密度 token 须被类型 CSS 消费 */

const DENSITY_TOKEN_REFS = ['--list-row-padding-y', '--table-row-compact'];



const errors = [];

const warnings = [];



function read(rel) {

  return fs.readFileSync(path.join(ROOT, rel.replace(/^\//, '')), 'utf8');

}



function exists(rel) {

  return fs.existsSync(path.join(ROOT, rel.replace(/^\//, '')));

}



function relFromRoot(abs) {

  return path.relative(ROOT, abs).replace(/\\/g, '/');

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



/** 与 check-registry-contract 一致的 frontmatter 解析 */

function parseFrontmatter(text) {

  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  if (!m) return null;



  const fm = {};

  const lines = m[1].split('\n');

  let key = null;

  let list = null;



  for (const line of lines) {

    const kv = line.match(/^(\w+):\s*(.*)$/);

    if (kv) {

      if (list && key) {

        fm[key] = list;

        list = null;

      }

      key = kv[1];

      const val = kv[2].trim();

      if (val === '') {

        list = [];

      } else if (val.startsWith('[')) {

        fm[key] = val

          .slice(1, -1)

          .split(',')

          .map((s) => s.trim().replace(/^["']|["']$/g, ''))

          .filter(Boolean);

        key = null;

      } else {

        fm[key] = val.replace(/^["']|["']$/g, '');

        key = null;

      }

      continue;

    }



    const item = line.match(/^\s+-\s+(.+)$/);

    if (item && list) {

      list.push(item[1].replace(/^["']|["']$/g, ''));

    }

  }



  if (list && key) fm[key] = list;

  return fm;

}



function hasAntiPatterns(fm) {

  return Array.isArray(fm?.antiPatterns) && fm.antiPatterns.length > 0;

}



// 1. 主题链完整

{

  const index = read('src/themes/shared/index.css');

  for (const file of REQUIRED_THEME_MODULES) {

    if (!exists(`src/themes/shared/${file}`)) {

      errors.push(`缺少类型/主题模块: shared/${file}`);

    } else if (!index.includes(file)) {

      errors.push(`shared/index.css 未引入 ${file}`);

    }

  }

}



// 2. 组合模式

{

  const combo = read('src/themes/shared/combination-patterns.css');

  for (const cls of COMBINATION_PATTERNS) {

    if (!combo.includes(`.${cls}`)) {

      errors.push(`combination-patterns.css 缺少 ${cls}`);

    }

  }

}



// 3. presentation 密度 token 消费

{

  const typeDisplay = read('src/themes/shared/type-data-display.css');

  for (const token of DENSITY_TOKEN_REFS) {

    if (!typeDisplay.includes(token)) {

      errors.push(`type-data-display.css 未消费密度 token ${token}`);

    }

  }

  const density = read('src/themes/shared/presentation-density.css');

  if (!density.includes('data-ui-presentation-mode')) {

    errors.push('presentation-density.css 缺少 presentationMode 选择器');

  }

}



// 4. overlay 浮层统一经感知控制器 useOverlayLayer 收口（防直接操作滚动锁旁路）
{

  for (const file of walkVueFiles(COMPONENTS)) {

    const src = fs.readFileSync(file, 'utf8');

    const rel = relFromRoot(file);

    if (/lockBodyScroll|unlockBodyScroll/.test(src)) {

      errors.push(`${rel}: 禁止直接使用 lockBodyScroll/unlockBodyScroll，须用 useOverlayLayer 收口`);

    }

    // overlay-host 组件必须经统一收口（滚动锁 + W4 降焦 + inert + 焦点恢复）
    if (/overlay-host/.test(src) && !/useOverlayLayer/.test(src)) {

      errors.push(`${rel}: overlay-host 缺少 useOverlayLayer 收口`);

    }

  }

}



// 5. 组件 vue 文件 vs manifest（@ocpui/vue 阻断）

{

  const vueFiles = walkVueFiles(COMPONENTS).map((f) => path.basename(f, '.vue'));

  const { components } = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));

  const manifestVue = components.filter((c) => c.package === '@ocpui/vue').map((c) => c.name);

  const vueSet = new Set(vueFiles);

  const manifestSet = new Set(manifestVue);



  for (const name of manifestVue) {

    if (!vueSet.has(name)) {

      errors.push(`manifest 有 ${name} 但 src/components 无对应 .vue`);

    }

  }

  for (const name of vueFiles) {

    if (MANIFEST_SYNC_ALLOW.has(name)) continue;

    if (!manifestSet.has(name)) {

      errors.push(`src 有 ${name}.vue 但 manifest 未登记`);

    }

  }

}



// 6. 非 scoped 逃逸

{

  for (const file of walkVueFiles(COMPONENTS)) {

    const base = path.basename(file);

    const content = fs.readFileSync(file, 'utf8');

    const hasScoped = /<style\s+scoped/.test(content);

    const hasPlainStyle = /<style(?!\s+scoped)/.test(content);

    if (hasPlainStyle && !hasScoped && !NON_SCOPED_ALLOW.has(base)) {

      warnings.push(`${relFromRoot(file)}: 仅非 scoped 样式，spacing CI 不覆盖`);

    }

  }

}



// 7. T2/T3 registry antiPatterns 须非空

{

  const { components } = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));

  let emptyTier = 0;

  for (const c of components) {

    if (c.package !== '@ocpui/vue') continue;

    if (c.tier !== 'T2' && c.tier !== 'T3') continue;

    const regPath = path.join(ROOT, c.registry);

    if (!exists(c.registry)) continue;

    const raw = fs.readFileSync(regPath, 'utf8');

    const fm = parseFrontmatter(raw);

    if (!fm) continue;

    if (!hasAntiPatterns(fm)) {

      emptyTier += 1;

      if (emptyTier <= 5) {

        errors.push(`registry ${c.name} (${c.tier}): antiPatterns 为空`);

      }

    }

  }

  if (emptyTier > 5) {

    errors.push(`… 另有 ${emptyTier - 5} 个 T2/T3 registry antiPatterns 为空`);

  }

}



// 8. 8 类目录均存在且各有组件

for (const category of Object.keys(CATEGORY_TYPE_CSS)) {

  const dir = path.join(COMPONENTS, category);

  if (!fs.existsSync(dir)) {

    errors.push(`组件目录缺失: ${category}/`);

    continue;

  }

  const count = walkVueFiles(dir).length;

  if (count === 0) {

    errors.push(`组件目录 ${category}/ 无 .vue 文件`);

  }

}



// 9. 每个 .vue 须落在 8 类目录之一

{

  const allowed = new Set(Object.keys(CATEGORY_TYPE_CSS));

  for (const file of walkVueFiles(COMPONENTS)) {

    const parts = relFromRoot(file).split('/');

    const cat = parts[2];

    if (!allowed.has(cat)) {

      errors.push(`${relFromRoot(file)}: 不在 8 类组件目录内`);

    }

  }

}



// 10. @ocpui/vue-admin：overlay-host 须经 useOverlayLayer 收口，禁止直接滚动锁
{
  const adminComponents = path.join(ADMIN_ROOT, 'src', 'components');
  if (fs.existsSync(adminComponents)) {
    for (const file of walkVueFiles(adminComponents)) {
      const src = fs.readFileSync(file, 'utf8');
      const rel = path.relative(ADMIN_ROOT, file).replace(/\\/g, '/');
      if (/lockBodyScroll|unlockBodyScroll/.test(src)) {
        errors.push(`vue-admin ${rel}: 禁止直接使用 lockBodyScroll，须用 useOverlayLayer 收口`);
      }
      if (/overlay-host/.test(src) && !/useOverlayLayer/.test(src)) {
        errors.push(`vue-admin ${rel}: overlay-host 缺少 useOverlayLayer 收口`);
      }
    }
  }
}

// 11. playground：每种组合模式至少一处演示
{
  if (fs.existsSync(PLAYGROUND_SRC)) {
    const playgroundVue = [];
    for (const ent of fs.readdirSync(PLAYGROUND_SRC, { withFileTypes: true, recursive: true })) {
      if (ent.isFile() && ent.name.endsWith('.vue')) {
        playgroundVue.push(fs.readFileSync(path.join(ent.parentPath ?? ent.path, ent.name), 'utf8'));
      }
    }
    const merged = playgroundVue.join('\n');
    for (const cls of COMBINATION_PATTERNS) {
      if (!merged.includes(cls)) {
        errors.push(`playground 未演示组合模式 ${cls}`);
      }
    }
  }
}



console.log('[check-design-system-coverage] 设计系统覆盖审计\n');



if (warnings.length) {

  console.log('--- 警告（不阻断，建议逐步消除）---');

  const show = warnings.length <= 20 ? warnings : warnings.slice(0, 15);

  for (const w of show) console.log(`[warn] ${w}`);

  if (warnings.length > 20) console.log(`… 另有 ${warnings.length - 15} 条警告`);

}



if (errors.length) {

  console.log('\n--- 阻断 ---');

  for (const e of errors) console.log(`[error] ${e}`);

  console.log(`\n检查失败：${errors.length} 项覆盖缺口。`);

  process.exit(1);

}



console.log('\n✓ 设计系统覆盖门禁通过。');

console.log(`  类型 CSS: ${Object.keys(CATEGORY_TYPE_CSS).length} 类`);

console.log(`  组合模式: ${COMBINATION_PATTERNS.length} 种`);

console.log(`  Overlay 锁滚: 自动扫描 lockBodyScroll 引用`);

if (warnings.length) console.log(`  警告: ${warnings.length}（见上）`);


