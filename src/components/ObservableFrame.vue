<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{
  title?: string
  src: string
  description?: string
  height?: string
  bare?: boolean
}>()

const iframeRef = ref<HTMLIFrameElement | null>(null)
const iframeHeight = ref(props.height ?? 'clamp(20rem, 56vh, 34rem)')

const iframeStyle = computed(() => ({
  height: iframeHeight.value,
  minHeight: iframeHeight.value,
}))

function readEmbedHeight(payload: unknown): number | null {
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

function syncIframeHeight(event: MessageEvent) {
  const iframe = iframeRef.value

  if (!iframe || event.source !== iframe.contentWindow) {
    return
  }

  const nextHeight = readEmbedHeight(event.data)

  if (!nextHeight) {
    return
  }

  iframeHeight.value = `${Math.ceil(nextHeight)}px`
}

onMounted(() => {
  window.addEventListener('message', syncIframeHeight)
})

onBeforeUnmount(() => {
  window.removeEventListener('message', syncIframeHeight)
})
</script>

<template>
  <section :class="bare ? 'viz-stack' : 'viz-card'">
    <div v-if="title || description" class="viz-copy">
      <h3>{{ title }}</h3>
      <p v-if="description">{{ description }}</p>
    </div>

    <div class="iframe-wrap">
      <iframe
        ref="iframeRef"
        :src="src"
        :title="title"
        :style="iframeStyle"
        loading="lazy"
        class="viz-frame"
        scrolling="no"
        allowfullscreen
      />
    </div>
  </section>
</template>
