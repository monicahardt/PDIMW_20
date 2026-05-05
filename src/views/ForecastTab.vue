<script setup lang="ts">
import ObservableFrame from '@/components/ObservableFrame.vue'
import { observableFrames } from '@/data/observableFrames'
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
        :src="observableFrames.combinedForecast.src"
        :design-width="observableFrames.combinedForecast.designWidth"
        :scale-up="observableFrames.combinedForecast.scaleUp"
        bare
      />
    </section>
  </section>
</template>
