<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { CalendarSchedule, OutfitSnapshot, Occasion, WeatherTag } from '@/types'
import { OCCASION_LABELS, WEATHER_LABELS, WEATHER_ICONS, CATEGORY_LABELS, STYLE_LABELS } from '@/types'
import { X, Calendar, Plus, Sparkles, StickyNote, Sun, Tag } from 'lucide-vue-next'
import OutfitPickerModal from './OutfitPickerModal.vue'

const props = defineProps<{
  show: boolean
  initialDate?: string
  editingSchedule?: CalendarSchedule | null
  allowCanvas?: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [data: {
    date: string
    outfitSnapshot: OutfitSnapshot
    occasion: Occasion | ''
    note: string
    weather: WeatherTag | ''
  }]
}>()

const showOutfitPicker = ref(false)
const selectedDate = ref('')
const selectedSnapshot = ref<OutfitSnapshot | null>(null)
const selectedOccasion = ref<Occasion | ''>('')
const selectedWeather = ref<WeatherTag | ''>('')
const note = ref('')

watch(
  () => props.show,
  (show) => {
    if (show) {
      if (props.editingSchedule) {
        selectedDate.value = props.editingSchedule.date
        selectedSnapshot.value = props.editingSchedule.outfitSnapshot
        selectedOccasion.value = props.editingSchedule.occasion
        selectedWeather.value = props.editingSchedule.weather
        note.value = props.editingSchedule.note
      } else {
        selectedDate.value = props.initialDate || new Date().toISOString().slice(0, 10)
        selectedSnapshot.value = null
        selectedOccasion.value = ''
        selectedWeather.value = ''
        note.value = ''
      }
    }
  },
  { immediate: true },
)

function handleSelectSnapshot(snapshot: OutfitSnapshot) {
  selectedSnapshot.value = snapshot
  if (!selectedOccasion.value && snapshot.occasion) {
    selectedOccasion.value = snapshot.occasion
  }
  showOutfitPicker.value = false
}

function handleClearSnapshot() {
  selectedSnapshot.value = null
}

function handleSave() {
  if (!selectedSnapshot.value || !selectedDate.value) return
  emit('save', {
    date: selectedDate.value,
    outfitSnapshot: selectedSnapshot.value,
    occasion: selectedOccasion.value,
    note: note.value.trim(),
    weather: selectedWeather.value,
  })
  handleClose()
}

function handleClose() {
  emit('close')
}

const canSave = computed(() => selectedSnapshot.value !== null && selectedDate.value !== '')

