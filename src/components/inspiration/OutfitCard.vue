<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Outfit, WardrobeItem } from '@/types'
import { STYLE_LABELS, OCCASION_LABELS, CATEGORY_LABELS } from '@/types'
import { Trash2, Eye, GitCompare } from 'lucide-vue-next'
import { useComparison } from '@/composables/useComparison'

const props = defineProps<{
  outfit: Outfit
  items: WardrobeItem[]
}>()

const emit = defineEmits<{
  delete: [id: string]
  load: [outfit: Outfit]
}>()

const dateStr = computed(() => {
  const d = new Date(props.outfit.createdAt)
  return `${d.getMonth() + 1}月${d.getDate()}日`
})

const allColors = computed(() => {
  const c: string[] = []
  props.items.forEach(i => c.push(...i.colors))
  return c
})

const {
  canAddMore,
  isOutfitInComparison,
  addOutfitToComparison,
} = useComparison()

const inComparison = computed(() => isOutfitInComparison(props.outfit.id))
const addedNotification = ref(false)

function handleAddToComparison() {
  if (!canAddMore.value) return
  const success = addOutfitToComparison(props.outfit, props.items, false)
  if (success) {
    addedNotification.value = true
    setTimeout(() => {
      addedNotification.value = false
    }, 1500)
  }
}
</script>

<template>
  <div class="card p-4 group hover:shadow-card transition-all duration-300 animate-fade-in-up">
    <div class="relative aspect-[4/3] rounded-lg overflow-hidden bg-cream-50 mb-3">
      <div class="absolute inset-0 p-3 flex flex-wrap gap-1.5 items-center justify-center content-center">
        <img
          v-for="item in items.slice(0, 4)"
          :key="item.id"
          :src="item.image"
          class="w-16 h-16 object-cover rounded-md shadow-soft border border-white"
          :alt="item.name"
        />
      </div>
      <div class="absolute bottom-2 left-2 right-2 flex gap-1">
        <span
          v-for="(c, idx) in allColors.slice(0, 5)"
          :key="idx"
          class="flex-1 h-1.5 rounded-full"
          :style="{ backgroundColor: c }"
        ></span>
      </div>
      <div v-if="inComparison" class="absolute top-2 left-2 z-10">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-burgundy-500 text-white shadow-soft flex items-center gap-1">
          <GitCompare class="w-3 h-3" />
          对比中
        </span>
      </div>
      <Transition name="fade">
        <div v-if="addedNotification" class="absolute top-2 right-2 z-10">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-sage-500 text-white shadow-soft">
            ✓ 已加入
          </span>
        </div>
      </Transition>
      <div class="absolute inset-0 bg-ink-900/0 group-hover:bg-ink-900/40 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
        <button
          class="w-9 h-9 rounded-full bg-white flex items-center justify-center text-ink-900 hover:bg-burgundy-500 hover:text-white transition-all"
          title="应用此搭配"
          @click="emit('load', outfit)"
        >
          <Eye class="w-4 h-4" />
        </button>
        <button
          :class="[
            'w-9 h-9 rounded-full bg-white flex items-center justify-center text-ink-900 transition-all',
            inComparison ? 'opacity-50 cursor-not-allowed' : 'hover:bg-sage-500 hover:text-white',
          ]"
          :title="inComparison ? '已在对比区' : (!canAddMore ? '对比区已满' : '加入对比')"
          :disabled="inComparison || !canAddMore"
          @click="handleAddToComparison"
        >
          <GitCompare class="w-4 h-4" />
        </button>
        <button
          class="w-9 h-9 rounded-full bg-white flex items-center justify-center text-ink-900 hover:bg-burgundy-500 hover:text-white transition-all"
          title="删除"
          @click="emit('delete', outfit.id)"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div class="flex items-start justify-between gap-2 mb-2">
      <div class="min-w-0 flex-1">
        <p class="font-medium text-ink-900 truncate">{{ outfit.name }}</p>
        <p class="text-xs text-ink-500">{{ dateStr }}</p>
      </div>
      <div class="text-right shrink-0">
        <p class="font-display text-lg font-bold text-burgundy-500 leading-none">{{ outfit.harmonyScore }}</p>
        <p class="text-[10px] text-ink-300">分</p>
      </div>
    </div>

    <div class="flex flex-wrap gap-1">
      <span v-if="outfit.style" class="chip !py-0.5 !text-[11px]">{{ STYLE_LABELS[outfit.style] }}</span>
      <span v-if="outfit.occasion" class="chip !py-0.5 !text-[11px] !bg-sage-100 !text-sage-600 !border-sage-300">
        {{ OCCASION_LABELS[outfit.occasion] }}
      </span>
      <span
        v-for="(cat, idx) in [...new Set(items.map(i => i.category))]"
        :key="idx"
        class="chip !py-0.5 !text-[11px] !bg-cream-50"
      >
        {{ CATEGORY_LABELS[cat] }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
