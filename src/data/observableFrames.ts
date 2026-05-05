type ObservableFrameConfig = {
  src: string
  designWidth?: number
  scaleUp?: boolean
}

type ObservableFrameKey = 'todayForecast' | 'weeklyStressEvents' | 'weeklyStressEventCategories' | 'combinedForecast'

export const observableFrames: Record<ObservableFrameKey, ObservableFrameConfig> = {
  todayForecast: {
    src: 'https://observablehq.com/embed/e28495b80f916eb9@2518?cells=sleepStressBarsLineDrilldownPhoneSizeNewCool',
    designWidth: 200,
    scaleUp: true,
  },
  weeklyStressEvents: {
    src: 'https://observablehq.com/embed/8499f8e61f4b270d@372?cells=calendarStressMobileL',
    scaleUp: true,
  },
  weeklyStressEventCategories: {
    src: 'https://observablehq.com/embed/8499f8e61f4b270d@435?cells=categoryStressSunburstC',
    scaleUp: true,
  },
  combinedForecast: {
    src: 'https://observablehq.com/embed/8499f8e61f4b270d@435?cells=mobileStressForecastSlimSliderWheel',
    designWidth: 425,
    scaleUp: true,
  },
}
