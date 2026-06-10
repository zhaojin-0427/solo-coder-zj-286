<script setup lang="ts">
import { STYLE_LABELS, STYLE_DESCRIPTIONS } from '@/types'
import type { StyleType } from '@/types'
import ScoreProgress from '@/components/common/ScoreProgress.vue'
import { Palette, Info } from 'lucide-vue-next'

defineProps<{
  colors: string[]
  score: number
  styleType: StyleType | ''
  description: string
}>()
</script>

<template>
  <div class="card p-5 h-full flex flex-col">
    <div class="flex items-center gap-2 mb-4">
      <Palette class="w-5 h-5 text-burgundy-500" />
      <h3 class="font-display text-lg font-semibold text-ink-900">色彩分析</h3>
    </div>

    <div class="flex justify-center mb-5">
      <ScoreProgress :score="score" size="lg" />
    </div>

    <div v-if="styleType" class="mb-4">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-burgundy-50 text-burgundy-500 text-sm font-medium border border-burgundy-50">
        <span class="w-2 h-2 rounded-full bg-burgundy-500"></span>
        {{ STYLE_LABELS[styleType] }}
      </div>
    </div>

    <div class="mb-4">
      <p class="text-xs font-medium text-ink-500 mb-2 uppercase tracking-wider">主色调</p>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(color, idx) in colors"
          :key="idx"
          class="group relative"
        >
          <div
            class="w-10 h-10 rounded-lg shadow-soft border border-cream-200 cursor-pointer transition-transform hover:scale-110"
            :style="{ backgroundColor: color }"
          ></div>
          <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-ink-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-mono">
            {{ color.toUpperCase() }}
          </div>
        </div>
      </div>
    </div>

    <div class="mt-auto bg-cream-50 rounded-lg p-3 border border-cream-200/60">
      <div class="flex items-start gap-2">
        <Info class="w-4 h-4 text-sage-500 shrink-0 mt-0.5" />
        <div>
          <p class="text-xs font-medium text-sage-600 mb-1">搭配建议</p>
          <p class="text-xs text-ink-500 leading-relaxed">
            {{ description || '添加单品到画布查看搭配分析' }}
          </p>
          <p v-if="styleType" class="text-xs text-ink-500 leading-relaxed mt-1">
            {{ STYLE_DESCRIPTIONS[styleType] }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
