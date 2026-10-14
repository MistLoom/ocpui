<template>
  <div
    ref="rootEl"
    :class="rootClass"
    :data-ui-mode="effectiveMode"
    :data-ui-surface="resolvedSurface"
    :data-ui-scene="resolvedScene"
    :data-ui-presentation-mode="resolvedPresentationMode"
    :data-ui-reduced-motion="reducedMotion ? 'true' : undefined"
    role="presentation"
  >
    <ToastContainer :position="toastPosition" />
    <OverlayHost />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, provide } from 'vue';
import ToastContainer from '../components/utility/ToastContainer.vue';
import OverlayHost from '../feedback/OverlayHost.vue';
import {
  type ColorMode,
  type ThemeName,
  type ThemeConfig,
  type CustomThemeConfig,
  type ThemeStyleId,
  defaultThemeConfig,
  getCurrentThemeConfig,
  saveThemeConfig,
  applyTheme,
} from '../themes';
import {
  UI_LOCALE_KEY,
  UI_THEME_KEY,
  UI_SCENARIO_KEY,
  type SurfacePresetId,
  type ScenePresetId,
  type PresentationModeId,
  type UiScenarioContext,
} from '../types';
import { mergeUiLocale, defaultLocales, type UiLocaleMessages } from '../locale';
import type { ToastPosition } from '../components/utility/toast.types';
import {
  createUiFeedbackBridge,
  UI_FEEDBACK_KEY,
  type ErrorResolver,
} from '../feedback';
import { useReducedMotion } from '../composables/useReducedMotion';
import { createPerceptionController } from '../system/perception/controller';
import { UI_PERCEPTION_KEY } from '../system/perception/runtime';
import type { SignalPolicy } from '../system/perception/signals';
import type { PerceptionStrategy } from '../system/perception/strategy-types';

interface Props {
  locale?: UiLocaleMessages;
  localeCode?: keyof typeof defaultLocales;
  theme?: Partial<ThemeConfig>;
  themeStyle?: ThemeStyleId;
  surface?: SurfacePresetId;
  scene?: ScenePresetId;
  /** 信息密度与焦点策略 */
  presentationMode?: PresentationModeId;
  storageKey?: string;
  toastPosition?: ToastPosition;
  customTheme?: CustomThemeConfig;
  customClass?: string;
  /** 将未知错误映射为用户可读文案；返回 undefined 时走默认 message */
  errorResolver?: ErrorResolver;
  /** 全局感知识别策略（前置接入，后注册先执行），用于按场景改写信号意图/通道 */
  perceptionPolicies?: SignalPolicy[];
  /** 场景策略包（§11）；与 builtin 合并，同 id 覆盖 */
  perceptionStrategies?: PerceptionStrategy[];
  /** 是否装载全部 builtin 场景策略，默认 true */
  perceptionIncludeBuiltins?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  locale: undefined,
  localeCode: 'zh-CN',
  theme: undefined,
  themeStyle: undefined,
  surface: undefined,
  scene: undefined,
  presentationMode: undefined,
  storageKey: 'ocpui-theme-config',
  toastPosition: 'top',
  customTheme: undefined,
  customClass: '',
  errorResolver: undefined,
  perceptionPolicies: () => [],
  perceptionStrategies: () => [],
  perceptionIncludeBuiltins: true,
});

const mergedConfig = computed<ThemeConfig>(() => ({
  ...defaultThemeConfig,
  ...props.theme,
  ...(props.themeStyle ? { themeStyle: props.themeStyle } : {}),
}));

const currentMode = ref<ColorMode>(mergedConfig.value.mode);
const currentTheme = ref<ThemeName>(mergedConfig.value.theme);
const systemPrefersDark = ref(false);

const reducedMotion = useReducedMotion();

const feedbackBridge = createUiFeedbackBridge({
  errorResolver: (err) => props.errorResolver?.(err),
});

/* 感知中央控制器：绑定根元素用于 overlay 背景 inert 隔离的查询范围 */
const rootEl = ref<HTMLElement>();
const perceptionController = createPerceptionController(rootEl, {
  strategies: props.perceptionStrategies,
  includeBuiltins: props.perceptionIncludeBuiltins,
  reducedMotion: () => reducedMotion.value,
});
props.perceptionPolicies?.forEach((policy) => perceptionController.usePolicy(policy));
watch(reducedMotion, () => {
  perceptionController.setReducedMotion(() => reducedMotion.value);
});
provide(UI_PERCEPTION_KEY, perceptionController);

const effectiveMode = computed(() => {
  if (currentMode.value === 'system') {
    return systemPrefersDark.value ? 'dark' : 'light';
  }
  return currentMode.value === 'dark' ? 'dark' : 'light';
});

const resolvedSurface = computed(() => props.surface ?? 'list');
const resolvedScene = computed(() => props.scene ?? 'workbench');
const resolvedPresentationMode = computed(
  () => props.presentationMode ?? 'summary',
);

const rootClass = computed(() => {
  const classes = [
    'ocpui-root',
    `theme-${mergedConfig.value.themeStyle}`,
    `ocpui-root--${effectiveMode.value}`,
  ];
  if (reducedMotion.value) classes.push('ocpui-root--reduced-motion');
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const localeMessages = computed(() =>
  mergeUiLocale(
    defaultLocales[props.localeCode] ?? defaultLocales['zh-CN'],
    props.locale,
  ),
);

provide(UI_LOCALE_KEY, localeMessages);
provide(UI_FEEDBACK_KEY, feedbackBridge);
provide(UI_THEME_KEY, {
  mode: currentMode,
  effectiveMode,
  theme: currentTheme,
  config: mergedConfig,
});
provide(UI_SCENARIO_KEY, {
  get surface() {
    return resolvedSurface.value;
  },
  get scene() {
    return resolvedScene.value;
  },
  get presentationMode() {
    return resolvedPresentationMode.value;
  },
});

function applyThemeConfig(): void {
  const config: ThemeConfig = {
    ...mergedConfig.value,
    mode: currentMode.value,
    theme: currentTheme.value,
  };
  if (typeof window !== 'undefined') {
    saveThemeConfig(config, props.storageKey);
  }
  applyTheme(config, props.customTheme);
}

let mediaQuery: MediaQueryList | null = null;

function handleSystemThemeChange(e: MediaQueryListEvent | MediaQueryList) {
  systemPrefersDark.value = 'matches' in e ? e.matches : false;
  if (currentMode.value === 'system') applyThemeConfig();
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    try {
      const saved = getCurrentThemeConfig(props.storageKey);
      if (saved.mode) currentMode.value = saved.mode;
      if (saved.theme) currentTheme.value = saved.theme;
    } catch {
      /* 忽略 */
    }
    if (window.matchMedia) {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      handleSystemThemeChange(mediaQuery);
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    }
  }
  applyThemeConfig();
});

onUnmounted(() => {
  mediaQuery?.removeEventListener('change', handleSystemThemeChange);
});

watch(
  [currentMode, currentTheme, () => mergedConfig.value.radius, () => mergedConfig.value.density],
  () => applyThemeConfig(),
);
</script>

<style scoped>
.ocpui-root {
  width: 100%;
  min-height: 100%;
  font-family: var(--font-sans);
  color: hsl(var(--text));
  background: hsl(var(--background));
}
</style>
