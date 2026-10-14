<template>
  <Motion
    :initial="{ y: -100 }"
    :animate="{ y: 0 }"
    :transition="{ duration: 0.22 }"
    tag="header"
    class="fixed top-0 left-0 right-0 z-50 hud-nav"
    :style="{
      backgroundColor: isScrolled
        ? 'hsl(var(--surface) / 0.5)'
        : 'hsl(var(--surface) / 0.95)',
      backdropFilter: isScrolled ? 'blur(8px)' : 'blur(12px)',
      WebkitBackdropFilter: isScrolled ? 'blur(8px)' : 'blur(12px)',
      borderBottomColor: isScrolled
        ? 'hsl(var(--border) / 0.2)'
        : 'hsl(var(--border))',
      boxShadow: isScrolled
        ? '0 1px 4px hsl(var(--text) / 0.03), 0 1px 2px hsl(var(--text) / 0.02)'
        : '0 2px 8px hsl(var(--text) / 0.06), 0 1px 2px hsl(var(--text) / 0.04)',
      transition: 'background-color var(--duration-normal) var(--ease-standard), backdrop-filter var(--duration-normal) var(--ease-standard), -webkit-backdrop-filter var(--duration-normal) var(--ease-standard), border-bottom-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard)'
    }"
  >
    <div :class="[maxWidth, 'mx-auto', 'relative', 'header-container']" :style="{
      paddingLeft: paddingX,
      paddingRight: paddingX
    }">
      <div class="flex items-center justify-between" :style="{
        height: height === 'h-20' ? '5rem' : height,
        gap: gap === 'gap-2' ? '0.5rem' : gap
      }">
        <!-- Logo: 系统标识 -->
        <Motion
          class="system-logo flex-shrink-0"
          :whileHover="{}"
          :transition="{ duration: 0.14 }"
        >
          <div v-if="!logo" class="system-logo-icon"></div>
          <img v-else :src="logo" :alt="logoAlt" class="system-logo-img" />
          <span v-if="brandName" class="system-logo-text hidden sm:inline">{{ brandName }}</span>
        </Motion>

        <!-- Navigation: 任务节点 / 扩展面板切换 - 仅在桌面端显示 (>=768px) -->
        <nav
          v-if="!isMobile"
          class="flex items-center gap-0 absolute left-1/2 -translate-x-1/2 nav-switch-container"
        >
          <!-- 导航菜单 -->
          <Motion
            :initial="false"
            :animate="{ 
              opacity: showPanel ? 0 : 1,
              y: showPanel ? -4 : 0
            }"
            :transition="{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }"
            class="flex items-center gap-0 nav-menu-container"
            :style="{ 
              pointerEvents: showPanel ? 'none' : 'auto'
            }"
          >
            <template v-for="(item, index) in navItems" :key="item.id">
              <button
                @click="handleNavClick(item)"
                :class="[
                  'nav-node',
                  activeSection === item.id ? 'active' : ''
                ]"
                :tabindex="0"
                @keydown="handleNavKeydown(item, $event)"
              >
                {{ item.label }}
              </button>
              <div v-if="index < navItems.length - 1" class="nav-connector"></div>
            </template>
          </Motion>

          <!-- 扩展面板插槽 -->
          <Motion
            :initial="false"
            :animate="{ 
              opacity: showPanel ? 1 : 0,
              y: showPanel ? 0 : 4
            }"
            :transition="{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }"
            class="Panel-container"
            :style="{ 
              pointerEvents: showPanel ? 'auto' : 'none'
            }"
          >
            <slot name="Panel"></slot>
          </Motion>
        </nav>

        <!-- 右侧：自定义操作区 + 移动端菜单按钮 -->
        <div class="flex items-center gap-3 flex-shrink-0">
          <!-- 自定义操作区 -->
          <slot name="actions"></slot>

          <!-- 移动端菜单按钮 - 仅在移动端显示 (<768px) -->
          <button
            v-if="isMobile"
            @click="toggleMobileMenu"
            class="mobile-menu-button"
            :aria-label="showMobileMenu ? t('header.closeMenu') : t('header.openMenu')"
            :aria-expanded="showMobileMenu"
            :tabindex="0"
            @keydown="handleMobileMenuKeydown($event)"
          >
            <svg v-if="!showMobileMenu" class="mobile-menu-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 4h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M2 8h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M2 12h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <svg v-else class="mobile-menu-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 移动端导航抽屉 -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-300 ease-in"
      enter-from-class="opacity-0 translate-x-full"
      enter-to-class="opacity-100 translate-x-0"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 translate-x-full"
    >
      <div
        v-if="showMobileMenu"
        class="mobile-menu-overlay"
        @click="closeMobileMenu"
      >
        <div
          class="mobile-menu-drawer"
          @click.stop
        >
          <div class="mobile-menu-header">
            <span class="mobile-menu-title">{{ t('header.navigation') }}</span>
            <button
              @click="closeMobileMenu"
              class="mobile-menu-close"
              :aria-label="t('header.closeMenu')"
              :tabindex="0"
              @keydown="handleCloseMenuKeydown($event)"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
          <nav class="mobile-menu-nav">
            <button
              v-for="item in navItems" 
              :key="item.id"
              @click="handleMobileNavClick(item)"
              :class="[
                'mobile-menu-item',
                activeSection === item.id ? 'mobile-menu-item-active' : ''
              ]"
              :tabindex="0"
              @keydown="handleMobileNavKeydown(item, $event)"
            >
              {{ item.label }}
            </button>
            
            <!-- 移动端自定义操作区 -->
            <slot name="mobile-actions"></slot>
          </nav>
        </div>
      </div>
    </Transition>


  </Motion>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { Motion } from 'motion-v';
