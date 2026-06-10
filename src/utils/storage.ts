import type { WardrobeItem, Outfit, CalendarSchedule } from '@/types'

const STORAGE_KEY = 'outfit-collector-data'

interface AppStorage {
  wardrobe: WardrobeItem[]
  outfits: Outfit[]
  calendarSchedules: CalendarSchedule[]
}

const defaultStorage: AppStorage = {
  wardrobe: [],
  outfits: [],
  calendarSchedules: [],
}

export function loadStorage(): AppStorage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaultStorage }
    const parsed = JSON.parse(raw) as AppStorage
    return {
      wardrobe: parsed.wardrobe || [],
      outfits: parsed.outfits || [],
      calendarSchedules: parsed.calendarSchedules || [],
    }
  } catch {
    return { ...defaultStorage }
  }
}

export function saveStorage(data: AppStorage): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save to localStorage:', e)
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
