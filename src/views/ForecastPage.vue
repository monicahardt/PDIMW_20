<script setup lang="ts">
import ObservableFrame from '@/components/ObservableFrame.vue'
import { activeObservableFrames, activeObservableVariant } from '@/data/observableFrameVariants'
</script>

<template>
  <section class="screen">
    <div class="screen-copy">
      <h1>Forecast</h1>
      <p class="lead">
        Compare stress patterns with calendar events for the selected week.
      </p>
    </div>

    <section class="forecast-panel">
      <div class="forecast-heading">
        <p class="eyebrow">Weekly forecast</p>
        <h2>Stress and events</h2>
      </div>

      <ObservableFrame
        :key="`combined-${activeObservableVariant}`"
        :src="activeObservableFrames.combinedForecast.src"
        :design-width="activeObservableFrames.combinedForecast.designWidth"
        :scale-up="activeObservableFrames.combinedForecast.scaleUp"
        bare
      />
    </section>
  </section>
</template>