import { X } from 'lucide-vue-next';
import { useUiT } from '@ocpui/vue/composables/useUiT';

/**
 * 导航栏组件，用于页面顶部导航
 * 
 * @props logo -  logo 图片路径
 * @props logoAlt -  logo 图片 alt 文本
 * @props brandName - 品牌名称
 * @props navItems - 导航项数组
 * @props paddingX - 水平内边距
 * @props maxWidth - 最大宽度
 * @props height - 导航栏高度
 * @props gap - 间距
 * @props showPanel - 是否显示扩展面板
 * 
 * @emits navigate - 当点击导航项时触发
 * 
 * @slots actions - 右侧自定义操作区
 * @slots mobile-actions - 移动端自定义操作区
 * @slots Panel - 扩展面板
 */

export interface NavItem {
  id: string;
  label: string;
}

interface Props {
  logo?: string;
  logoAlt?: string;
  brandName?: string;
  navItems?: NavItem[];
  paddingX?: string;
  maxWidth?: string;
  height?: string;
  gap?: string;
  showPanel?: boolean;
}

interface Emits {
  (e: 'navigate', item: NavItem): void;
}

const props = withDefaults(defineProps<Props>(), {
  logo: '',
  logoAlt: 'Logo',
  brandName: '',
  navItems: () => [],
  paddingX: '4px sm:6px lg:12px',
  maxWidth: 'max-w-7xl',
  height: 'h-20',
  gap: 'gap-2',
  showPanel: false
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
void props;

const emit = defineEmits<Emits>();

const { uiT: t } = useUiT();

const isMobile = ref(false);

const checkMobile = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 768;
  }
};

// 导航相关状态
const activeSection = ref('hero');
const isScrolled = ref(false);

