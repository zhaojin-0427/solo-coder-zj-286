import { computed, ref } from 'vue'
import type { Outfit, WardrobeItem, CompareSortType, Category, MissingCategory, Occasion, OutfitLayer } from '@/types'
import { CATEGORY_LABELS } from '@/types'
import { analyzeColors } from '@/utils/colorTheory'
import { generateId } from '@/utils/storage'

export interface ComparisonEntry {
  comparisonId: string
  outfit: Outfit
  isTemporary: boolean
  itemSnapshots: WardrobeItem[]
  canvasSignature: string | null
}

const MAX_COMPARISONS = 3

const comparisonEntries = ref<ComparisonEntry[]>([])
const sortType = ref<CompareSortType>('harmony')

function buildCanvasSignature(itemIds: string[]): string {
  return [...itemIds].sort().join('|')
}

function snapshotItems(items: WardrobeItem[]): WardrobeItem[] {
  return items.map(item => JSON.parse(JSON.stringify(item)))
}

export function useComparison() {
  const canAddMore = computed(() => comparisonEntries.value.length < MAX_COMPARISONS)
  const count = computed(() => comparisonEntries.value.length)

  function getMissingCategories(entry: ComparisonEntry): MissingCategory[] {
    const categories = new Set(entry.itemSnapshots.map(i => i.category))
    const needed: Category[] = ['top', 'bottom', 'shoes']
    return needed
      .filter(c => !categories.has(c))
      .map(category => ({
        category,
        reason: `缺少${CATEGORY_LABELS[category]}，整体造型不完整`,
      }))
  }

  function getDominantColors(entry: ComparisonEntry): string[] {
    const colors: string[] = []
    entry.itemSnapshots.forEach(i => colors.push(...i.colors))
    return Array.from(new Set(colors)).slice(0, 6)
  }

  function buildTemporaryOutfit(
    layers: OutfitLayer[],
    items: WardrobeItem[],
    occasion: Occasion | '' = '',
    name = '画布临时搭配',
  ): Outfit {
    const colorList: string[] = []
    items.forEach(i => colorList.push(...i.colors))
    const analysis = analyzeColors(colorList)
    const itemIds = layers.map(l => l.itemId)
    return {
      id: generateId(),
      name,
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

  function isCanvasInComparison(itemIds: string[]): boolean {
    const sig = buildCanvasSignature(itemIds)
    return comparisonEntries.value.some(e => e.canvasSignature === sig)
  }

  function addOutfitToComparison(
    outfit: Outfit,
    items: WardrobeItem[],
    isTemporary = false,
    canvasItemIds: string[] | null = null,
  ): boolean {
    if (!canAddMore.value) return false
    if (!isTemporary && isOutfitInComparison(outfit.id)) return false
    if (isTemporary && canvasItemIds && isCanvasInComparison(canvasItemIds)) return false
    comparisonEntries.value.push({
      comparisonId: generateId(),
      outfit: JSON.parse(JSON.stringify(outfit)),
      isTemporary,
      itemSnapshots: snapshotItems(items),
      canvasSignature: canvasItemIds ? buildCanvasSignature(canvasItemIds) : null,
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

  function sortEntries(): ComparisonEntry[] {
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
          const ma = getMissingCategories(a).length
          const mb = getMissingCategories(b).length
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
    isCanvasInComparison,
    addOutfitToComparison,
    removeFromComparison,
    clearComparison,
    sortEntries,
    setSortType,
    buildTemporaryOutfit,
    getMissingCategories,
    getDominantColors,
  }
}
