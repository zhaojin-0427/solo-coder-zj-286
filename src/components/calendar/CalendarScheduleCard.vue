<script setup lang="ts">
import type { CalendarSchedule } from '@/types'
import { OCCASION_LABELS, STYLE_LABELS, WEATHER_LABELS, WEATHER_ICONS, CATEGORY_LABELS } from '@/types'
import { Trash2, Edit3, Eye } from 'lucide-vue-next'

const props = defineProps<{
  schedule: CalendarSchedule
}>()

const emit = defineEmits<{
  edit: [schedule: CalendarSchedule]
  delete: [id: string]
  load: [schedule: CalendarSchedule]
}>()

const allColors = () => {
  const c: string[] = []
  props.schedule.outfitSnapshot.items.forEach(i => c.push(...i.colors))
  return c
}
</script>

<template>
  <div class="card p-2.5 group hover:shadow-card transition-all duration-300 animate-fade-in-up">
    <div class="relative aspect-[4/3] rounded-lg overflow-hidden bg-cream-50 mb-2">
      <div class="absolute inset-0 p-1.5 flex flex-wrap gap-1 items-center justify-center content-center">
        <img
          v-for="item in schedule.outfitSnapshot.items.slice(0, 4)"
          :key="item.id"
          :src="item.image"
          class="w-10 h-10 object-cover rounded-md shadow-soft border border-white"
          :alt="item.name"
        />
      </div>
      <div class="absolute bottom-1 left-1 right-1 flex gap-0.5">
        <span
          v-for="(c, idx) in allColors().slice(0, 5)"
          :key="idx"
          class="flex-1 h-1 rounded-full"
          :style="{ backgroundColor: c }"
        ></span>
      </div>
    </div>

    <div class="flex items-start justify-between gap-1 mb-1">
      <div class="min-w-0 flex-1">
        <p class="text-xs font-medium text-ink-900 truncate">{{ schedule.outfitSnapshot.name }}</p>
      </div>
      <div class="text-right shrink-0">
        <p class="font-display text-xs font-bold text-burgundy-500 leading-none">{{ schedule.outfitSnapshot.harmonyScore }}</p>
      </div>
    </div>

    <div class="flex flex-wrap gap-0.5 mb-1.5">
      <span v-if="schedule.weather" class="chip !py-0 !text-[9px] !px-1.5 !bg-sky-50 !text-sky-700 !border-sky-200">
        {{ WEATHER_ICONS[schedule.weather] }}
      </span>
      <span v-if="schedule.occasion" class="chip !py-0 !text-[9px] !px-1.5 !bg-sage-100 !text-sage-600 !border-sage-300">
        {{ OCCASION_LABELS[schedule.occasion] }}
      </span>
      <span v-else-if="schedule.outfitSnapshot.occasion" class="chip !py-0 !text-[9px] !px-1.5 !bg-sage-100 !text-sage-600 !border-sage-300">
        {{ OCCASION_LABELS[schedule.outfitSnapshot.occasion] }}
      </span>
      <span v-if="schedule.outfitSnapshot.style" class="chip !py-0 !text-[9px] !px-1.5">
        {{ STYLE_LABELS[schedule.outfitSnapshot.style] }}
      </span>
    </div>

    <div class="flex items-center gap-1">
      <button
        class="flex-1 h-6 rounded-md text-[10px] font-medium flex items-center justify-center gap-1 bg-burgundy-50 text-burgundy-600 hover:bg-burgundy-500 hover:text-white transition-all"
        title="载入画布编辑"
        @click="emit('load', schedule)"
      >
        <Eye class="w-3 h-3" />
        载入画布
      </button>
      <button
        class="w-6 h-6 rounded-md flex items-center justify-center text-ink-400 hover:bg-sage-50 hover:text-sage-600 transition-all"
        title="编辑"
        @click="emit('edit', schedule)"
      >
        <Edit3 class="w-3 h-3" />
      </button>
      <button
        class="w-6 h-6 rounded-md flex items-center justify-center text-ink-400 hover:bg-burgundy-50 hover:text-burgundy-500 transition-all"
        title="删除"
        @click="emit('delete', schedule.id)"
      >
        <Trash2 class="w-3 h-3" />
      </button>
    </div>

    <p v-if="schedule.note" class="text-[10px] text-ink-400 mt-1.5 line-clamp-2">{{ schedule.note }}</p>
  </div>
</template>
