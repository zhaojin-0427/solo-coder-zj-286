export type Category = 'top' | 'bottom' | 'shoes' | 'accessory'

export type StyleType = 'monochromatic' | 'complementary' | 'neutral' | 'analogous'

export type Occasion = 'daily' | 'work' | 'date' | 'party' | 'travel' | 'sport'

export type WeatherTag = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy' | 'hot' | 'cold'

export type CompareSortType = 'commute' | 'harmony' | 'minimal'

export interface MissingCategory {
  category: Category
  reason: string
}

export interface WardrobeItem {
  id: string
  name: string
  image: string
  category: Category
  colors: string[]
  createdAt: string
}

export interface OutfitLayer {
  itemId: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
}

export interface Outfit {
  id: string
  name: string
  occasion: Occasion | ''
  style: StyleType | ''
  harmonyScore: number
  itemIds: string[]
  layers: OutfitLayer[]
  createdAt: string
}

export interface ShoppingItem {
  id: string
  name: string
  category: Category
  suggestedColor: string
  reason: string
}

export interface ColorAnalysis {
  style: StyleType
  score: number
  description: string
  dominantColors: string[]
}

export const CATEGORY_LABELS: Record<Category, string> = {
  top: '上衣',
  bottom: '下装',
  shoes: '鞋子',
  accessory: '配饰',
}

export const STYLE_LABELS: Record<StyleType, string> = {
  monochromatic: '同色系',
  complementary: '互补色',
  neutral: '中性色',
  analogous: '邻近色',
}

export const OCCASION_LABELS: Record<Occasion, string> = {
  daily: '日常',
  work: '职场',
  date: '约会',
  party: '派对',
  travel: '旅行',
  sport: '运动',
}

export const STYLE_DESCRIPTIONS: Record<StyleType, string> = {
  monochromatic: '同一色相的深浅变化，简约高级，视觉统一',
  complementary: '色环相对的颜色搭配，强烈对比，醒目大胆',
  neutral: '黑白灰米棕为主，低调百搭，经典不过时',
  analogous: '色环相邻的颜色搭配，柔和协调，自然舒适',
}

export const COMPARE_SORT_LABELS: Record<CompareSortType, string> = {
  commute: '通勤优先',
  harmony: '色彩最协调',
  minimal: '最省补货',
}

export const COMPARE_SORT_DESCRIPTIONS: Record<CompareSortType, string> = {
  commute: '优先展示职场/日常场合搭配',
  harmony: '按色彩协调性评分从高到低',
  minimal: '按缺失单品数量从少到多',
}

export interface WardrobeItemSnapshot {
  id: string
  name: string
  image: string
  category: Category
  colors: string[]
}

export interface OutfitSnapshot {
  id: string
  name: string
  occasion: Occasion | ''
  style: StyleType | ''
  harmonyScore: number
  items: WardrobeItemSnapshot[]
  layers: OutfitLayer[]
}

export interface CalendarSchedule {
  id: string
  date: string
  outfitSnapshot: OutfitSnapshot
  occasion: Occasion | ''
  note: string
  weather: WeatherTag | ''
  createdAt: string
}

export const WEATHER_LABELS: Record<WeatherTag, string> = {
  sunny: '晴天',
  cloudy: '多云',
  rainy: '雨天',
  snowy: '雪天',
  windy: '大风',
  hot: '炎热',
  cold: '寒冷',
}

export const WEATHER_ICONS: Record<WeatherTag, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  snowy: '❄️',
  windy: '💨',
  hot: '🔥',
  cold: '🥶',
}
