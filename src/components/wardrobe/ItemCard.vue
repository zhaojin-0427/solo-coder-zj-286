<script setup lang="ts">
import type { WardrobeItem, Category } from '@/types'
import { CATEGORY_LABELS } from '@/types'
import { Trash2 } from 'lucide-vue-next'

const props = defineProps<{
  item: WardrobeItem
  draggable?: boolean
  inCanvas?: boolean
}>()

const emit = defineEmits<{
  remove: [id: string]
  dragStart: [item: WardrobeItem]
}>()

function handleDragStart(e: DragEvent) {
  if (!props.draggable) return
  e.dataTransfer?.setData('itemId', props.item.id)
  e.dataTransfer!.effectAllowed = 'copy'
  emit('dragStart', props.item)
}
</script>

<template>
  <div
    :class="[
      'card p-3 group relative cursor-grab active:cursor-grabbing transition-all duration-300',
      'hover:-translate-y-1 hover:shadow-card',
      draggable ? 'opacity-100' : '',
      inCanvas ? 'w-auto' : '',
    ]"
    :draggable="draggable"
    @dragstart="handleDragStart"
  >
    <div class="relative aspect-square rounded-lg overflow-hidden bg-cream-50 mb-2">
      <img
        :src="item.image"
        :alt="item.name"
        class="w-full h-full object-cover"
        draggable="false"
      />
      <button
        v-if="!inCanvas"
        class="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur
               flex items-center justify-center opacity-0 group-hover:opacity-100
               transition-all duration-200 hover:bg-burgundy-500 hover:text-white text-ink-500"
        @click.stop="emit('remove', item.id)"
      >
        <Trash2 class="w-3.5 h-3.5" />
      </button>
    </div>
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium text-ink-900 truncate">{{ item.name }}</p>
        <p class="text-xs text-ink-500">{{ CATEGORY_LABELS[item.category as Category] }}</p>
      </div>
    </div>
    <div class="flex gap-1 mt-2">
      <span
        v-for="(color, idx) in item.colors"
        :key="idx"
        class="color-dot"
        :style="{ backgroundColor: color }"
        :title="color"
      ></span>
    </div>
  </div>
</template>
