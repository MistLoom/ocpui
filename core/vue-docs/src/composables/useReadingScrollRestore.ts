import { onBeforeUnmount, onMounted, type Ref } from 'vue';

function scrollStorageKey(docId: string): string {
  return `ocp-doc-scroll:${docId}`;
}

/** 离开页面时保存 scroll，返回时恢复 */
export function useReadingScrollRestore(
  docId: Ref<string | undefined> | string | undefined,
  enabled = true,
): void {
  onMounted(() => {
    if (!enabled) {
      return;
    }
    const id = typeof docId === 'string' ? docId : docId?.value;
    if (!id) {
      return;
    }
    const raw = sessionStorage.getItem(scrollStorageKey(id));
    if (raw) {
      const y = Number(raw);
      if (Number.isFinite(y)) {
        requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'auto' }));
      }
    }
  });

  onBeforeUnmount(() => {
    if (!enabled) {
      return;
    }
    const id = typeof docId === 'string' ? docId : docId?.value;
    if (!id) {
      return;
    }
    sessionStorage.setItem(scrollStorageKey(id), String(window.scrollY));
  });
}
