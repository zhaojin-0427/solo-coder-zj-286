<script setup lang="ts">
import { ref, computed } from 'vue'
import type { OutfitLayer, WardrobeItem } from '@/types'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  layer: OutfitLayer
  item: WardrobeItem
  canvasRef: HTMLElement | null
}>()

const emit = defineEmits<{
  update: [patch: Partial<OutfitLayer>]
  remove: [itemId: string]
  bringToFront: []
}>()

const dragging = ref(false)
const startX = ref(0)
const startY = ref(0)
const startLayerX = ref(0)
const startLayerY = ref(0)

const styleAttr = computed(() => ({
  left: `${props.layer.x}px`,
  top: `${props.layer.y}px`,
  width: `${props.layer.width}px`,
  height: `${props.layer.height}px`,
  zIndex: props.layer.zIndex,
}))

function handleMouseDown(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  emit('bringToFront')
  dragging.value = true
  startX.value = e.clientX
  startY.value = e.clientY
  startLayerX.value = props.layer.x
  startLayerY.value = props.layer.y
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
}

function handleMouseMove(e: MouseEvent) {
  if (!dragging.value) return
  const dx = e.clientX - startX.value
  const dy = e.clientY - startY.value
  emit('update', {
    x: Math.max(0, startLayerX.value + dx),
    y: Math.max(0, startLayerY.value + dy),
  })
}

function handleMouseUp() {
  dragging.value = false
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
}
</script>

<template>
  <div
    :class="[
      'absolute group cursor-move rounded-xl overflow-hidden',
      'bg-white shadow-card border border-cream-200/60',
      'transition-shadow duration-200 hover:shadow-glow',
      dragging ? 'shadow-glow scale-[1.02]' : '',
    ]"
    :style="styleAttr"
    @mousedown="handleMouseDown"
  >
    <img
      :src="item.image"
      :alt="item.name"
      class="w-full h-full object-cover select-none pointer-events-none"
      draggable="false"
    />
    <button
      class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/95
             flex items-center justify-center opacity-0 group-hover:opacity-100
             transition-all duration-200 hover:bg-burgundy-500 hover:text-white text-ink-500 shadow-soft"
      @mousedown.stop
      @click.stop="emit('remove', layer.itemId)"
    >
      <X class="w-3 h-3" />
    </button>
  </div>
</template>
