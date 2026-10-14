export type LoadStateVariant = 'error' | 'not-found' | 'offline' | 'timeout';

const GENERIC_NETWORK_RE =
  /^(?:\[(?:GET|POST|PUT|PATCH|DELETE)\]|FetchError|Network Error|Failed to fetch|timeout)/i;

function readStatus(err: unknown): number | undefined {
  if (!err || typeof err !== 'object') return undefined;
  const o = err as { statusCode?: unknown; status?: unknown };
  if (typeof o.statusCode === 'number') return o.statusCode;
  if (typeof o.status === 'number') return o.status;
  return undefined;
}

function readMessage(err: unknown): string {
  if (err == null) return '';
  if (typeof err === 'string') return err;
  if (typeof err === 'object') {
    const o = err as { message?: unknown; statusMessage?: unknown };
    if (typeof o.message === 'string') return o.message;
    if (typeof o.statusMessage === 'string') return o.statusMessage;
  }
  if (err instanceof Error) return err.message;
  return '';
}

/**
 * 将未知错误映射为展示变体（404 / 离线 / 超时 / 通用错误）。
 */
export function resolveLoadStateVariant(
  error: unknown,
  explicit?: LoadStateVariant,
): LoadStateVariant {
  if (explicit) return explicit;
  const status = readStatus(error);
  if (status === 404) return 'not-found';
  if (status === 408 || status === 504 || status === 524) return 'timeout';

  const message = readMessage(error);
  if (
    status === 0
    || GENERIC_NETWORK_RE.test(message.trim())
    || /ECONNREFUSED|ENOTFOUND|ETIMEDOUT|network/i.test(message)
  ) {
    return 'offline';
  }

  return 'error';
}
