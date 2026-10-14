import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createJiti } from 'jiti';
import { normalizeDocgenConfig, type DocgenConfig } from '../config.js';

const CONFIG_NAMES = ['ocp-doc.config.ts', 'ocp-doc.config.mts', 'ocp-doc.config.js', 'ocp-doc.config.mjs'];

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function resolveThemeDir(theme?: string): string {
  if (!theme || theme === '@ocpui/docgen/theme-default' || theme === '@ocpui/vue-docs/theme-default') {
    return path.join(PKG_ROOT, 'theme-default');
  }
  if (path.isAbsolute(theme)) {
    return theme;
  }
  return path.resolve(process.cwd(), theme);
}

function loadConfigModule(configFile: string): DocgenConfig {
  const jiti = createJiti(import.meta.url, {
    interopDefault: true,
    alias: {
      '@ocpui/docgen': path.join(PKG_ROOT, 'src/index.ts'),
    },
  });
  const loaded = jiti(configFile) as DocgenConfig | { default: DocgenConfig };
  return (loaded as { default?: DocgenConfig }).default ?? (loaded as DocgenConfig);
}

/** 从项目根加载 ocp-doc.config.* */
export async function loadDocgenConfig(cwd: string = process.cwd()): Promise<ReturnType<typeof normalizeDocgenConfig>> {
  const root = path.resolve(cwd);

  for (const name of CONFIG_NAMES) {
    const configFile = path.join(root, name);
    if (!fs.existsSync(configFile)) {
      continue;
    }

    const config = loadConfigModule(configFile);
    const themeDir = resolveThemeDir(config.theme);
    return normalizeDocgenConfig(root, config, themeDir);
  }

  throw new Error(`[ocp-doc] 未找到配置文件（${CONFIG_NAMES.join(' / ')}）`);
}
