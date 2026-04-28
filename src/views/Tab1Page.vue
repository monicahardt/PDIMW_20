<script setup lang="ts">
import ObservableFrame from '@/components/ObservableFrame.vue'
</script>

<template>
  <section class="screen">
    <div class="screen-copy">
      <p class="eyebrow">Quick guide</p>
      <h1>Forecast</h1>
      <p class="lead">
        A quick front page with one compact stress view and short, actionable
        tips based on the bigger patterns in your data.
      </p>
    </div>

    <section class="card">
      <h2>Stress snapshot</h2>
      <ObservableFrame
        title="Weekly stress overview"
        description="A compact weekly heatmap for a fast read on where stress tends to cluster."
        src="https://observablehq.com/embed/e28495b80f916eb9?cells=renderWeeklyHeatmap"
        height="14rem"
      />
    </section>

    <section class="card">
      <h2>Today’s focus</h2>
      <p>
        Look for repeated high-stress pockets in the graph and use the Graphs
        tab when you want to drill into the exact days behind them.
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
