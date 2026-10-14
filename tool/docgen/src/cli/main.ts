import path from 'node:path';
import { build, createServer, preview } from 'vite';
import { loadDocgenConfig } from '../core/load-config.js';
import { collectAllCollections } from '../core/collect-collection.js';
import { writeBuildArtifacts } from '../core/build-artifacts.js';
import { formatLinkcheckReport, runLinkcheck } from '../core/linkcheck.js';
import { createViteConfig } from '../vite/create-vite-config.js';

function printHelp() {
  console.log(`用法:
  ocp-doc dev          开发服务器（HMR）
  ocp-doc build        静态输出 dist/
  ocp-doc preview      预览 build
  ocp-doc index        仅重建 manifest 与检索索引
  ocp-doc linkcheck    死链报告`);
}

async function main() {
  const args = process.argv.slice(2);
  const sub = args[0];

  if (!sub || sub === '--help' || sub === '-h') {
    printHelp();
    process.exit(sub ? 0 : 1);
  }

  const config = await loadDocgenConfig(process.cwd());
  const outDir = path.resolve(config.root, config.outDir);

  switch (sub) {
    case 'dev': {
      const server = await createServer(createViteConfig(config, 'serve'));
      await server.listen();
      server.printUrls();
      break;
    }
    case 'build': {
      await build(createViteConfig(config, 'build'));
      console.log(`[ocp-doc] 构建完成 → ${outDir}`);
      break;
    }
    case 'preview': {
      const server = await preview(createViteConfig(config, 'build'));
      server.printUrls();
      break;
    }
    case 'index': {
      const collections = collectAllCollections(config);
      const artifacts = await writeBuildArtifacts(config, outDir, collections);
      console.log(`[ocp-doc] 索引已写入:\n  ${artifacts.manifestPath}\n  ${artifacts.searchIndexPath}`);
      break;
    }
    case 'linkcheck': {
      const collections = collectAllCollections(config);
      const report = await runLinkcheck(collections);
      console.log(formatLinkcheckReport(report));
      if (report.errors.length) {
        process.exit(1);
      }
      break;
    }
    default:
      printHelp();
      process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
