#!/usr/bin/env node
/**
 * ocp-doc CLI 入口
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { register } from 'tsx/esm/api';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
register();
await import(pathToFileURL(path.resolve(__dirname, '../src/cli/main.ts')).href);
