<script setup lang="ts">
import type { Outfit, WardrobeItem, MissingCategory } from '@/types'
import { STYLE_LABELS, OCCASION_LABELS, CATEGORY_LABELS } from '@/types'
import { X, Edit3, AlertCircle } from 'lucide-vue-next'
import ScoreProgress from '@/components/common/ScoreProgress.vue'

const props = defineProps<{
  outfit: Outfit
  items: WardrobeItem[]
  dominantColors: string[]
  missingCategories: MissingCategory[]
  isTemporary?: boolean
}>()

const emit = defineEmits<{
  remove: []
  loadToCanvas: [outfit: Outfit]
}>()
</script>

<template>
  <div class="card p-4 flex flex-col h-full animate-fade-in-up relative group">
    <button
      class="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 border border-cream-200 flex items-center justify-center text-ink-400 hover:text-burgundy-500 hover:border-burgundy-300 transition-all z-10 opacity-70 group-hover:opacity-100"
      @click="emit('remove')"
      title="移出对比"
    >
      <X class="w-3.5 h-3.5" />
    </button>

    <div class="flex items-center gap-2 mb-3 pr-8">
      <p class="font-medium text-ink-900 truncate flex-1">{{ outfit.name }}</p>
      <span v-if="isTemporary" class="chip !py-0.5 !text-[10px] !bg-burgundy-50 !text-burgundy-500 !border-burgundy-200">
        临时
      </span>
    </div>

    <div class="relative aspect-[4/3] rounded-lg overflow-hidden bg-cream-50 mb-3 border border-cream-100">
      <div class="absolute inset-0 p-2 flex flex-wrap gap-1 items-center justify-center content-center">
        <img
          v-for="item in items.slice(0, 4)"
          :key="item.id"
          :src="item.image"
          class="w-14 h-14 object-cover rounded-md shadow-soft border border-white"
          :alt="item.name"
        />
        <div
          v-if="items.length === 0"
          class="text-ink-300 text-sm"
        >暂无单品</div>
      </div>
      <div class="absolute bottom-1.5 left-1.5 right-1.5 flex gap-0.5">
        <span
          v-for="(c, idx) in dominantColors.slice(0, 6)"
          :key="idx"
          class="flex-1 h-1.5 rounded-full"
          :style="{ backgroundColor: c }"
        ></span>
      </div>
    </div>

    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <ScoreProgress :score="outfit.harmonyScore" size="sm" />
        <span class="font-display text-lg font-bold text-burgundy-500">{{ outfit.harmonyScore }}</span>
        <span class="text-[10px] text-ink-300">分</span>
      </div>
    </div>

    <div class="space-y-3 flex-1 min-h-0 overflow-y-auto scrollbar-thin pr-1">
      <div>
        <p class="text-[10px] font-medium text-ink-400 mb-1.5 uppercase tracking-wider">风格识别</p>
        <div class="flex flex-wrap gap-1">
          <span v-if="outfit.style" class="chip !py-0.5 !text-[11px] !bg-burgundy-50 !text-burgundy-600 !border-burgundy-200">
            {{ STYLE_LABELS[outfit.style] }}
          </span>
          <span v-else class="text-xs text-ink-300">未识别</span>
        </div>
      </div>

      <div>
        <p class="text-[10px] font-medium text-ink-400 mb-1.5 uppercase tracking-wider">主色调</p>
        <div class="flex gap-1">
          <div
            v-for="(c, idx) in dominantColors"
            :key="idx"
            class="w-6 h-6 rounded-md shadow-soft border border-cream-200"
            :style="{ backgroundColor: c }"
            :title="c.toUpperCase()"
          ></div>
          <span v-if="dominantColors.length === 0" class="text-xs text-ink-300">暂无</span>
        </div>
      </div>

      <div>
        <p class="text-[10px] font-medium text-ink-400 mb-1.5 uppercase tracking-wider">适用场合</p>
        <div class="flex flex-wrap gap-1">
          <span v-if="outfit.occasion" class="chip !py-0.5 !text-[11px] !bg-sage-100 !text-sage-600 !border-sage-300">
            {{ OCCASION_LABELS[outfit.occasion] }}
          </span>
          <span v-else class="text-xs text-ink-300">未指定</span>
        </div>
      </div>

      <div>
        <p class="text-[10px] font-medium text-ink-400 mb-1.5 uppercase tracking-wider">缺失单品</p>
        <div v-if="missingCategories.length > 0" class="space-y-1">
          <div
            v-for="m in missingCategories"
            :key="m.category"
            class="flex items-start gap-1.5 px-2 py-1.5 rounded-md bg-amber-50 border border-amber-200/60"
          >
            <AlertCircle class="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
            <span class="text-[11px] text-amber-700 leading-snug">{{ CATEGORY_LABELS[m.category] }}</span>
          </div>
        </div>
        <div v-else class="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-sage-50 border border-sage-200/60">
          <span class="w-3 h-3 rounded-full bg-sage-500 shrink-0 flex items-center justify-center">
            <span class="text-[8px] text-white font-bold">✓</span>
          </span>
          <span class="text-[11px] text-sage-700">品类完整</span>
        </div>
      </div>
    </div>

    <div class="pt-3 mt-3 border-t border-cream-100">
      <button
        class="w-full btn-secondary !py-2 !text-sm flex items-center justify-center gap-1.5"
        @click="emit('loadToCanvas', outfit)"
      >
        <Edit3 class="w-3.5 h-3.5" />
        载入画布编辑
      </button>
    </div>
  </div>
</template>
