<template>

  <header class="doc-site-header doc-chrome" data-ui-dispatch-role="chrome-host">

    <div class="doc-site-header__brand">
      <button
        type="button"
        class="doc-site-header__brand-btn"
        @click="emit('navigate-home')"
      >
        <span class="doc-site-header__logo" aria-hidden="true">OCP</span>
        <span class="doc-site-header__title">{{ siteTitle }}</span>
      </button>
    </div>



    <nav v-if="navItems.length" class="doc-site-header__nav" aria-label="站点导航">

      <button

        v-for="item in navItems"

        :key="item.sourceId"

        type="button"

        class="doc-site-header__nav-item"

        :class="{ 'doc-site-header__nav-item--active': item.sourceId === activeTopNavId }"

        @click="emit('navigate', item.sourceId)"

      >

        {{ item.label }}

      </button>

    </nav>



    <div class="doc-site-header__actions doc-chrome-actions">

      <slot name="actions" />

      <ThemeToggle size="sm" variant="ghost" />

    </div>

  </header>

</template>



<script setup lang="ts">

import { ThemeToggle } from '@ocpui/vue';



export interface DocSiteNavItem {

  label: string;

  sourceId: string;

}



interface Props {

  siteTitle?: string;

  navItems?: DocSiteNavItem[];

  activeTopNavId?: string;

}



withDefaults(defineProps<Props>(), {

  siteTitle: 'OCP UI',

  navItems: () => [],

  activeTopNavId: '',

});



const emit = defineEmits<{

  navigate: [sourceId: string];

  'navigate-home': [];

}>();

</script>



<style scoped>

.doc-site-header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky, 1100);
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin-bottom: var(--space-4, 16px);
  padding-block: 0.625rem;
  background: hsl(var(--background) / 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid hsl(var(--border));
}



.doc-site-header__brand {
  flex: 0 0 auto;
}

.doc-site-header__brand-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.doc-site-header__logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--radius-sm, 0.25rem);
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground, 0 0% 100%));
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.doc-site-header__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: hsl(var(--text));
}

.doc-site-header__brand-btn:hover .doc-site-header__title {
  color: hsl(var(--primary));
}



.doc-site-header__nav {
  display: none;
  align-items: center;
  gap: 0.25rem;
  flex: 1 1 auto;
  min-width: 0;
  padding-inline: 1rem;
  overflow-x: auto;
  scrollbar-width: none;
}

.doc-site-header__nav::-webkit-scrollbar {
  display: none;
}



.doc-site-header__nav-item {

  padding: 0.375rem 0.75rem;

  border: none;

  border-radius: var(--radius-sm, 0.25rem);

  background: transparent;

  font-size: 0.875rem;

  color: hsl(var(--text-muted));

  cursor: pointer;

  white-space: nowrap;

  transition:

    color var(--duration-fast, 0.12s) ease,

    background-color var(--duration-fast, 0.12s) ease;

}



.doc-site-header__nav-item:hover {

  color: hsl(var(--text));

  background: hsl(var(--surface-hover, var(--background)));

}



.doc-site-header__nav-item--active {

  color: hsl(var(--primary));

  font-weight: 500;

  box-shadow: inset 0 -2px 0 hsl(var(--primary));

  border-radius: 0;

}



.doc-site-header__actions {

  flex: 0 0 auto;

}



@media (min-width: 768px) {

  .doc-site-header__nav {

    display: flex;

  }

}

</style>


