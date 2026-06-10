<script setup lang="ts">
import { computed } from 'vue'
import type { Outfit, CompareSortType } from '@/types'
import { COMPARE_SORT_LABELS, COMPARE_SORT_DESCRIPTIONS } from '@/types'
import { GitCompare, Trash2, Plus, Info } from 'lucide-vue-next'
import { useComparison } from '@/composables/useComparison'
import { useOutfit } from '@/composables/useOutfit'
import ComparisonCard from './ComparisonCard.vue'

const emit = defineEmits<{
  loadOutfit: [outfit: Outfit]
}>()

const {
  sortType,
  count,
  MAX_COMPARISONS,
  removeFromComparison,
  clearComparison,
  sortEntries,
  setSortType,
  getMissingCategories,
  getDominantColors,
} = useComparison()

const { loadOutfitToCanvas } = useOutfit()

const sortedEntries = computed(() => sortEntries())
const emptySlots = computed(() => Math.max(0, MAX_COMPARISONS - sortedEntries.value.length))

const sortOptions: CompareSortType[] = ['commute', 'harmony', 'minimal']

function handleLoadToCanvas(outfit: Outfit) {
  loadOutfitToCanvas(outfit)
  emit('loadOutfit', outfit)
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="flex items-start justify-between mb-4 flex-wrap gap-3">
      <div>
        <div class="flex items-center gap-2">
          <GitCompare class="w-5 h-5 text-burgundy-500" />
          <h2 class="font-display text-2xl font-semibold text-ink-900">穿搭对比决策台</h2>
          <span class="chip !bg-burgundy-50 !text-burgundy-600 !border-burgundy-200">
            {{ count }} / {{ MAX_COMPARISONS }}
          </span>
        </div>
        <p class="text-sm text-ink-500 mt-0.5">
          最多对比 {{ MAX_COMPARISONS }} 套方案，从画布或灵感收藏夹添加搭配
        </p>
      </div>
      <button
        v-if="count > 0"
        class="btn-secondary !py-2 flex items-center gap-1.5 text-sm"
        @click="clearComparison"
      >
        <Trash2 class="w-3.5 h-3.5" />
        清空对比
      </button>
    </div>

    <div v-if="count > 0" class="mb-4">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-xs font-medium text-ink-500 uppercase tracking-wider">排序方式：</span>
        <div class="flex gap-1 bg-white rounded-lg p-1 border border-cream-200 shadow-soft">
          <button
            v-for="opt in sortOptions"
            :key="opt"
            :class="[
              'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5',
              sortType === opt
                ? 'bg-burgundy-500 text-white shadow-soft'
                : 'text-ink-600 hover:bg-cream-50 hover:text-burgundy-500',
            ]"
            :title="COMPARE_SORT_DESCRIPTIONS[opt]"
            @click="setSortType(opt)"
          >
            {{ COMPARE_SORT_LABELS[opt] }}
          </button>
        </div>
        <Info
          class="w-3.5 h-3.5 text-ink-300"
          :title="COMPARE_SORT_DESCRIPTIONS[sortType]"
        />
      </div>
    </div>

    <div class="flex-1 min-h-0 overflow-y-auto scrollbar-thin pr-1 -mr-1">
      <div v-if="count === 0" class="h-full flex flex-col items-center justify-center text-center py-12">
        <div class="w-20 h-20 rounded-2xl bg-cream-100 flex items-center justify-center mb-4">
          <GitCompare class="w-9 h-9 text-ink-300" />
        </div>
        <p class="text-ink-700 font-medium mb-1">暂无对比方案</p>
        <p class="text-sm text-ink-500 mb-4">从画布或灵感收藏夹将搭配加入对比</p>
        <div class="flex items-center gap-2 text-xs text-ink-400">
          <span class="w-6 h-6 rounded-full bg-cream-50 border border-cream-200 flex items-center justify-center">
            <Plus class="w-3 h-3" />
          </span>
          <span>点击「加入对比」按钮开始对比最多 {{ MAX_COMPARISONS }} 套搭配</span>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-4 auto-rows-fr">
        <ComparisonCard
          v-for="entry in sortedEntries"
          :key="entry.comparisonId"
          :outfit="entry.outfit"
          :items="entry.itemSnapshots"
          :dominant-colors="getDominantColors(entry)"
          :missing-categories="getMissingCategories(entry)"
          :is-temporary="entry.isTemporary"
          @remove="removeFromComparison(entry.comparisonId)"
          @load-to-canvas="handleLoadToCanvas"
        />

        <div
          v-for="n in emptySlots"
          :key="`empty-${n}`"
          class="card border-2 border-dashed border-cream-200 bg-cream-50/50 flex flex-col items-center justify-center p-6 text-center min-h-[380px]"
        >
          <div class="w-14 h-14 rounded-2xl bg-white border border-cream-200 flex items-center justify-center mb-3 shadow-soft">
            <Plus class="w-6 h-6 text-ink-300" />
          </div>
          <p class="text-sm font-medium text-ink-400 mb-1">空对比槽位</p>
          <p class="text-xs text-ink-300">从画布或灵感夹添加搭配</p>
        </div>
      </div>
    </div>
  </div>
</template>
