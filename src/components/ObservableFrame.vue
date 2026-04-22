<script setup lang="ts">
defineProps<{
  title: string
  src: string
  description?: string
}>()
</script>

<template>
  <section class="viz-card">
    <div class="viz-copy">
      <h3>{{ title }}</h3>
      <p v-if="description">{{ description }}</p>
    </div>

    <div class="iframe-wrap">
      <iframe
        :src="src"
        :title="title"
        loading="lazy"
        class="viz-frame"
        allowfullscreen
      />
    </div>
  </section>
</template>
