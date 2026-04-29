<script setup lang="ts">
import ObservableFrame from '@/components/ObservableFrame.vue'

const tab3Charts = [
  {
    title: 'Events: Sleep vs Stress',
    description:
      'Interactive scatterplot and category breakdown from your Observable notebook. Brushing the top chart filters the event categories below.',
    src: 'https://observablehq.com/embed/e28495b80f916eb9?cells=stressMax_date1',
  },
  {
    title: 'Stress By Sleep Quality',
    description:
      'This chart compares average stress throughout the day for good-sleep versus bad-sleep nights.',
    src: 'https://observablehq.com/embed/e28495b80f916eb9?cells=renderStressBySleepChatty',
  },
  {
    title: 'Daily Stress Timeline',
    description:
      'Choose a day in the embedded control and inspect the stress timeline with legend-based filtering.',
    src: 'https://observablehq.com/embed/e28495b80f916eb9?cells=viewof%20selectedDate%2CrenderStressTimelineLegend',
  },
  {
    title: 'Monthly Stress Heatmap',
    description:
      'Use the embedded year and month selectors to explore stress patterns across the calendar.',
    src: 'https://observablehq.com/embed/e28495b80f916eb9?cells=viewof%20selectYear%2Cviewof%20selectedMonth%2CrenderMonthlyHeatmap',
  },
]
</script>

<template>
  <section class="screen">
    <div class="screen-copy">
      <p class="eyebrow">Interactive analysis</p>
      <h1>Graphs</h1>
      <p class="lead">
        Explore the data in more detail here. These embeds are the hands-on
        part of the app and are meant for tapping, filtering, and comparison.
      </p>
    </div>

    <section class="viz-grid">
      <ObservableFrame
        v-for="chart in tab3Charts"
        :key="chart.src"
        :title="chart.title"
        :description="chart.description"
        :src="chart.src"
      />
    </section>
  </section>
</template>
