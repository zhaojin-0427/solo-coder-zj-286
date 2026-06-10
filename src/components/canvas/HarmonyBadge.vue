<script setup lang="ts">
import { computed } from 'vue'
import ScoreProgress from '@/components/common/ScoreProgress.vue'
import { STYLE_LABELS, STYLE_DESCRIPTIONS } from '@/types'
import type { StyleType } from '@/types'

defineProps<{
  score: number
  style: StyleType | ''
  description: string
}>()

const styleClass = computed(() => 'text-burgundy-500')
</script>

<template>
  <div class="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-card p-4 w-64 border border-cream-200/60">
    <div class="flex items-start gap-3">
      <ScoreProgress :score="score" size="md" />
      <div class="flex-1 min-w-0">
        <p class="text-xs text-ink-500 mb-0.5">色彩协调性</p>
        <p v-if="style" :class="['text-sm font-semibold', styleClass]">
          {{ STYLE_LABELS[style] }}
        </p>
        <p class="text-xs text-ink-500 mt-1 leading-relaxed">
          {{ description || '拖拽单品开始搭配分析' }}
        </p>
      </div>
    </div>
  </div>
</template>
