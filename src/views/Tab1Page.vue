<script setup lang="ts">
import ObservableFrame from '@/components/ObservableFrame.vue'
</script>

<template>
  <section class="screen">
    <section class="forecast-panel">
      <div class="forecast-heading">
        <h2>Today's forecast</h2>
      </div>
      <ObservableFrame
        src="https://observablehq.com/embed/e28495b80f916eb9?cells=mobileTodayStressForecastInteractive"
        bare
      />
      <ObservableFrame
        src="https://observablehq.com/embed/e28495b80f916eb9?cells=viewof+selectedYear%2Cviewof+selectedWeek%2Cstress_events_mobile"
        :design-width="375"
        scale-up
        bare
      />
    </section>
  </section>
</template>
