<!--
GlobalStyle 组件

公开属性：
- primaryColor: string - 主色调
- borderRadius: string - 边框半径
- fontSize: string - 基础字体大小
- fontFamily: string - 字体家族
- darkMode: boolean - 是否启用暗色模式

使用方式：
  基本用法:
  <GlobalStyle>
    <App />
  </GlobalStyle>

  自定义主题:
  <GlobalStyle
    primaryColor="#ff6b6b"
    borderRadius="8px"
    fontFamily="'Inter', sans-serif"
  >
    <App />
  </GlobalStyle>

  启用暗色模式:
  <GlobalStyle darkMode>
    <App />
  </GlobalStyle>
-->

<template>
  <slot />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch, ref } from 'vue';
import { useRafLoop } from '../../composables/useRafLoop';

interface Props {
  primaryColor?: string;
  borderRadius?: string;
  fontSize?: string;
  fontFamily?: string;
  darkMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  primaryColor: 'hsl(var(--primary))',
  borderRadius: '4px',
  fontSize: '16px',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  // darkMode 默认 undefined，不覆盖 main.ts 初始化的主题
  darkMode: undefined,
});

// 静态样式元素（只创建一次）
let staticStyleElement: HTMLStyleElement | null = null;
// 动态样式元素（用于可配置属性）
let dynamicStyleElement: HTMLStyleElement | null = null;

// 追踪之前的暗色模式状态；SSR 安全（document 仅在客户端读取）
const wasDarkMode = ref(props.darkMode ?? false);

// 缓存静态样式，避免重复计算
let cachedStaticStyles: string | null = null;

// 生成静态样式（只包含不常变化的样式）
const generateStaticStyles = (): string => {
  if (cachedStaticStyles) {
    return cachedStaticStyles;
  }
  
  cachedStaticStyles = `
  :root {
    /* 8px 基准栅格系统 */
    --space-2: 8px;
    --space-0: 0;
    --space-1: calc(var(--space-2) * 0.5);
    --space-3: calc(var(--space-2) * 1.5);
    --space-4: calc(var(--space-2) * 2);
    --space-5: calc(var(--space-2) * 2.5);
    --space-6: calc(var(--space-2) * 3);
    --space-8: calc(var(--space-2) * 4);
    --space-10: calc(var(--space-2) * 5);
    --space-12: calc(var(--space-2) * 6);
    --space-16: calc(var(--space-2) * 8);
    --space-20: calc(var(--space-2) * 10);
    --space-24: calc(var(--space-2) * 12);

    /* 响应式断点 */
    --breakpoint-sm: 640px;
    --breakpoint-md: 768px;
    --breakpoint-lg: 1024px;
    --breakpoint-xl: 1280px;
    --breakpoint-2xl: 1536px;

    /* 字体大小变量 */
    --font-size-xs: 12px;
    --font-size-sm: 14px;
    --font-size-md: 16px;
    --font-size-lg: 18px;
    --font-size-xl: 20px;
    --font-size-2xl: 24px;
    --font-size-3xl: 30px;

    /* 间距变量 (兼容旧变量) */
    --space-4-xs: 4px;
    --space-4-sm: 8px;
    --space-4-md: 16px;
    --space-4-lg: 24px;
    --space-4-xl: 32px;
    --space-4-2xl: 48px;

    /* 圆角系统 */
    --radius-md-sm: 8px;
    --radius-md-md: 12px;
    --radius-md-lg: 16px;
    --radius-md-xl: 20px;
    --radius-md-full: 9999px;

    /* 阴影系统 - 已迁移至 themes/tech/variables.css 统一管理 */

    /* 动画时长 */
    --transition-fast: 0.15s;
    --transition-normal: 0.25s;
    --transition-slow: 0.35s;

    /* 过渡效果变量 */
    --ease-out: cubic-bezier(0.22, 0.61, 0.36, 1);
    --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

    /* 成功、警告、错误、信息颜色 */
    --success: 160 60% 45%;
    --warning: 24 95% 53%;
    --error: 0 84% 60%;
    --info: 210 90% 50%;

    /* 触控区域最小尺寸 */
    --touch-min-size: 44px;

    /* 默认字体大小和间距 */
    --font-size-base: var(--font-size-md);
    --space-4-base: var(--space-4-md);
  }

  /* 响应式媒体查询 */
  @media (max-width: 639.98px) {
    :root {
      --font-size-base: var(--font-size-sm);
      --space-4-base: var(--space-4-sm);
    }
  }

  @media (min-width: 640px) and (max-width: 767.98px) {
    :root {
      --font-size-base: var(--font-size-sm);
      --space-4-base: var(--space-4-sm);
    }
  }

  @media (min-width: 768px) and (max-width: 1023.98px) {
    :root {
      --font-size-base: var(--font-size-md);
      --space-4-base: var(--space-4-md);
    }
  }

  @media (min-width: 1024px) and (max-width: 1279.98px) {
    :root {
      --font-size-base: var(--font-size-md);
      --space-4-base: var(--space-4-md);
    }
  }

  @media (min-width: 1280px) and (max-width: 1535.98px) {
    :root {
      --font-size-base: var(--font-size-lg);
      --space-4-base: var(--space-4-lg);
    }
  }

  @media (min-width: 1536px) {
    :root {
      --font-size-base: var(--font-size-xl);
      --space-4-base: var(--space-4-xl);
    }
  }

  /* 移动端触摸优化 */
  @media (hover: none) and (pointer: coarse) {
    button:not(.filter-tag-option):not(.chip-close):not(.tag-close):not(.carousel-dot),
    a, input, select, textarea {
      min-height: var(--touch-min-size);
      min-width: var(--touch-min-size);
    }

    .filter-tag-option {
      min-height: var(--pill-height-sm);
      min-width: auto;
    }

    button, a, .clickable {
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }

    .scrollable {
      -webkit-overflow-scrolling: touch;
    }

    * {
      touch-action: manipulation;
    }
  }

  .touch-feedback {
    transition: transform var(--transition-fast) var(--ease-out);
  }

  .touch-feedback:active {
    transform: scale(0.96);
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: var(--font-size-base);
    line-height: 1.6;
  }

  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6, .title {
    text-wrap: balance;
  }

  p, .body, .content {
    text-wrap: pretty;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: hsl(var(--border));
    border-radius: var(--radius-md-full);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--border-hover));
  }
`;
  
  return cachedStaticStyles;
};

