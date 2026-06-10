<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  active?: boolean
  color?: string
}>()

const emit = defineEmits<{
  click: []
}>()

const styleAttr = computed(() => {
  if (props.active || !props.color) return {}
  return { backgroundColor: props.color, color: '#fff', borderColor: props.color }
})
</script>

<template>
  <button
    :class="['chip', active ? 'chip-active' : '', 'cursor-pointer transition-all duration-200 hover:scale-105']"
    :style="styleAttr"
    @click="emit('click')"
  >
    <span v-if="color && !active" class="color-dot !w-3 !h-3" :style="{ backgroundColor: color }"></span>
    {{ label }}
  </button>
</template>
