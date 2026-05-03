<script setup lang="ts">
import ObservableFrame from '@/components/ObservableFrame.vue'
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="screen">
    <div class="screen-copy">
      <h1>Why am I stressed?</h1>
      <p class="lead">
        Explore the integrated data by tapping, filtering, and comparing.
      </p>
    </div>
    <section class="forecast-panel">
      <div class="forecast-heading">
        <p class="eyebrow">Collected data</p>
        <h2>Weekly overview</h2>
      </div>
    <section class="hypothesis-panel">
      <p class="mini-label">Current patterns observed</p>
      <h2>Stress rises on deadline-heavy afternoons</h2>
      <p>
        The visualisations suggest the strongest spikes happen after poor sleep
        and before late study sessions.
      </p>
    </section>

      <ObservableFrame
        src="https://observablehq.com/embed/e28495b80f916eb9?cells=mobileTodayStressForecastInteractive"
        bare
      />
      <ObservableFrame
        src="https://observablehq.com/embed/e28495b80f916eb9@2310?cells=viewof+selectedYear%2Cviewof+selectedWeek%2Cstress_events_mobile"
        scale-up
        bare
      />
      <ObservableFrame
        src="https://observablehq.com/embed/e28495b80f916eb9?cells=viewof%20selectedDate%2CrenderStressTimelineLegend"
        :design-width="450"
        scale-up
        bare
      />
      <ObservableFrame
        src="https://observablehq.com/embed/e28495b80f916eb9@2434?cells=viewof+selectedYear%2CrenderYearCalendar"
        scale-up
        bare
      />
    </section>

    <RouterLink class="tips-cta" to="/action">
      See recommended tips
    </RouterLink>
  </section>
</template>
