import { computed, ref } from 'vue'

export type ObservableVariant = 'A' | 'B'

type ObservableFrameKey = 'todayForecast' | 'weeklyStressEvents' | 'combinedForecast'

type ObservableFrameConfig = {
  src: string
  designWidth?: number
  scaleUp?: boolean
}

const storageKey = 'observable-frame-variant'

export const observableFrameVariants: Record<ObservableVariant, Record<ObservableFrameKey, ObservableFrameConfig>> = {
  A: {
    todayForecast: {
      src: 'https://observablehq.com/embed/e28495b80f916eb9?cells=mobileTodayStressForecastInteractive',
    },
    weeklyStressEvents: {
      src: 'https://observablehq.com/embed/e28495b80f916eb9?cells=viewof+selectedYear%2Cviewof+selectedWeek%2Cstress_events_mobile',
      designWidth: 375,
      scaleUp: true,
    },
    combinedForecast: {
      src: 'https://observablehq.com/embed/e28495b80f916eb9?cells=mobileCombinedStressAdvice',
      designWidth: 375,
      scaleUp: true,
    },
  },
  B: {
    todayForecast: {
      src: 'https://observablehq.com/embed/e28495b80f916eb9?cells=mobileWeeklyStressForecastHeatmap',
    },
    weeklyStressEvents: {
      src: 'https://observablehq.com/embed/e28495b80f916eb9?cells=viewof+selectedYear%2CrenderYearCalendar',
      designWidth: 375,
      scaleUp: true,
    },
    combinedForecast: {
      src: 'https://observablehq.com/embed/e28495b80f916eb9?cells=mobileCombinedStressAdvice',
      designWidth: 375,
      scaleUp: true,
    },
  },
}

const readInitialVariant = (): ObservableVariant => {
  if (typeof window === 'undefined') {
    return 'A'
  }

  return window.localStorage.getItem(storageKey) === 'B' ? 'B' : 'A'
}

export const activeObservableVariant = ref<ObservableVariant>(readInitialVariant())

export const activeObservableFrames = computed(() => (
  observableFrameVariants[activeObservableVariant.value]
))

export const toggleObservableVariant = () => {
  activeObservableVariant.value = activeObservableVariant.value === 'A' ? 'B' : 'A'

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, activeObservableVariant.value)
  }
}
