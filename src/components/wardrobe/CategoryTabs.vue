<script setup lang="ts">
import type { Category } from '@/types'
import { CATEGORY_LABELS } from '@/types'

defineProps<{
  modelValue: Category | 'all'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Category | 'all']
}>()

const categories: Array<{ key: Category | 'all'; label: string; icon: string }> = [
  { key: 'all', label: '全部', icon: '👚' },
  { key: 'top', label: '上衣', icon: '👕' },
  { key: 'bottom', label: '下装', icon: '👖' },
  { key: 'shoes', label: '鞋子', icon: '👟' },
  { key: 'accessory', label: '配饰', icon: '💍' },
]
</script>

<template>
  <div class="flex gap-2 flex-wrap">
    <button
      v-for="cat in categories"
      :key="cat.key"
      :class="[
        'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all',
        modelValue === cat.key
          ? 'bg-burgundy-500 text-white shadow-soft'
          : 'bg-white text-ink-700 border border-cream-200 hover:border-burgundy-300 hover:text-burgundy-500',
      ]"
      @click="emit('update:modelValue', cat.key)"
    >
      <span>{{ cat.icon }}</span>
      {{ cat.label }}
    </button>
  </div>
</template>
