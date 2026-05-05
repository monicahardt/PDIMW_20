<script setup lang="ts">
import ObservableFrame from '@/components/ObservableFrame.vue'
import { observableFrames } from '@/data/observableFrames'
</script>

<template>
  <section class="screen">
    <div class="screen-copy">
      <h1>Forecast</h1>
    </div>

    <section class="forecast-panel">
      <ObservableFrame
        :src="observableFrames.combinedForecast.src"
        :design-width="observableFrames.combinedForecast.designWidth"
        :scale-up="observableFrames.combinedForecast.scaleUp"
        bare
      />
    </section>
  </section>
</template>
