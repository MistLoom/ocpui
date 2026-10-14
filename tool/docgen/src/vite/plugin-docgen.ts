import fs from 'node:fs';
import path from 'node:path';
import type { Plugin, ViteDevServer } from 'vite';
import type { ResolvedDocgenConfig } from '../config.js';
import { handleDocEditApiRequest } from '../core/doc-edit-api.js';
import { buildRuntimePayload, writeBuildArtifacts, type DocgenRuntimePayload } from '../core/build-artifacts.js';
import { collectAllCollections } from '../core/collect-collection.js';

/** 主题 / 消费方 import 的虚拟模块 id */
export const DOCGEN_VIRTUAL_ID = 'virtual:ocp-docgen';
const RESOLVED_ID = `\0${DOCGEN_VIRTUAL_ID}`;

/** 客户端 HMR 自定义事件：就地替换 runtime payload */
export const DOCGEN_HMR_UPDATE_EVENT = 'ocp-docgen:update';

/** 开发态权威 payload HTTP 入口（全页刷新由此读盘，避免 virtual 模块缓存嵌死旧 JSON） */
export const DOCGEN_RUNTIME_API_PATH = '/__ocp-doc/api/runtime';

export interface DocgenPluginOptions {
  config: ResolvedDocgenConfig;
  onPayload?: (payload: DocgenRuntimePayload) => void;
}

function serializeRuntimePayload(payload: DocgenRuntimePayload) {
  return {
    collections: payload.collections ?? [],
    manifests: payload.manifests ?? [],
    markdownPlugins: payload.markdownPlugins ?? [],
    searchIndexes: payload.searchIndexes ?? [],
    demoRegistry: payload.demoRegistry ?? {},
    editEnabled: payload.editEnabled ?? false,
  };
}

/**
 * 文档源变更后的统一刷新入口（保存 API / 文件监听共用）。
 * 其他项目若自建写盘路径，须在写盘成功后调用同等逻辑，不可只依赖 chokidar。
 */
export async function refreshDocgenRuntime(options: {
  server: ViteDevServer;
  rebuild: () => void;
  getPayload: () => Promise<DocgenRuntimePayload>;
  resolvedVirtualId?: string;
}): Promise<void> {
  options.rebuild();
  const payload = await options.getPayload();
  const mod = options.server.moduleGraph.getModuleById(options.resolvedVirtualId ?? RESOLVED_ID);
  if (mod) {
    options.server.moduleGraph.invalidateModule(mod);
  }
  options.server.ws.send({
    type: 'custom',
    event: DOCGEN_HMR_UPDATE_EVENT,
    data: serializeRuntimePayload(payload),
  });
}

