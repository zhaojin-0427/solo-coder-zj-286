import { ref, watch } from 'vue'
import type { WardrobeItem, Outfit, CalendarSchedule } from '@/types'
import { loadStorage, saveStorage, generateId } from '@/utils/storage'

const storage = loadStorage()
const wardrobe = ref<WardrobeItem[]>(storage.wardrobe)
const outfits = ref<Outfit[]>(storage.outfits)
const calendarSchedules = ref<CalendarSchedule[]>(storage.calendarSchedules)

watch(
  () => ({ wardrobe: wardrobe.value, outfits: outfits.value, calendarSchedules: calendarSchedules.value }),
  (data) => saveStorage(data),
  { deep: true },
)

export function useStorage() {
  return {
    wardrobe,
    outfits,
    calendarSchedules,
    generateId,
  }
}
