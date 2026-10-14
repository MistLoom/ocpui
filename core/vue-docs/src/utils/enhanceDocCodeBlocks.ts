/**
 * 为编译产物中的代码块挂载复制按钮；修复缺失 pre 围栏的块级 code
 */
export function enhanceDocCodeBlocks(root: HTMLElement): void {
  wrapOrphanBlockCodes(root);

  const blocks = root.querySelectorAll<HTMLElement>('pre:has(> code)');
  blocks.forEach((pre) => {
    if (pre.querySelector('.doc-code-block__copy')) {
      return;
    }

    const code = pre.querySelector('code');
    const highlighted = code ? hasShikiTokens(code) : false;
    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'doc-code-block__copy';
    copyBtn.textContent = '复制';
    copyBtn.setAttribute('aria-label', '复制代码');

    copyBtn.addEventListener('click', async () => {
      const text = code?.textContent ?? pre.textContent ?? '';
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = '已复制';
        window.setTimeout(() => {
          copyBtn.textContent = '复制';
        }, 1500);
      } catch {
        copyBtn.textContent = '失败';
      }
    });

    pre.classList.add('doc-code-block');
    if (highlighted) {
      pre.classList.add('shiki');
    }
    pre.appendChild(copyBtn);
  });
}

function hasShikiTokens(code: Element): boolean {
  return code.querySelector('[style*="color"]') != null;
}

/** 块级 code 缺少 pre 包裹时补全（避免被行内 code 样式覆盖） */
function wrapOrphanBlockCodes(root: HTMLElement): void {
  root.querySelectorAll('code').forEach((code) => {
    if (code.parentElement?.tagName === 'PRE') {
      return;
    }

    const languageClass = [...code.classList].find((item) => item.startsWith('language-'));
    const text = code.textContent ?? '';
    const isBlock = Boolean(languageClass) || text.includes('\n');
    if (!isBlock) {
      return;
    }

    const highlighted = hasShikiTokens(code);
    const pre = document.createElement('pre');
    pre.className = highlighted ? 'doc-code-block shiki' : 'doc-code-block';
    const language = languageClass?.slice('language-'.length) ?? '';
    if (language) {
      pre.dataset.language = language;
      pre.dataset.docCodeBlock = '';
    }

    const parent = code.parentElement;
    if (!parent) {
      return;
    }
    parent.insertBefore(pre, code);
    pre.appendChild(code);
  });
}
