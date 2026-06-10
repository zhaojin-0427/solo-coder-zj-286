<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CalendarSchedule, OutfitSnapshot, Occasion, WeatherTag, OutfitLayer } from '@/types'
import { ChevronLeft, ChevronRight, Plus, CalendarDays, Target } from 'lucide-vue-next'
import CalendarScheduleCard from './CalendarScheduleCard.vue'
import ScheduleEditorModal from './ScheduleEditorModal.vue'
import {
  useCalendar,
  formatDate,
} from '@/composables/useCalendar'
import { useOutfit } from '@/composables/useOutfit'

const emit = defineEmits<{
  loadOutfit: [snapshot: OutfitSnapshot, layers: OutfitLayer[], occasion: Occasion | '']
}>()

const {
  calendarSchedules,
  weekDates,
  weekRangeLabel,
  getSchedulesForDate,
  goToPrevWeek,
  goToNextWeek,
  goToToday,
  addSchedule,
  updateSchedule,
  deleteSchedule,
} = useCalendar()

const { canvasLayers, canvasOccasion } = useOutfit()

const showEditor = ref(false)
const editingSchedule = ref<CalendarSchedule | null>(null)
const initialDate = ref('')

const todayStr = formatDate(new Date())

const weekdayLabels = ['一', '二', '三', '四', '五', '六', '日']

const hasCanvasItems = computed(() => canvasLayers.value.length > 0)

function handleAddForDate(dateStr: string) {
  editingSchedule.value = null
  initialDate.value = dateStr
  showEditor.value = true
}

function handleEdit(schedule: CalendarSchedule) {
  editingSchedule.value = schedule
  initialDate.value = schedule.date
  showEditor.value = true
}

function handleDelete(id: string) {
  deleteSchedule(id)
}

function handleSave(data: {
  date: string
  outfitSnapshot: OutfitSnapshot
  occasion: Occasion | ''
  note: string
  weather: WeatherTag | ''
}) {
  if (editingSchedule.value) {
    updateSchedule(editingSchedule.value.id, {
      date: data.date,
      outfitSnapshot: data.outfitSnapshot,
      occasion: data.occasion,
      note: data.note,
      weather: data.weather,
    })
  } else {
    addSchedule(data)
  }
}

function handleLoadToCanvas(schedule: CalendarSchedule) {
  const layers = JSON.parse(JSON.stringify(schedule.outfitSnapshot.layers)) as OutfitLayer[]
  const occasion = schedule.occasion || schedule.outfitSnapshot.occasion || ''
  emit('loadOutfit', schedule.outfitSnapshot, layers, occasion)
}

function isToday(date: Date): boolean {
  return formatDate(date) === todayStr
}

function formatDayNum(date: Date): string {
  return String(date.getDate())
}

function formatMonth(date: Date): string {
  return `${date.getMonth() + 1}月`
}

const totalSchedules = computed(() => calendarSchedules.value.length)
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="font-display text-2xl font-semibold text-ink-900 flex items-center gap-2">
          <CalendarDays class="w-6 h-6 text-burgundy-500" />
          穿搭日历
        </h2>
        <p class="text-sm text-ink-500 mt-0.5">
          共安排 {{ totalSchedules }} 个穿搭计划 · 数据保存在浏览器本地
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="btn-secondary flex items-center gap-1.5"
          @click="goToToday"
        >
          今天
        </button>
        <div class="flex items-center gap-1 bg-white rounded-lg border border-cream-200 p-0.5">
          <button
            class="w-8 h-8 rounded-md flex items-center justify-center text-ink-500 hover:bg-cream-100 transition-all"
            @click="goToPrevWeek"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <span class="px-3 text-sm font-medium text-ink-700 min-w-[180px] text-center">
            {{ weekRangeLabel }}
          </span>
          <button
            class="w-8 h-8 rounded-md flex items-center justify-center text-ink-500 hover:bg-cream-100 transition-all"
            @click="goToNextWeek"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-7 gap-3 flex-1 min-h-0">
      <template v-for="(date, idx) in weekDates" :key="date.toISOString()">
        <div class="flex flex-col min-h-0">
          <div
            :class="[
              'rounded-t-xl px-3 py-2 border-b border-cream-200 flex items-center justify-between',
              isToday(date)
                ? 'bg-burgundy-500 text-white'
                : 'bg-cream-50 text-ink-700',
            ]"
          >
            <div>
              <p
                :class="[
                  'text-[10px] font-medium uppercase tracking-wider',
                  isToday(date) ? 'text-white/80' : 'text-ink-400',
                ]"
              >
                周{{ weekdayLabels[idx] }}
              </p>
              <div class="flex items-baseline gap-1">
                <span
                  :class="[
                    'font-display text-lg font-bold leading-none',
                    isToday(date) ? 'text-white' : 'text-ink-900',
                  ]"
                >
                  {{ formatDayNum(date) }}
                </span>
                <span
                  v-if="idx === 0 || date.getDate() === 1"
                  :class="[
                    'text-[10px] font-medium',
                    isToday(date) ? 'text-white/80' : 'text-ink-400',
                  ]"
                >
                  {{ formatMonth(date) }}
                </span>
              </div>
            </div>
            <button
              :class="[
                'w-7 h-7 rounded-md flex items-center justify-center transition-all',
                isToday(date)
                  ? 'bg-white/20 hover:bg-white/30 text-white'
                  : 'text-burgundy-500 hover:bg-burgundy-50',
              ]"
              title="添加穿搭计划"
              @click="handleAddForDate(formatDate(date))"
            >
              <Plus class="w-4 h-4" />
            </button>
          </div>

          <div class="flex-1 bg-cream-50/50 rounded-b-xl border-x border-b border-cream-200 p-2 overflow-y-auto scrollbar-thin min-h-0 space-y-2">
            <div v-if="getSchedulesForDate(formatDate(date)).length === 0" class="h-full flex items-center justify-center">
              <button
                class="w-full h-full min-h-[80px] rounded-lg border border-dashed border-cream-200 hover:border-burgundy-300 hover:bg-white flex flex-col items-center justify-center gap-1 text-ink-300 hover:text-burgundy-400 transition-all"
                @click="handleAddForDate(formatDate(date))"
              >
                <Plus class="w-4 h-4" />
                <span class="text-[11px] font-medium">添加计划</span>
              </button>
            </div>
            <CalendarScheduleCard
              v-for="schedule in getSchedulesForDate(formatDate(date))"
              :key="schedule.id"
              :schedule="schedule"
              @edit="handleEdit"
              @delete="handleDelete"
              @load="handleLoadToCanvas"
            />
          </div>
        </div>
      </template>
    </div>

    <ScheduleEditorModal
      :show="showEditor"
      :initial-date="initialDate"
      :editing-schedule="editingSchedule"
      :allow-canvas="hasCanvasItems"
      @close="showEditor = false"
      @save="handleSave"
    />
  </div>
</template>
