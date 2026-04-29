<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  src: string
  description?: string
  height?: string
  bare?: boolean
  designWidth?: number
}>(), {
  designWidth: 760,
})

const wrapperRef = ref<HTMLElement | null>(null)
const wrapperWidth = ref(props.designWidth)
const embedHeight = ref<number | null>(null)

let resizeObserver: ResizeObserver | undefined

const fallbackHeight = computed(() => props.height ?? 'clamp(14rem, 42vh, 24rem)')
const frameScale = computed(() => Math.min(1, wrapperWidth.value / props.designWidth))
const frameWidth = computed(() => Math.max(wrapperWidth.value, props.designWidth))
const frameHeight = computed(() => (
  embedHeight.value ? `${Math.ceil(embedHeight.value)}px` : fallbackHeight.value
))
const visualHeight = computed(() => (
  embedHeight.value
    ? `${Math.ceil(embedHeight.value * frameScale.value)}px`
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
}

const readEmbedHeight = (payload: unknown): number | null => {
  if (typeof payload === 'number' && Number.isFinite(payload)) {
    return payload
  }

  if (typeof payload === 'string') {
    const trimmed = payload.trim()
    const parsedNumber = Number(trimmed)

    if (Number.isFinite(parsedNumber)) {
      return parsedNumber
    }

    try {
      return readEmbedHeight(JSON.parse(trimmed))
    } catch {
      return null
    }
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>

    if (typeof record.height === 'number' && Number.isFinite(record.height)) {
      return record.height
    }
  }

  return null
}

const syncEmbedHeight = (event: MessageEvent) => {
  const iframe = wrapperRef.value?.querySelector('iframe')

  if (!iframe || event.source !== iframe.contentWindow) {
    return
  }

  const nextHeight = readEmbedHeight(event.data)

  if (!nextHeight) {
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
