import { computed, ref } from 'vue'
import type { Outfit, WardrobeItem, CompareSortType, Category, MissingCategory } from '@/types'
import { CATEGORY_LABELS } from '@/types'
import { analyzeColors } from '@/utils/colorTheory'
import { generateId } from '@/utils/storage'

export interface ComparisonEntry {
  comparisonId: string
  outfit: Outfit
  isTemporary: boolean
}

const MAX_COMPARISONS = 3

const comparisonEntries = ref<ComparisonEntry[]>([])
const sortType = ref<CompareSortType>('harmony')

export function useComparison() {
  const canAddMore = computed(() => comparisonEntries.value.length < MAX_COMPARISONS)
  const count = computed(() => comparisonEntries.value.length)

  function getOutfitItems(outfit: Outfit, wardrobe: WardrobeItem[]): WardrobeItem[] {
    return outfit.itemIds.map(id => wardrobe.find(w => w.id === id)).filter(Boolean) as WardrobeItem[]
  }

  function getMissingCategories(outfit: Outfit, wardrobe: WardrobeItem[]): MissingCategory[] {
    const items = getOutfitItems(outfit, wardrobe)
    const categories = new Set(items.map(i => i.category))
    const needed: Category[] = ['top', 'bottom', 'shoes']
    return needed
      .filter(c => !categories.has(c))
      .map(category => ({
        category,
        reason: `缺少${CATEGORY_LABELS[category]}，整体造型不完整`,
      }))
  }

  function getDominantColors(outfit: Outfit, wardrobe: WardrobeItem[]): string[] {
    const items = getOutfitItems(outfit, wardrobe)
    const colors: string[] = []
    items.forEach(i => colors.push(...i.colors))
    return Array.from(new Set(colors)).slice(0, 6)
  }

  function buildTemporaryOutfit(
    layers: { itemId: string; x: number; y: number; width: number; height: number; zIndex: number }[],
    wardrobe: WardrobeItem[],
    occasion: Outfit['occasion'] = '',
  ): Outfit {
    const itemIds = layers.map(l => l.itemId)
    const items = itemIds.map(id => wardrobe.find(w => w.id === id)).filter(Boolean) as WardrobeItem[]
    const colorList: string[] = []
    items.forEach(i => colorList.push(...i.colors))
    const analysis = analyzeColors(colorList)
    return {
      id: generateId(),
      name: '画布临时搭配',
      occasion,
      style: analysis.style,
      harmonyScore: analysis.score,
      itemIds,
      layers: JSON.parse(JSON.stringify(layers)),
      createdAt: new Date().toISOString(),
    }
  }

  function isOutfitInComparison(outfitId: string): boolean {
    return comparisonEntries.value.some(e => e.outfit.id === outfitId)
  }

  function addOutfitToComparison(outfit: Outfit, isTemporary = false): boolean {
    if (!canAddMore.value) return false
    if (isOutfitInComparison(outfit.id)) return false
    comparisonEntries.value.push({
      comparisonId: generateId(),
      outfit: JSON.parse(JSON.stringify(outfit)),
      isTemporary,
    })
    return true
  }

  function removeFromComparison(comparisonId: string) {
    const idx = comparisonEntries.value.findIndex(e => e.comparisonId === comparisonId)
    if (idx >= 0) comparisonEntries.value.splice(idx, 1)
  }

  function clearComparison() {
    comparisonEntries.value = []
  }

  function sortEntries(wardrobe: WardrobeItem[]): ComparisonEntry[] {
    const list = [...comparisonEntries.value]
    const commutePriority: Record<string, number> = { work: 3, daily: 2, date: 1 }
    switch (sortType.value) {
      case 'commute':
        return list.sort((a, b) => {
          const pa = commutePriority[a.outfit.occasion] ?? 0
          const pb = commutePriority[b.outfit.occasion] ?? 0
          if (pb !== pa) return pb - pa
          return b.outfit.harmonyScore - a.outfit.harmonyScore
        })
      case 'harmony':
        return list.sort((a, b) => b.outfit.harmonyScore - a.outfit.harmonyScore)
      case 'minimal':
        return list.sort((a, b) => {
          const ma = getMissingCategories(a.outfit, wardrobe).length
          const mb = getMissingCategories(b.outfit, wardrobe).length
          if (ma !== mb) return ma - mb
          return b.outfit.harmonyScore - a.outfit.harmonyScore
        })
      default:
        return list
    }
  }

  function setSortType(type: CompareSortType) {
    sortType.value = type
  }

  return {
    comparisonEntries,
    sortType,
    canAddMore,
    count,
    MAX_COMPARISONS,
    isOutfitInComparison,
    addOutfitToComparison,
    removeFromComparison,
    clearComparison,
    sortEntries,
    setSortType,
    buildTemporaryOutfit,
    getOutfitItems,
    getMissingCategories,
    getDominantColors,
  }
}
