export { defineDocgenConfig, normalizeDocgenConfig, normalizeBasePath } from './config.js';
export type { DocgenConfig, DocgenCollectionConfig, ResolvedDocgenConfig } from './config.js';
export { loadDocgenConfig } from './core/load-config.js';
export { collectCollectionSources, collectAllCollections } from './core/collect-collection.js';
export { writeBuildArtifacts, buildRuntimePayload } from './core/build-artifacts.js';
export { runLinkcheck } from './core/linkcheck.js';
export type { LinkcheckIssue, LinkcheckReport } from './core/linkcheck.js';
export { createViteConfig } from './vite/create-vite-config.js';
export {
  docgenPlugin,
  refreshDocgenRuntime,
  DOCGEN_VIRTUAL_ID,
  DOCGEN_HMR_UPDATE_EVENT,
  DOCGEN_RUNTIME_API_PATH,
} from './vite/plugin-docgen.js';
