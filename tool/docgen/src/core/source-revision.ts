import crypto from 'node:crypto';

/** 由 Markdown 内容生成 revision（用于乐观锁） */
export function revisionFromContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
}
