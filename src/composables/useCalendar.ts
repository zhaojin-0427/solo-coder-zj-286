import { ref, computed } from 'vue'
import type {
  CalendarSchedule,
  Outfit,
  OutfitSnapshot,
  WardrobeItem,
  WardrobeItemSnapshot,
  Occasion,
  WeatherTag,
  OutfitLayer,
} from '@/types'
import { useStorage } from './useStorage'
import { useWardrobe } from './useWardrobe'
import { generateId } from '@/utils/storage'

let wardrobeRef: ReturnType<typeof useStorage>['wardrobe'] | null = null
function getWardrobeRef() {
  if (!wardrobeRef) {
    const { wardrobe } = useStorage()
    wardrobeRef = wardrobe
  }
  return wardrobeRef
}

export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function getWeekDates(baseDate: Date): Date[] {
  const d = new Date(baseDate)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  const dates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const nd = new Date(d)
    nd.setDate(d.getDate() + i)
    dates.push(nd)
  }
  return dates
}

export function getWeekRangeLabel(baseDate: Date): string {
  const week = getWeekDates(baseDate)
  const start = week[0]
  const end = week[6]
  if (start.getMonth() === end.getMonth()) {
    return `${start.getFullYear()}年${start.getMonth() + 1}月 ${start.getDate()}日 - ${end.getDate()}日`
  }
  return `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`
}

export function createOutfitSnapshot(
  outfit: Outfit,
  items: WardrobeItem[],
): OutfitSnapshot {
  const itemSnapshots: WardrobeItemSnapshot[] = items.map(item => ({
    id: item.id,
    name: item.name,
    image: item.image,
    category: item.category,
    colors: [...item.colors],
  }))
  return {
    id: outfit.id,
    name: outfit.name,
    occasion: outfit.occasion,
    style: outfit.style,
    harmonyScore: outfit.harmonyScore,
    items: itemSnapshots,
    layers: JSON.parse(JSON.stringify(outfit.layers)) as OutfitLayer[],
  }
}

export function createSnapshotFromCanvasItems(
  name: string,
  occasion: Occasion | '',
  style: string,
  harmonyScore: number,
  items: WardrobeItem[],
  layers: OutfitLayer[],
): OutfitSnapshot {
  const itemSnapshots: WardrobeItemSnapshot[] = items.map(item => ({
    id: item.id,
    name: item.name,
    image: item.image,
    category: item.category,
    colors: [...item.colors],
  }))
  return {
    id: generateId(),
    name: name || `临时搭配`,
    occasion,
    style: style as OutfitSnapshot['style'],
    harmonyScore,
    items: itemSnapshots,
    layers: JSON.parse(JSON.stringify(layers)) as OutfitLayer[],
  }
}

export function restoreMissingItemsFromSnapshot(snapshot: OutfitSnapshot): number {
  const wardrobe = getWardrobeRef()
  let restoredCount = 0
  snapshot.items.forEach(snapItem => {
    const exists = wardrobe.value.find(w => w.id === snapItem.id)
    if (!exists) {
      const restoredItem: WardrobeItem = {
        id: snapItem.id,
        name: snapItem.name,
        image: snapItem.image,
        category: snapItem.category,
        colors: [...snapItem.colors],
        createdAt: new Date().toISOString(),
        restoredFromSnapshot: true,
      }
      wardrobe.value.push(restoredItem)
      restoredCount++
    }
  })
  return restoredCount
}

export function useCalendar() {
  const { calendarSchedules, generateId: gid } = useStorage()
  const { getItemById } = useWardrobe()

  const currentWeekStart = ref<Date>(getWeekDates(new Date())[0])

  const weekDates = computed(() => getWeekDates(currentWeekStart.value))
  const weekRangeLabel = computed(() => getWeekRangeLabel(currentWeekStart.value))

  const schedulesByDate = computed(() => {
    const map = new Map<string, CalendarSchedule[]>()
    calendarSchedules.value.forEach(schedule => {
      const list = map.get(schedule.date) || []
      list.push(schedule)
      map.set(schedule.date, list)
    })
    map.forEach(list => list.sort((a, b) => a.createdAt.localeCompare(b.createdAt)))
    return map
  })

  function getSchedulesForDate(dateStr: string): CalendarSchedule[] {
    return schedulesByDate.value.get(dateStr) || []
  }

  function goToPrevWeek() {
    const d = new Date(currentWeekStart.value)
    d.setDate(d.getDate() - 7)
    currentWeekStart.value = d
  }

  function goToNextWeek() {
    const d = new Date(currentWeekStart.value)
    d.setDate(d.getDate() + 7)
    currentWeekStart.value = d
  }

  function goToToday() {
    currentWeekStart.value = getWeekDates(new Date())[0]
  }

  function goToDate(date: Date) {
    currentWeekStart.value = getWeekDates(date)[0]
  }

  function addSchedule(params: {
    date: string
    outfitSnapshot: OutfitSnapshot
    occasion?: Occasion | ''
    note?: string
    weather?: WeatherTag | ''
  }): CalendarSchedule {
    const schedule: CalendarSchedule = {
      id: gid(),
      date: params.date,
      outfitSnapshot: params.outfitSnapshot,
      occasion: params.occasion || params.outfitSnapshot.occasion || '',
      note: params.note || '',
      weather: params.weather || '',
      createdAt: new Date().toISOString(),
    }
    calendarSchedules.value.push(schedule)
    return schedule
  }

  function updateSchedule(id: string, patch: Partial<Omit<CalendarSchedule, 'id' | 'createdAt'>>) {
    const schedule = calendarSchedules.value.find(s => s.id === id)
    if (schedule) {
      Object.assign(schedule, patch)
    }
  }

  function deleteSchedule(id: string) {
    const idx = calendarSchedules.value.findIndex(s => s.id === id)
    if (idx >= 0) calendarSchedules.value.splice(idx, 1)
  }

  function buildSnapshotFromOutfit(outfit: Outfit): OutfitSnapshot {
    const items = outfit.itemIds.map(id => getItemById(id)).filter(Boolean) as WardrobeItem[]
    return createOutfitSnapshot(outfit, items)
  }

  return {
    calendarSchedules,
    currentWeekStart,
    weekDates,
    weekRangeLabel,
    schedulesByDate,
    getSchedulesForDate,
    goToPrevWeek,
    goToNextWeek,
    goToToday,
    goToDate,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    buildSnapshotFromOutfit,
  }
}
