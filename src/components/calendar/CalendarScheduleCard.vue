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
  <div class="card p-3 group hover:shadow-card transition-all duration-300 animate-fade-in-up">
    <div class="relative aspect-[4/3] rounded-lg overflow-hidden bg-cream-50 mb-2">
      <div class="absolute inset-0 p-2 flex flex-wrap gap-1 items-center justify-center content-center">
        <img
          v-for="item in schedule.outfitSnapshot.items.slice(0, 4)"
          :key="item.id"
          :src="item.image"
          class="w-12 h-12 object-cover rounded-md shadow-soft border border-white"
          :alt="item.name"
        />
      </div>
      <div class="absolute bottom-1.5 left-1.5 right-1.5 flex gap-0.5">
        <span
          v-for="(c, idx) in allColors().slice(0, 5)"
          :key="idx"
          class="flex-1 h-1 rounded-full"
          :style="{ backgroundColor: c }"
        ></span>
      </div>
      <div class="absolute inset-0 bg-ink-900/0 group-hover:bg-ink-900/40 transition-all duration-300 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
        <button
          class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-ink-900 hover:bg-burgundy-500 hover:text-white transition-all"
          title="载入画布编辑"
          @click="emit('load', schedule)"
        >
          <Eye class="w-3.5 h-3.5" />
        </button>
        <button
          class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-ink-900 hover:bg-sage-500 hover:text-white transition-all"
          title="编辑"
          @click="emit('edit', schedule)"
        >
          <Edit3 class="w-3.5 h-3.5" />
        </button>
        <button
          class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-ink-900 hover:bg-burgundy-500 hover:text-white transition-all"
          title="删除"
          @click="emit('delete', schedule.id)"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <div class="flex items-start justify-between gap-1.5 mb-1.5">
      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium text-ink-900 truncate">{{ schedule.outfitSnapshot.name }}</p>
      </div>
      <div class="text-right shrink-0">
        <p class="font-display text-sm font-bold text-burgundy-500 leading-none">{{ schedule.outfitSnapshot.harmonyScore }}</p>
      </div>
    </div>

    <div class="flex flex-wrap gap-1 mb-1.5">
      <span v-if="schedule.weather" class="chip !py-0.5 !text-[10px] !px-2 !bg-sky-50 !text-sky-700 !border-sky-200">
        {{ WEATHER_ICONS[schedule.weather] }} {{ WEATHER_LABELS[schedule.weather] }}
      </span>
      <span v-if="schedule.occasion" class="chip !py-0.5 !text-[10px] !px-2 !bg-sage-100 !text-sage-600 !border-sage-300">
        {{ OCCASION_LABELS[schedule.occasion] }}
      </span>
      <span v-else-if="schedule.outfitSnapshot.occasion" class="chip !py-0.5 !text-[10px] !px-2 !bg-sage-100 !text-sage-600 !border-sage-300">
        {{ OCCASION_LABELS[schedule.outfitSnapshot.occasion] }}
      </span>
      <span v-if="schedule.outfitSnapshot.style" class="chip !py-0.5 !text-[10px] !px-2">
        {{ STYLE_LABELS[schedule.outfitSnapshot.style] }}
      </span>
    </div>

    <div class="flex flex-wrap gap-1">
      <span
        v-for="(cat, idx) in [...new Set(schedule.outfitSnapshot.items.map(i => i.category))]"
        :key="idx"
        class="chip !py-0.5 !text-[10px] !px-2 !bg-cream-50"
      >
        {{ CATEGORY_LABELS[cat] }}
      </span>
    </div>

    <p v-if="schedule.note" class="text-xs text-ink-500 mt-2 line-clamp-2">{{ schedule.note }}</p>
  </div>
</template>