const isEditing = computed(() => props.editingSchedule !== null && props.editingSchedule !== undefined)
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm p-4"
        @click.self="handleClose"
      >
        <div class="bg-white rounded-2xl shadow-card w-full max-w-lg max-h-[90vh] flex flex-col animate-scale-in">
          <div class="flex items-center justify-between px-6 py-4 border-b border-cream-200">
            <h3 class="font-display text-xl font-semibold text-ink-900 flex items-center gap-2">
              <Sparkles class="w-5 h-5 text-burgundy-500" />
              {{ isEditing ? '编辑穿搭计划' : '新增穿搭计划' }}
            </h3>
            <button
              class="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-cream-100 transition-all"
              @click="handleClose"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-5">
            <div>
              <label class="flex items-center gap-1.5 text-sm font-medium text-ink-700 mb-2">
                <Calendar class="w-4 h-4" />
                选择日期
              </label>
              <input
                v-model="selectedDate"
                type="date"
                class="input-field"
              />
            </div>

            <div>
              <label class="flex items-center gap-1.5 text-sm font-medium text-ink-700 mb-2">
                <Tag class="w-4 h-4" />
                选择搭配
              </label>
              <div v-if="selectedSnapshot" class="card p-3">
                <div class="flex items-start gap-3">
                  <div class="w-20 h-20 rounded-lg overflow-hidden bg-cream-50 shrink-0">
                    <div class="w-full h-full p-1.5 flex flex-wrap gap-0.5 items-center justify-center content-center">
                      <img
                        v-for="item in selectedSnapshot.items.slice(0, 4)"
                        :key="item.id"
                        :src="item.image"
                        class="w-7 h-7 object-cover rounded border border-white"
                      />
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-ink-900 truncate">{{ selectedSnapshot.name }}</p>
                    <p class="text-xs text-ink-500 mt-0.5">
                      {{ selectedSnapshot.items.length }} 件单品 · {{ selectedSnapshot.harmonyScore }}分
                    </p>
                    <div class="flex flex-wrap gap-1 mt-1.5">
                      <span v-if="selectedSnapshot.style" class="chip !py-0.5 !text-[10px] !px-2">
                        {{ STYLE_LABELS[selectedSnapshot.style] }}
                      </span>
                      <span
                        v-for="(cat, idx) in [...new Set(selectedSnapshot.items.map(i => i.category))]"
                        :key="idx"
                        class="chip !py-0.5 !text-[10px] !px-2 !bg-cream-50"
                      >
                        {{ CATEGORY_LABELS[cat] }}
                      </span>
                    </div>
                  </div>
                  <button
                    class="w-7 h-7 rounded-md text-ink-400 hover:bg-cream-100 hover:text-burgundy-500 flex items-center justify-center transition-all shrink-0"
                    title="更换搭配"
                    @click="showOutfitPicker = true"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button
                v-else
                class="w-full h-32 rounded-xl border-2 border-dashed border-cream-300 hover:border-burgundy-400 hover:bg-burgundy-50/30 flex flex-col items-center justify-center gap-2 transition-all text-ink-500 hover:text-burgundy-500"
                @click="showOutfitPicker = true"
              >
                <Plus class="w-6 h-6" />
                <span class="text-sm font-medium">点击选择搭配</span>
              </button>
            </div>

            <div>
              <label class="block text-sm font-medium text-ink-700 mb-2">场合</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="(label, key) in OCCASION_LABELS"
                  :key="key"
                  :class="[
                    'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                    selectedOccasion === key
                      ? 'bg-sage-500 text-white border-sage-500'
                      : 'bg-white text-ink-700 border-cream-300 hover:border-sage-300',
                  ]"
                  @click="selectedOccasion = selectedOccasion === key ? '' : (key as Occasion)"
                >{{ label }}</button>
              </div>
            </div>

            <div>
              <label class="flex items-center gap-1.5 text-sm font-medium text-ink-700 mb-2">
                <Sun class="w-4 h-4" />
                天气标签
              </label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="(label, key) in WEATHER_LABELS"
                  :key="key"
                  :class="[
                    'px-3 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1',
                    selectedWeather === key
                      ? 'bg-sky-500 text-white border-sky-500'
                      : 'bg-white text-ink-700 border-cream-300 hover:border-sky-300',
                  ]"
                  @click="selectedWeather = selectedWeather === key ? '' : (key as WeatherTag)"
                >
                  <span>{{ WEATHER_ICONS[key] }}</span>
                  {{ label }}
                </button>
              </div>
            </div>

            <div>
              <label class="flex items-center gap-1.5 text-sm font-medium text-ink-700 mb-2">
                <StickyNote class="w-4 h-4" />
                备注
              </label>
              <textarea
                v-model="note"
                rows="3"
                class="input-field resize-none"
                placeholder="添加备注信息（可选）..."
              ></textarea>
            </div>
          </div>

          <div class="flex gap-3 px-6 py-4 border-t border-cream-200">
            <button class="btn-secondary flex-1" @click="handleClose">取消</button>
            <button class="btn-primary flex-1" :disabled="!canSave" @click="handleSave">
              {{ isEditing ? '保存修改' : '添加计划' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <OutfitPickerModal
    :show="showOutfitPicker"
    :allow-canvas="allowCanvas"
    @close="showOutfitPicker = false"
    @select="handleSelectSnapshot"
  />
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
