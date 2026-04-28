<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

const tabs = [
  { to: '/tab1', label: 'Forecast' },
  { to: '/tab2', label: 'Tips' },
  { to: '/tab3', label: 'Graphs' },
  { to: '/tab4', label: 'Profile' },
]
</script>

<template>
  <div class="mobile-app">
    <main class="app-content">
      <RouterView />
    </main>

    <nav class="bottom-nav" aria-label="Primary navigation">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="tab-link"
      >
        {{ tab.label }}
      </RouterLink>
    </nav>
  </div>
</template>