/** docgen Vite 插件：注入 collection 数据并在 build 时写入 manifest / 检索索引 */
export function docgenPlugin(options: DocgenPluginOptions): Plugin {
  const { config } = options;
  let collections = collectAllCollections(config);
  let runtimePayloadPromise = buildRuntimePayload(config, collections, { editEnabled: false });
  let refreshGeneration = 0;
  let devEditEnabled = false;
  const outDir = path.resolve(config.root, config.outDir);
  const viteBase = (config.collections[0]?.base ?? '/') === '/' ? '/' : `${config.collections[0]?.base}/`;

  function rebuildPayload(editEnabled = devEditEnabled) {
    collections = collectAllCollections(config);
    runtimePayloadPromise = buildRuntimePayload(config, collections, { editEnabled });
    runtimePayloadPromise.then((payload) => options.onPayload?.(payload));
  }

  return {
    name: 'ocp-docgen',
    config(_userConfig, env) {
      devEditEnabled = env.command === 'serve' && config.editEnabled;
      rebuildPayload(devEditEnabled);
    },
    async buildStart() {
      // dev 模式下保留 config 钩子已设置的 devEditEnabled，build 时仍为 false
      rebuildPayload(devEditEnabled);
      const payload = await runtimePayloadPromise;
      options.onPayload?.(payload);
    },
    resolveId(id) {
      if (id === DOCGEN_VIRTUAL_ID) {
        return RESOLVED_ID;
      }
    },
    async load(id) {
      if (id !== RESOLVED_ID) {
        return;
      }
      // build：静态嵌入
      if (!devEditEnabled) {
        const payload = await runtimePayloadPromise;
        options.onPayload?.(payload);
        return `export default ${JSON.stringify(serializeRuntimePayload(payload))}`;
      }
      // serve：不嵌入 JSON。全页刷新走 HTTP 权威源，避开 Vite 对 virtual 模块的 transform 缓存。
      return [
        `import { reactive } from 'vue';`,
        `const res = await fetch(${JSON.stringify(DOCGEN_RUNTIME_API_PATH)});`,
        `if (!res.ok) {`,
        `  throw new Error('[ocp-doc] runtime payload 加载失败: ' + res.status);`,
        `}`,
        `const payload = reactive(await res.json());`,
        `if (import.meta.hot) {`,
        `  import.meta.hot.on(${JSON.stringify(DOCGEN_HMR_UPDATE_EVENT)}, (next) => {`,
        `    for (const key of Object.keys(next)) payload[key] = next[key];`,
        `  });`,
        `}`,
        `export default payload;`,
      ].join('\n');
    },
    configureServer(server) {
      // server root 是主题目录，而 Markdown 源在 config.root 下（root 外），
      // chokidar 默认不监听；显式纳入各 collection src
      const collectionSrcDirs = config.collections
        .map((item) => path.resolve(config.root, item.src));
      for (const dir of collectionSrcDirs) {
        server.watcher.add(dir);
      }

      const runRefresh = async (reason: string) => {
        const gen = ++refreshGeneration;
        process.stdout.write(`[docgen-refresh] ${reason} #${gen}\n`);
        await refreshDocgenRuntime({
          server,
          rebuild: () => rebuildPayload(devEditEnabled),
          getPayload: () => runtimePayloadPromise,
          resolvedVirtualId: RESOLVED_ID,
        });
        if (gen === refreshGeneration) {
          process.stdout.write(`[docgen-push] sending custom event #${gen}\n`);
        }
      };

      const onWatchedMarkdown = (file: string) => {
        if (!file.endsWith('.md')) {
          return;
        }
        void runRefresh(`watch:${path.basename(file)}`);
      };

      server.watcher.on('change', onWatchedMarkdown);
      server.watcher.on('add', onWatchedMarkdown);
      server.watcher.on('unlink', onWatchedMarkdown);

      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split('?')[0] ?? '';
        const normalized = pathname.startsWith(viteBase.slice(0, -1))
          ? pathname.slice(viteBase.length - 1)
          : pathname;

        // 全页刷新权威入口：始终按磁盘重建后再返回
        if (devEditEnabled && normalized === DOCGEN_RUNTIME_API_PATH && req.method === 'GET') {
          rebuildPayload(true);
          const payload = await runtimePayloadPromise;
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          res.end(`${JSON.stringify(serializeRuntimePayload(payload))}\n`);
          return;
        }

        if (
          devEditEnabled &&
          handleDocEditApiRequest(config, collections, normalized, req, res, {
            onSourceSaved: () => {
              void runRefresh('save');
            },
          })
        ) {
          return;
        }

        if (normalized === '/doc-manifest.json' || normalized === 'doc-manifest.json') {
          const payload = await runtimePayloadPromise;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(`${JSON.stringify(payload.manifests, null, 2)}\n`);
          return;
        }

        if (normalized === '/assets/search-index.json' || normalized === 'assets/search-index.json') {
          const { buildSearchIndexPayload } = await import('../core/build-artifacts.js');
          const searchPayload = await buildSearchIndexPayload(collections);
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(`${JSON.stringify(searchPayload, null, 2)}\n`);
          return;
        }

        next();
      });
    },
    async closeBundle() {
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      await writeBuildArtifacts(config, outDir, collections);
    },
  };
}
