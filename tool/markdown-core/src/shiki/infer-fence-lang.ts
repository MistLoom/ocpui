/**
 * 推断无语言标记围栏的 shiki 语言 id
 */
export function inferFenceLanguage(source: string): string | null {
  const text = source.replace(/\r\n/g, '\n').trimEnd();
  if (!text.trim()) {
    return null;
  }

  if (isTreeDiagram(text)) {
    return 'tree';
  }

  if (isDirectoryListing(text)) {
    return 'tree';
  }

  if (isPriorityChain(text)) {
    return 'tree';
  }

  return null;
}

/** 含框线字符或典型树形缩进 */
function isTreeDiagram(text: string): boolean {
  if (/[├└│─╭╮╰╯┬┴┼═║]/.test(text)) {
    return true;
  }

  const lines = text.split('\n');
  const treeLines = lines.filter((line) => /^\s*[└├│]─?\s*/.test(line) || /^\s+\S.*#\s/.test(line));
  return treeLines.length >= 1 && lines.length >= 2;
}

/** 纯路径/目录列表（如 apps/admin/src/...） */
function isDirectoryListing(text: string): boolean {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0 || lines.length > 12) {
    return false;
  }

  const pathLike = lines.filter((line) =>
    /^[\w@./\\\-*]+(?:\/[\w@./\\\-*]+)*\/?(?:\s+#.*)?$/.test(line),
  );
  return pathLike.length === lines.length && pathLike.some((line) => line.includes('/'));
}

/** 单行优先级链：焦点 > 呈现 > 元素 */
function isPriorityChain(text: string): boolean {
  const line = text.trim();
  if (line.includes('\n')) {
    return false;
  }
  const parts = line.split('>').map((part) => part.trim());
  return parts.length >= 3 && parts.every((part) => part.length > 0 && part.length < 24);
}
