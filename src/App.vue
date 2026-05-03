<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

const tabs = [
  { to: '/profile', label: 'Profile' },
  { to: '/overview', label: 'Data' },
  { to: '/forecast', label: 'Forecast' },
  { to: '/action', label: 'Action' },
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
