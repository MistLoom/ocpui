import { inject } from 'vue';
import { UI_SCENARIO_KEY, type UiScenarioContext } from '../types';

/** 读取 UiRoot / UiScenarioScope 注入的 surface、scene、presentationMode */
export function useUiScenario(): UiScenarioContext {
  return inject(UI_SCENARIO_KEY, {});
}
