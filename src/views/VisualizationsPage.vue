<script setup lang="ts">
import ObservableFrame from '@/components/ObservableFrame.vue'
import { visualizations } from '@/data/visualizations'
</script>

<template>
  <section class="section-header">
    <p class="eyebrow">Embedded notebooks</p>
    <h2>Visualizations</h2>
    <p class="lead">
      Add your Observable notebook embed URLs in
      <code>src/data/visualizations.ts</code>.
    </p>
  </section>

  <section class="viz-grid">
    <ObservableFrame
      v-for="visualization in visualizations"
      :key="visualization.src"
      :title="visualization.title"
      :description="visualization.description"
      :src="visualization.src"
    />
  </section>
</template>