// 缓存动态样式，避免重复计算
let cachedDynamicStyles: string | null = null;
let lastDynamicProps: Props | null = null;

const generateDynamicStyles = (p: Props): string => {
  if (cachedDynamicStyles && lastDynamicProps && 
      p.primaryColor === lastDynamicProps.primaryColor &&
      p.borderRadius === lastDynamicProps.borderRadius &&
      p.fontSize === lastDynamicProps.fontSize &&
      p.fontFamily === lastDynamicProps.fontFamily) {
    return cachedDynamicStyles;
  }

  const styles: string[] = [];

  styles.push(`
    :root {
      --font-sans: ${p.fontFamily};
    }
  `);

  if (p.borderRadius) {
    styles.push(`
      :root {
        --radius-md-sm: ${p.borderRadius};
        --radius-md-md: calc(${p.borderRadius} * 1.5);
        --radius-md-lg: calc(${p.borderRadius} * 2);
      }
    `);
  }

  if (p.fontSize) {
    styles.push(`
      :root {
        --font-size-base: ${p.fontSize};
      }
    `);
  }

  const result = styles.join('\n');
  cachedDynamicStyles = result;
  lastDynamicProps = { ...p };
  return result;
};

// 应用静态样式（只执行一次）；onMounted 内调用，DOM 已就绪
const applyStaticStyles = () => {
  if (document.getElementById('tech-global-style-static')) return;
  const el = document.createElement('style');
  el.id = 'tech-global-style-static';
  el.textContent = generateStaticStyles();
  document.head.appendChild(el);
  staticStyleElement = el;
};

// 动态样式：多次属性变化合并到下一帧统一提交，rAF 生命周期由 useRafLoop 管理
const dynamicRaf = useRafLoop((_t, controls) => {
  controls.stop();
  if (dynamicStyleElement) {
    const newStyles = generateDynamicStyles(props);
    if (dynamicStyleElement.textContent !== newStyles) {
      dynamicStyleElement.textContent = newStyles;
    }
  }
});

// 应用动态样式 - 使用 rAF 批量更新频繁变更
const applyDynamicStyles = () => {
  if (!dynamicStyleElement) {
    const el = document.createElement('style');
    el.id = 'tech-global-style-dynamic';
    if (!document.getElementById('tech-global-style-dynamic')) {
      document.head.appendChild(el);
    }
    dynamicStyleElement = el;
  }
  dynamicRaf.start();
};

// 同步切换暗色模式（初始化时使用，避免 RAF 延迟覆盖 main.ts 的设置）
// 注意：dark 类切换已移至 themes/index.ts 统一管理，这里只处理 data-theme 和 colorScheme
const setDarkModeSync = (isDark: boolean) => {
  const root = document.documentElement;
  root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  root.style.colorScheme = isDark ? 'dark' : 'light';
};

// 快速切换暗色模式（即时切换，无 RAF 延迟）
const toggleDarkMode = (isDark: boolean) => {
  setDarkModeSync(isDark);
};

// 初始化样式
const initStyles = () => {
  wasDarkMode.value = document.documentElement.classList.contains('dark');
  applyStaticStyles();
  applyDynamicStyles();
  // 只在明确传递了 darkMode prop 时才切换，避免覆盖 main.ts 初始化的主题
  // 使用同步版本，避免 RAF 延迟导致覆盖
  if (props.darkMode !== undefined) {
    setDarkModeSync(props.darkMode);
  }
};

// 清理样式；dynamicRaf 由其作用域销毁自动取消
const removeStyles = () => {
  dynamicRaf.stop();
  staticStyleElement?.remove();
  staticStyleElement = null;
  dynamicStyleElement?.remove();
  dynamicStyleElement = null;
};

// 监听属性变化
watch(() => props.darkMode, (newVal) => {
  if (newVal !== undefined && newVal !== wasDarkMode.value) {
    toggleDarkMode(newVal);
    wasDarkMode.value = newVal;
  }
});

// 监听其他属性变化（需要重新生成动态样式）
watch(() => [props.primaryColor, props.borderRadius, props.fontSize, props.fontFamily], () => {
  applyDynamicStyles();
}, { deep: true });

onMounted(() => {
  initStyles();
});

onUnmounted(() => {
  removeStyles();
});
</script>
