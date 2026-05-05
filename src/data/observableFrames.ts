type ObservableFrameConfig = {
  src: string
  designWidth?: number
  scaleUp?: boolean
}

type ObservableFrameKey = 'weeklyStressEvents' | 'weeklyStressEventCategories' | 'combinedForecast' | 'sleepStress'

export const observableFrames: Record<ObservableFrameKey, ObservableFrameConfig> = {
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
    src: 'https://observablehq.com/embed/8499f8e61f4b270d@457?cells=mobileStressForecastSlimSliderWheel',
    designWidth: 425,
    scaleUp: true,
  },
}
