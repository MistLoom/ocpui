/** 预取指定文档路径关联的 demo 模块（侧栏 hover） */
export async function prefetchDemosForDocPath(
  demoRegistry: Record<string, { id: string; docPath: string }>,
  docPath: string,
): Promise<void> {
  if (!docPath) {
    return;
  }
  const entries = Object.values(demoRegistry).filter((item) => item.docPath === docPath);
  if (entries.length === 0) {
    return;
  }
  const { loadDocDemo } = await import('virtual:ocp-doc-demos');
  await Promise.allSettled(entries.map((item) => loadDocDemo(item.id)));
}
