import fs from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { findSourceById, type DocCollection } from '@ocpui/markdown-core';
import type { ResolvedDocgenConfig } from '../config.js';
import { revisionFromContent } from './source-revision.js';

const API_PREFIX = '/__ocp-doc/api';

export interface DocSaveRequestBody {
  collectionId: string;
  sourceId: string;
  markdown: string;
  revision?: string;
}

export interface DocSaveSuccessResponse {
  revision: string;
}

export interface DocSaveConflictResponse {
  error: 'conflict';
  remoteMarkdown: string;
  remoteRevision: string;
}

export interface DocSourceResponse {
  markdown: string;
  revision: string;
  path: string;
}

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (cause) {
        reject(cause);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(`${JSON.stringify(body)}\n`);
}

function resolveSourceAbsolutePath(
  config: ResolvedDocgenConfig,
  collection: DocCollection,
  sourceId: string,
): { absolutePath: string; source: NonNullable<ReturnType<typeof findSourceById>> } | null {
  const source = findSourceById(collection, sourceId);
  if (!source) {
    return null;
  }
  const collectionConfig = config.collections.find((item) => item.id === collection.id);
  if (!collectionConfig) {
    return null;
  }
  const srcDir = path.resolve(config.root, collectionConfig.src);
  const absolutePath = path.resolve(srcDir, source.path);
  // Windows 下勿用 startsWith（盘符大小写/分隔符会导致误拒）
  const relative = path.relative(srcDir, absolutePath);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    return null;
  }
  return { absolutePath, source };
}

export interface DocEditApiHooks {
  /** 磁盘写入成功后回调（用于同进程写盘后主动重建 payload，不依赖 chokidar） */
  onSourceSaved?: (absolutePath: string) => void;
}

export function handleDocEditApiRequest(
  config: ResolvedDocgenConfig,
  collections: DocCollection[],
  pathname: string,
  req: IncomingMessage,
  res: ServerResponse,
  hooks: DocEditApiHooks = {},
): boolean {
  if (!pathname.startsWith(API_PREFIX)) {
    return false;
  }

  const subPath = pathname.slice(API_PREFIX.length);

  if (subPath === '/source' && req.method === 'GET') {
    const url = new URL(req.url ?? '', 'http://localhost');
    const collectionId = url.searchParams.get('collectionId') ?? '';
    const sourceId = url.searchParams.get('sourceId') ?? '';
    const collection = collections.find((item) => item.id === collectionId);
    if (!collection) {
      sendJson(res, 404, { error: 'collection_not_found' });
      return true;
    }
    const resolved = resolveSourceAbsolutePath(config, collection, sourceId);
    if (!resolved) {
      sendJson(res, 404, { error: 'source_not_found' });
      return true;
    }
    const markdown = fs.readFileSync(resolved.absolutePath, 'utf8');
    const payload: DocSourceResponse = {
      markdown,
      revision: revisionFromContent(markdown),
      path: resolved.source.path,
    };
    sendJson(res, 200, payload);
    return true;
  }

  if (subPath === '/save' && req.method === 'POST') {
    void (async () => {
      try {
        const body = (await readJsonBody(req)) as DocSaveRequestBody;
        const collection = collections.find((item) => item.id === body.collectionId);
        if (!collection) {
          sendJson(res, 404, { error: 'collection_not_found' });
          return;
        }
        const resolved = resolveSourceAbsolutePath(config, collection, body.sourceId);
        if (!resolved) {
          sendJson(res, 404, { error: 'source_not_found' });
          return;
        }
        const current = fs.readFileSync(resolved.absolutePath, 'utf8');
        const currentRevision = revisionFromContent(current);
        if (body.revision && body.revision !== currentRevision) {
          const conflict: DocSaveConflictResponse = {
            error: 'conflict',
            remoteMarkdown: current,
            remoteRevision: currentRevision,
          };
          sendJson(res, 409, conflict);
          return;
        }
        fs.writeFileSync(resolved.absolutePath, body.markdown, 'utf8');
        const nextRevision = revisionFromContent(body.markdown);
        const success: DocSaveSuccessResponse = { revision: nextRevision };
        // 必须在响应前触发：同进程写盘常不触发 chokidar，刷新会继续吃旧 payload
        hooks.onSourceSaved?.(resolved.absolutePath);
        sendJson(res, 200, success);
      } catch (cause) {
        sendJson(res, 500, {
          error: 'save_failed',
          message: cause instanceof Error ? cause.message : String(cause),
        });
      }
    })();
    return true;
  }

  sendJson(res, 404, { error: 'not_found' });
  return true;
}

/** 供测试：保存逻辑（不依赖 HTTP） */
export function saveDocSourceContent(options: {
  config: ResolvedDocgenConfig;
  collection: DocCollection;
  sourceId: string;
  markdown: string;
  revision?: string;
}): DocSaveSuccessResponse | DocSaveConflictResponse {
  const resolved = resolveSourceAbsolutePath(options.config, options.collection, options.sourceId);
  if (!resolved) {
    throw new Error('source_not_found');
  }
  const current = fs.readFileSync(resolved.absolutePath, 'utf8');
  const currentRevision = revisionFromContent(current);
  if (options.revision && options.revision !== currentRevision) {
    return {
      error: 'conflict',
      remoteMarkdown: current,
      remoteRevision: currentRevision,
    };
  }
  fs.writeFileSync(resolved.absolutePath, options.markdown, 'utf8');
  return { revision: revisionFromContent(options.markdown) };
}

/** 供测试：读取源 Markdown */
export function readDocSourceContent(
  config: ResolvedDocgenConfig,
  collection: DocCollection,
  sourceId: string,
): DocSourceResponse {
  const resolved = resolveSourceAbsolutePath(config, collection, sourceId);
  if (!resolved) {
    throw new Error('source_not_found');
  }
  const markdown = fs.readFileSync(resolved.absolutePath, 'utf8');
  return {
    markdown,
    revision: revisionFromContent(markdown),
    path: resolved.source.path,
  };
}
