export * from '../components/types';

import type { InjectionKey } from 'vue';

// OCP Provider 注入键
export const UI_LOCALE_KEY = Symbol('ocpui.locale');
export const UI_THEME_KEY = Symbol('ocpui.theme');
export const UI_SCENARIO_KEY: InjectionKey<UiScenarioContext> =
  Symbol('ocpui.scenario');
export { UI_FEEDBACK_KEY } from '../feedback/feedback-bridge';

export type SurfacePresetId = 'list' | 'detail' | 'form' | 'overlay' | 'chart';
/** 页面壳语义：含公开消费站 consumer */
export type ScenePresetId =
  | 'workbench'
  | 'settings'
  | 'editor'
  | 'audit'
  | 'copilot'
  | 'consumer';
export type PresentationModeId = 'scan' | 'summary' | 'detail' | 'progressive' | 'read';

export type ShellDispatchRole =
  | 'focus-host'
  | 'chrome-host'
  | 'content-host'
  | 'overlay-host';

export type ShellFocusPolicy = 'restore-trigger' | 'lock';

export interface UiScenarioContext {
  surface?: SurfacePresetId;
  scene?: ScenePresetId;
  presentationMode?: PresentationModeId;
}