// 移动端菜单状态
const showMobileMenu = ref(false);

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
  if (showMobileMenu.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

const closeMobileMenu = () => {
  showMobileMenu.value = false;
  document.body.style.overflow = '';
};

const handleNavClick = (item: NavItem) => {
  activeSection.value = item.id;
  scrollToSection(item.id);
  emit('navigate', item);
};

const handleMobileNavClick = (item: NavItem) => {
  handleNavClick(item);
  closeMobileMenu();
};

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    // 获取固定头部高度
    const header = document.querySelector('header') || 
                   document.querySelector('.hud-nav') ||
                   document.querySelector('[class*="header"]');
    const headerHeight = header ? header.getBoundingClientRect().height : 80; // 默认80px
    
    // 计算目标滚动位置（考虑固定头部）
    const targetOffsetTop = element.getBoundingClientRect().top + window.scrollY;
    const scrollPosition = targetOffsetTop - headerHeight;
    
    // 使用 window.scrollTo 实现平滑滚动
    window.scrollTo({
      top: Math.max(0, scrollPosition),
      behavior: 'smooth'
    });
    
    // 更新 URL hash
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${id}`);
    }
  }
};

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && showMobileMenu.value) {
    closeMobileMenu();
  }
};

const handleScroll = () => {
  const scrollY = window.scrollY;
  isScrolled.value = scrollY > 50;
};

const handleNavKeydown = (item: NavItem, event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleNavClick(item);
  }
};

const handleMobileMenuKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toggleMobileMenu();
  }
};

const handleCloseMenuKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    closeMobileMenu();
  }
};

const handleMobileNavKeydown = (item: NavItem, event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleMobileNavClick(item);
  }
};

watch(isMobile, (newValue) => {
  if (!newValue && showMobileMenu.value) {
    closeMobileMenu();
  }
});

onMounted(() => {
  checkMobile();
  
  let resizeTimer: ReturnType<typeof setTimeout> | null = null;
  const handleResize = () => {
    if (resizeTimer) {
      clearTimeout(resizeTimer);
    }
    resizeTimer = setTimeout(() => {
      checkMobile();
    }, 150);
  };
  
  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', handleScroll, { passive: true });
  document.addEventListener('keydown', handleEscape);
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('scroll', handleScroll);
    document.removeEventListener('keydown', handleEscape);
    if (resizeTimer) {
      clearTimeout(resizeTimer);
    }
    document.body.style.overflow = '';
  });
});
</script>

<style scoped>
.hud-nav {
  background: hsl(var(--surface) / 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid hsl(var(--border));
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  overflow: visible;
  box-shadow:
    0 2px 8px hsl(var(--text) / 0.06),
    0 1px 2px hsl(var(--text) / 0.04);
}

.hud-nav::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: hsl(var(--accent) / 0.6);
  opacity: 0.5;
}

.hud-nav::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: hsl(var(--border) / 0.2);
}

.system-logo {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px;
  border-radius: 10px;
  transition: background-color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard);
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
}

.system-logo:hover {
  background: hsl(var(--primary) / 0.08);
  border-color: hsl(var(--primary) / 0.2);
}

.system-logo-icon {
  width: 36px;
  height: 36px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid hsl(var(--primary) / 0.4);
  background: hsl(var(--surface));
  border-radius: 8px;
  transition: border-color var(--duration-normal) var(--ease-standard);
}

.system-logo-img {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  object-fit: contain;
}

.system-logo:hover .system-logo-icon {
  border-color: hsl(var(--primary));
}

.system-logo-icon::before {
  content: '';
  width: 10px;
  height: 10px;
  background: hsl(var(--primary));
  border-radius: 50%;
}

.system-logo-text {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'HarmonyOS Sans', sans-serif;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: hsl(var(--text));
  position: relative;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .system-logo {
    gap: 8px;
    padding: 4px 8px;
  }

  .system-logo-icon,
  .system-logo-img {
    width: 32px;
    height: 32px;
  }
}

.nav-node {
  position: relative;
  padding: 10px 18px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'HarmonyOS Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.01em;
  color: hsl(var(--text-secondary));
  cursor: pointer;
  transition: color var(--duration-normal) var(--ease-out-soft, var(--ease-standard)), background-color var(--duration-normal) var(--ease-out-soft, var(--ease-standard)), border-color var(--duration-normal) var(--ease-out-soft, var(--ease-standard));
  border-radius: 8px;
  background: transparent;
  border: 1px solid transparent;
}

.nav-node::after {
  content: '';
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: hsl(var(--primary));
  border-radius: 2px;
  transition: width var(--duration-normal) var(--ease-out-soft, var(--ease-standard));
}

.nav-node:hover {
  color: hsl(var(--primary));
  font-weight: 600;
  background: hsl(var(--primary) / 0.1);
}

.nav-node:hover::after {
  width: 70%;
}

.nav-node.active {
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.1);
  font-weight: 600;
}

.nav-node.active::after {
  width: 80%;
  background: hsl(var(--primary));
}

.nav-connector {
  width: 1px;
  height: 24px;
  background: hsl(var(--border) / 0.35);
  margin: 0 4px;
  opacity: 0.4;
}

.tool-panel {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border-radius: 12px;
  background: hsl(var(--surface));
  box-shadow: var(--shadow-sm);
}

@media (min-width: 640px) {
  .tool-panel {
    gap: 8px;
    padding: 6px 8px;
  }
}

@media (max-width: 767px) {
  .tool-panel {
    gap: 4px;
    padding: 3px 4px;
  }
}

@media (max-width: 767px) {
  .header-container {
    padding-left: 16px;
    padding-right: 16px;
  }
}

@media (max-width: 767px) {
  .hud-nav :deep(.flex.items-center.gap-3:last-child) {
    gap: 8px;
  }
}

.Panel-container {
  position: relative;
  min-width: 280px;
  max-width: 400px;
  width: 100%;
  z-index: var(--z-dropdown);
  flex-shrink: 0;
}

@media (max-width: 1280px) {
  .Panel-container {
    max-width: 360px;
    min-width: 260px;
  }
}

@media (max-width: 1024px) {
  .Panel-container {
    max-width: 320px;
    min-width: 240px;
  }
}

@media (max-width: 768px) {
  .Panel-container {
    max-width: 100%;
    min-width: 0;
  }
}

.nav-switch-container {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  justify-items: center;
  align-items: center;
  min-width: 280px;
  flex-shrink: 0;
}

@media (max-width: 1280px) {
  .nav-switch-container {
    min-width: 260px;
  }
}

@media (max-width: 1024px) {
  .nav-switch-container {
    min-width: 240px;
  }
}

@media (max-width: 768px) {
  .nav-switch-container {
    max-width: 100%;
    width: 100%;
    min-width: 0;
  }
}

.nav-menu-container {
  grid-area: 1 / 1;
  flex-shrink: 0;
  justify-content: center;
  width: max-content;
}

.Panel-container {
  grid-area: 1 / 1;
}

.tool-button {
  width: 36px;
  height: 36px;
  min-width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid hsl(var(--border) / 0.6);
  background: hsl(var(--surface) / 0.8);
  border-radius: 8px;
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard);
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .tool-button {
    width: 32px;
    height: 32px;
    min-width: 32px;
  }
}

.tool-button:hover {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--primary) / 0.4);
}

.tool-button.active {
  background: hsl(var(--primary) / 0.08);
  border-color: hsl(var(--primary) / 0.3);
}

.tool-button svg {
  width: 16px;
  height: 16px;
  color: hsl(var(--text));
  position: relative;
  z-index: var(--z-base);
}

.Panel-icon {
  width: 16px;
  height: 16px;
  color: hsl(var(--text));
  transition: color var(--duration-normal) var(--ease-out-soft, var(--ease-standard));
}

.tool-button:hover .Panel-icon {
  color: hsl(var(--primary));
  transform: none;
}

.tool-button.active .Panel-icon {
  color: hsl(var(--primary));
  filter: none;
}

.tool-button span {
  color: hsl(var(--text));
  position: relative;
  z-index: var(--z-base);
}

.tool-button.active svg {
  color: hsl(var(--primary));
  filter: none;
}

.tool-button.active span {
  color: hsl(var(--primary));
}

.language-label {
  font-family: 'JetBrains Mono', 'SF Mono', 'Inter', sans-serif;
  font-size: 13px;
  text-transform: uppercase;
  color: hsl(var(--text));
  transition: color var(--duration-normal) var(--ease-standard);
  white-space: nowrap;
}

@media (min-width: 640px) {
  .language-label {
    font-size: 15px;
  }
}

.tool-button:hover .language-label {
  color: hsl(var(--primary));
}

.mobile-menu-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  min-width: 44px;
  padding: 0;
  border: 1px solid hsl(var(--border) / 0.6);
  background: hsl(var(--surface) / 0.8);
  color: hsl(var(--text));
  cursor: pointer;
  border-radius: 8px;
  transition: background-color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard);
  flex-shrink: 0;
}

.mobile-menu-button:hover {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--primary) / 0.4);
}

.mobile-menu-button .mobile-menu-icon {
  width: 20px;
  height: 20px;
  color: hsl(var(--text));
  transition: color var(--duration-normal) var(--ease-out-soft, var(--ease-standard));
}

.mobile-menu-button:hover .mobile-menu-icon {
  color: hsl(var(--primary));
}

.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: hsl(var(--background) / 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: var(--z-overlay);
  overflow: hidden;
}

.mobile-menu-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  max-width: 85vw;
  height: 100vh;
  max-height: 100vh;
  background: hsl(var(--surface));
  border-left: 1px solid hsl(var(--border));
  box-shadow: var(--shadow-lg);
  z-index: var(--z-modal);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.mobile-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid hsl(var(--border));
  flex-shrink: 0;
  background: hsl(var(--surface));
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.mobile-menu-title {
  font-size: 18px;
  font-weight: 600;
  color: hsl(var(--text));
  letter-spacing: 0.02em;
}

.mobile-menu-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  min-width: 40px;
  padding: 0;
  border: 1px solid hsl(var(--border) / 0.6);
  background: hsl(var(--surface) / 0.8);
  color: hsl(var(--text));
  cursor: pointer;
  border-radius: 8px;
  transition: background-color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard);
}

.mobile-menu-close:hover {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--primary) / 0.4);
}

.mobile-menu-nav {
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 6px;
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.mobile-menu-item {
  display: flex;
  align-items: center;
  min-height: 48px;
  padding: 14px 16px;
  font-size: 16px;
  font-weight: 500;
  color: hsl(var(--text));
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard);
  text-align: left;
  position: relative;
}

.mobile-menu-item:hover {
  background: hsl(var(--background-elevated) / 0.5);
  border-color: hsl(var(--border) / 0.5);
}

.mobile-menu-item:active {
  transform: scale(0.96);
}

.mobile-menu-item-active {
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
  border-color: hsl(var(--primary) / 0.2);
  font-weight: 600;
}

.mobile-menu-item-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  background: hsl(var(--primary));
  border-radius: 0 2px 2px 0;
}

.mobile-menu-item-active:hover {
  background: hsl(var(--primary) / 0.15);
  border-color: hsl(var(--primary) / 0.3);
}

.mobile-Panel-container {
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 16px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  min-height: 0;
}
</style>