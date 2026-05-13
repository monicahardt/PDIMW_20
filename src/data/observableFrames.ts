import { computed, ref } from 'vue'

type ObservableFrameConfig = {
  src: string
  designWidth?: number
  heightPadding?: number
  scaleUp?: boolean
}

type ObservableFrameKey = 'weeklyStressEvents' | 'weeklyStressEventCategories' | 'combinedForecast' | 'sleepStress'
type ObservableVersion = 'A' | 'B'

export const observableFrameSets: Record<ObservableVersion, Record<ObservableFrameKey, ObservableFrameConfig>> = {
  A: {
    weeklyStressEvents: {
      src: 'https://observablehq.com/embed/8499f8e61f4b270d@372?cells=calendarStressMobileL',
      scaleUp: true,
    },
    weeklyStressEventCategories: {
      src: 'https://observablehq.com/embed/8499f8e61f4b270d@435?cells=categoryStressSunburstC',
      scaleUp: true,
    },
    sleepStress: {
      src: 'https://observablehq.com/embed/e28495b80f916eb9@2580?cells=sleepStressBarsLineDrilldownPhoneSizeNewCoolAAA',
      scaleUp: true,
    },
    
    combinedForecast: {
      src: 'https://observablehq.com/embed/8499f8e61f4b270d@478?cells=mobileStressForecastSlimSliderWheel',
      designWidth: 425,
      heightPadding: 180,
      scaleUp: true,
    },
  },
  B: {
    weeklyStressEvents: {
      src: 'https://observablehq.com/embed/8499f8e61f4b270d?cells=calendarStressExperimentEventsOnly',
      scaleUp: true,
    },
    weeklyStressEventCategories: {
      src: 'https://observablehq.com/embed/8499f8e61f4b270d?cells=calendarStressExperimentStressOnly',
      scaleUp: true,
    },
    sleepStress: {
      src: 'https://observablehq.com/embed/e28495b80f916eb9?cells=sleepOnlyExperiment',
      scaleUp: true,
    },
    combinedForecast: {
      src: '',
      designWidth: 425,
      heightPadding: 48,
      scaleUp: true,
    },
  },
}

export const activeObservableVersion = ref<ObservableVersion>('A')

export const observableFrames = computed(() => observableFrameSets[activeObservableVersion.value])

export const toggleBVersion = () => {
  activeObservableVersion.value = activeObservableVersion.value === 'B' ? 'A' : 'B'
}
