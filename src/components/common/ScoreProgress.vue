<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  score: number
  size?: 'sm' | 'md' | 'lg'
}>()

const displayScore = ref(0)

watch(
  () => props.score,
  (newVal) => {
    const start = displayScore.value
    const diff = newVal - start
    const duration = 600
    const startTime = performance.now()
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      displayScore.value = Math.round(start + diff * (1 - Math.pow(1 - progress, 3)))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  },
  { immediate: true },
)

const scoreColor = computed(() => {
  if (props.score >= 85) return '#6B8E6B'
  if (props.score >= 70) return '#8B2635'
  if (props.score >= 55) return '#D4A843'
  return '#A8A39E'
})

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'w-16 h-16'
  if (props.size === 'lg') return 'w-28 h-28'
  return 'w-20 h-20'
})
</script>

<template>
  <div :class="['relative flex items-center justify-center', sizeClass]">
    <svg class="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="44" fill="none" stroke="#E8E0D4" stroke-width="6" />
      <circle
        cx="50" cy="50" r="44" fill="none"
        :stroke="scoreColor" stroke-width="6" stroke-linecap="round"
        :stroke-dasharray="`${(score / 100) * 276.5} 276.5`"
        style="transition: stroke-dasharray 0.6s ease-out"
      />
    </svg>
    <div class="flex flex-col items-center justify-center z-10">
      <span
        :class="['font-display font-bold leading-none', size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-4xl' : 'text-2xl']"
        :style="{ color: scoreColor }"
      >{{ displayScore }}</span>
      <span v-if="size !== 'sm'" class="text-[10px] text-ink-500 mt-0.5">协调性</span>
    </div>
  </div>
</template>
