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
const wrapperHeight = ref(0)

let resizeObserver: ResizeObserver | undefined

const visualHeight = computed(() => props.height ?? 'clamp(14rem, 42vh, 24rem)')
const frameScale = computed(() => Math.min(1, wrapperWidth.value / props.designWidth))
const frameWidth = computed(() => Math.max(wrapperWidth.value, props.designWidth))
const frameHeight = computed(() => {
  if (!wrapperHeight.value) {
    return visualHeight.value
  }

  return `${Math.ceil(wrapperHeight.value / frameScale.value)}px`
})

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

onMounted(() => {
  updateFrameSize()

  resizeObserver = new ResizeObserver(updateFrameSize)

  if (wrapperRef.value) {
    resizeObserver.observe(wrapperRef.value)
  }
})

onBeforeUnmount(() => {
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
