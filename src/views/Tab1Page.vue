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
    </section>

    <section class="card">
      <h2>Today's focus</h2>
      <p>
        Use the forecast above as a quick read on today, then head into the
        Graphs tab when you want to inspect the pattern behind the prediction.
      </p>
      <ul class="plain-list">
        <li>Protect mornings after poor sleep, since stress appears to climb early on those days.</li>
        <li>Use lighter tasks on your most demanding weekday instead of stacking intense work.</li>
        <li>Check whether heavy activity days and high-stress days are landing on top of each other.</li>
      </ul>
    </section>

    <section class="card">
      <h2>Where to look next</h2>
      <p>
        Open Graphs to explore daily timelines, event correlations, and the
        monthly calendar. Open Tips for slower, long-term habit changes.
      </p>
    </section>
  </section>
</template>
