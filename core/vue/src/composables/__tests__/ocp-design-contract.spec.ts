import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('UiScenarioScope', () => {
  it('传播 presentationMode 至 data 属性', () => {
    const src = readFileSync(
      join(process.cwd(), '../vue/src/root/UiScenarioScope.vue'),
      'utf8',
    );
    expect(src).toContain('presentationMode');
    expect(src).toContain('data-ui-presentation-mode');
  });
});

describe('useReducedMotion', () => {
  it('导出 prefersReducedMotion 与 composable', () => {
    const src = readFileSync(
      join(process.cwd(), '../vue/src/composables/useReducedMotion.ts'),
      'utf8',
    );
    expect(src).toContain('prefers-reduced-motion: reduce');
    expect(src).toContain('useReducedMotion');
  });
});

describe('presentation-density', () => {
  it('presentationMode 密度 token 已挂载至 shared 主题链', () => {
    const density = readFileSync(
      join(process.cwd(), '../vue/src/themes/shared/presentation-density.css'),
      'utf8',
    );
    const sharedIndex = readFileSync(
      join(process.cwd(), '../vue/src/themes/shared/index.css'),
      'utf8',
    );
    expect(density).toContain("[data-ui-presentation-mode='scan']");
    expect(density).toContain('--density-space-scale');
    expect(sharedIndex).toContain('presentation-density.css');
  });
});

describe('focus-deemphasis', () => {
  it('overlay 降焦样式与 overlayScrollLock 属性联动，视觉参数取自权重 token', () => {
    const css = readFileSync(
      join(process.cwd(), '../vue/src/themes/shared/focus-deemphasis.css'),
      'utf8',
    );
    const lockSrc = readFileSync(
      join(process.cwd(), '../vue/src/components/feedback/overlayScrollLock.ts'),
      'utf8',
    );
    const sharedIndex = readFileSync(
      join(process.cwd(), '../vue/src/themes/shared/index.css'),
      'utf8',
    );
    expect(css).toContain('html[data-ui-overlay-active]');
    expect(css).toContain("[data-ui-dispatch-role='focus-host']");
    // W4 降焦禁止硬编码透明度（perception §4.2 token 约束）
    expect(css).toContain('var(--focus-weight-deemph-opacity)');
    expect(css).toContain('var(--focus-weight-deemph-contrast)');
    expect(css).not.toContain('opacity: 0.58');
    expect(lockSrc).toContain('data-ui-overlay-active');
    expect(sharedIndex).toContain('focus-deemphasis.css');
    expect(sharedIndex).toContain('focus-weight.css');
    expect(sharedIndex).toContain('type-interaction.css');
    expect(sharedIndex).toContain('type-animation.css');
  });
});

describe('perception 焦点权重（F:PERCEPTION §4）', () => {
  it('W0–W4 权重 token 定义于 L1 contract', () => {
    const contract = readFileSync(
      join(process.cwd(), '../vue/src/themes/contract/variables.css'),
      'utf8',
    );
    for (const token of [
      '--focus-weight-afforded-bg',
      '--focus-weight-afforded-border',
      '--focus-weight-primary-bg',
      '--focus-weight-primary-border',
      '--focus-weight-elevated-surface',
      '--focus-weight-elevated-shadow',
      '--focus-weight-deemph-opacity',
      '--focus-weight-flash-duration',
    ]) {
      expect(contract).toContain(token);
    }
  });

  it('W1/W2 选中样式统一在 focus-weight.css，含 aria-selected 非视觉通道', () => {
    const css = readFileSync(
      join(process.cwd(), '../vue/src/themes/shared/focus-weight.css'),
      'utf8',
    );
    expect(css).toContain('.ocp-weight-selected');
    expect(css).toContain("[aria-selected='true']");
    expect(css).toContain('.ocp-weight-flash');
    // W2 禁止脉冲动画：选中基础规则块只有 transition，无 animation
    const w2Block = css.slice(css.indexOf('.ocp-weight-selected,'), css.indexOf('}', css.indexOf('.ocp-weight-selected,')));
    expect(w2Block).toContain('transition');
    expect(w2Block).not.toContain('animation');
  });

  it('system 门面导出感知层 API', () => {
    const index = readFileSync(
      join(process.cwd(), '../vue/src/system/index.ts'),
      'utf8',
    );
    for (const name of ['FOCUS_WEIGHTS', 'MOTION_TRIGGERS', 'useRepeatGuard', 'useChangeFlash']) {
      expect(index).toContain(name);
    }
  });

  it('registry schema motion.trigger 为受控 enum（9 个信号）', () => {
    const schema = readFileSync(
      join(process.cwd(), '../../casus/docs/spec/registry/frontmatter-v2.schema.yaml'),
      'utf8',
    );
    for (const trigger of [
      'pointer_hover',
      'pointer_press',
      'user_select',
      'user_submit',
      'overlay_open',
      'expand_panel',
      'list_update',
      'focus_transfer',
      'system_event',
    ]) {
      expect(schema).toContain(`- ${trigger}`);
    }
    // interactionStates 含 selected（W2）
    expect(schema).toContain('selected');
  });
});

describe('违禁动效清理（motion-system §9 / visual-language §10）', () => {
  it('令牌层不再暴露 confetti / bounce / spring / glow / shimmer / float / orbit', () => {
    const tokensCss = readFileSync(
      join(process.cwd(), '../vue/src/themes/animation-tokens.css'),
      'utf8',
    );
    const tokensTs = readFileSync(
      join(process.cwd(), '../vue/src/themes/animation-tokens.ts'),
      'utf8',
    );
    const animations = readFileSync(
      join(process.cwd(), '../vue/src/themes/animations.css'),
      'utf8',
    );
    for (const banned of ['confetti', 'bounce', 'spring', 'glowPulse', 'shimmer', '@keyframes float', 'orbitRotate']) {
      expect(tokensCss.toLowerCase()).not.toContain(banned);
      expect(tokensTs.toLowerCase()).not.toContain(banned);
    }
    expect(animations).not.toContain('@keyframes glowPulse');
    expect(animations).not.toContain('@keyframes float');
    expect(animations).not.toContain('.animate-shimmer');
    expect(animations).not.toContain('.animate-breathe');
  });
});
