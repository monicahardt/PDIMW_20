<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  src: string
  description?: string
  height?: string
  bare?: boolean
  designWidth?: number
  scaleUp?: boolean
}>(), {
  designWidth: 930,
  scaleUp: false,
})

const wrapperRef = ref<HTMLElement | null>(null)
const iframeRef = ref<HTMLIFrameElement | null>(null)
const wrapperWidth = ref(props.designWidth)
const wrapperHeight = ref(0)
const embedHeight = ref<number | null>(null)

let resizeObserver: ResizeObserver | undefined

const fallbackHeight = computed(() => props.height ?? 'clamp(26rem, 58vh, 36rem)')
const contentHeight = computed(() => (
  embedHeight.value ? `${Math.ceil(embedHeight.value + 16)}px` : fallbackHeight.value
))
const frameScale = computed(() => {
  const scale = wrapperWidth.value / props.designWidth

  return props.scaleUp ? scale : Math.min(1, scale)
})
const frameWidth = computed(() => (props.scaleUp ? props.designWidth : Math.max(wrapperWidth.value, props.designWidth)))
const frameHeight = computed(() => (
  embedHeight.value
    ? contentHeight.value
    : wrapperHeight.value
      ? `${Math.ceil(wrapperHeight.value / frameScale.value)}px`
      : fallbackHeight.value
))
const visualHeight = computed(() => (
  embedHeight.value
    ? `${Math.ceil((embedHeight.value + 16) * frameScale.value)}px`
    : fallbackHeight.value
))

const wrapperStyle = computed(() => ({
  height: visualHeight.value,
}))

const frameStyle = computed(() => ({
  width: `${frameWidth.value}px`,
  height: frameHeight.value,
  minHeight: frameHeight.value,
  transform: `scale(${frameScale.value})`,
}))

const updateFrameSize = () => {
  if (!wrapperRef.value) {
    return
  }

  wrapperWidth.value = wrapperRef.value.clientWidth || props.designWidth
  wrapperHeight.value = wrapperRef.value.clientHeight
}

const readEmbedHeight = (payload: unknown): number | null => {
  if (typeof payload === 'number' && Number.isFinite(payload)) {
    return payload
  }

  if (typeof payload === 'string') {
    const trimmed = payload.trim()
    const parsedNumber = Number(trimmed)
    const pixelValue = /^(\d+(?:\.\d+)?)px$/.exec(trimmed)

    if (Number.isFinite(parsedNumber)) {
      return parsedNumber
    }

    if (pixelValue) {
      return Number(pixelValue[1])
    }

    try {
      return readEmbedHeight(JSON.parse(trimmed))
    } catch {
      return null
    }
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    const candidateKeys = ['height', 'iframeHeight', 'scrollHeight', 'clientHeight']

    for (const key of candidateKeys) {
      const value = readEmbedHeight(record[key])

      if (value) {
        return value
      }
    }

    return readEmbedHeight(record.payload ?? record.data ?? record.value)
  }

  return null
}

const syncEmbedHeight = (event: MessageEvent) => {
  const iframe = iframeRef.value

  if (!iframe || event.source !== iframe.contentWindow) {
    return
  }

  const nextHeight = readEmbedHeight(event.data)

  if (!nextHeight || nextHeight < 80) {
    return
  }

  embedHeight.value = nextHeight
}

onMounted(() => {
  updateFrameSize()
  window.addEventListener('message', syncEmbedHeight)

  resizeObserver = new ResizeObserver(updateFrameSize)

  if (wrapperRef.value) {
    resizeObserver.observe(wrapperRef.value)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('message', syncEmbedHeight)
  resizeObserver?.disconnect()
})
</script>

<template>
  <section :class="bare ? 'viz-stack' : 'viz-card'">
    <div v-if="title || description" class="viz-copy">
      <h3>{{ title }}</h3>
      <p v-if="description">{{ description }}</p>
    </div>

    <div ref="wrapperRef" class="iframe-wrap" :style="wrapperStyle">
      <iframe
        ref="iframeRef"
        :src="src"
        :title="title"
        :style="frameStyle"
        loading="lazy"
        class="viz-frame"
        scrolling="no"
        allowfullscreen
      />
    </div>
  </section>
</template>
