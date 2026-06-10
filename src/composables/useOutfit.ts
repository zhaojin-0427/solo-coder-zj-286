import { computed, ref } from 'vue'
import type { Outfit, OutfitLayer, Occasion, StyleType, WardrobeItem, ShoppingItem } from '@/types'
import { useStorage } from './useStorage'
import { analyzeColors } from '@/utils/colorTheory'
import { generateId } from '@/utils/storage'
import { CATEGORY_LABELS } from '@/types'

const canvasLayers = ref<OutfitLayer[]>([])
const canvasOccasion = ref<Occasion | ''>('')
const canvasLoadedOutfitId = ref<string | null>(null)

export function useOutfit() {
  const { outfits, generateId: gid, wardrobe } = useStorage()
  const canvasItemIds = computed(() => canvasLayers.value.map(l => l.itemId))
  const searchQuery = ref('')
  const filterStyle = ref<StyleType | 'all'>('all')
  const filterOccasion = ref<Occasion | 'all'>('all')

  const allColors = computed(() => {
    const colors: string[] = []
    canvasLayers.value.forEach(layer => {
      const item = wardrobe.value.find(w => w.id === layer.itemId)
      if (item) colors.push(...item.colors)
    })
    return colors
  })

  const analysis = computed(() => analyzeColors(allColors.value))

  const filteredOutfits = computed(() => {
    let list = outfits.value
    if (filterStyle.value !== 'all') {
      list = list.filter(o => o.style === filterStyle.value)
    }
    if (filterOccasion.value !== 'all') {
      list = list.filter(o => o.occasion === filterOccasion.value)
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      list = list.filter(o =>
        o.name.toLowerCase().includes(q),
      )
    }
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  })

  function addItemToCanvas(itemId: string, x = 50, y = 50) {
    if (canvasItemIds.value.includes(itemId)) return
    const layer: OutfitLayer = {
      itemId,
      x,
      y,
      width: 140,
      height: 160,
      zIndex: canvasLayers.value.length + 1,
    }
    canvasLayers.value.push(layer)
    canvasLoadedOutfitId.value = null
  }

  function removeLayer(itemId: string) {
    const idx = canvasLayers.value.findIndex(l => l.itemId === itemId)
    if (idx >= 0) canvasLayers.value.splice(idx, 1)
    canvasLoadedOutfitId.value = null
  }

  function updateLayer(itemId: string, patch: Partial<OutfitLayer>) {
    const layer = canvasLayers.value.find(l => l.itemId === itemId)
    if (layer) Object.assign(layer, patch)
  }

  function clearCanvas() {
    canvasLayers.value = []
    canvasOccasion.value = ''
    canvasLoadedOutfitId.value = null
  }

  function saveOutfit(
    name: string,
    occasion: Occasion | '',
    items: WardrobeItem[],
  ): Outfit {
    const colorList: string[] = []
    items.forEach(i => colorList.push(...i.colors))
    const ana = analyzeColors(colorList)
    const outfit: Outfit = {
      id: gid(),
      name: name || `搭配 ${outfits.value.length + 1}`,
      occasion,
      style: ana.style,
      harmonyScore: ana.score,
      itemIds: items.map(i => i.id),
      layers: JSON.parse(JSON.stringify(canvasLayers.value)),
      createdAt: new Date().toISOString(),
    }
    outfits.value.push(outfit)
    return outfit
  }

  function deleteOutfit(id: string) {
    const idx = outfits.value.findIndex(o => o.id === id)
    if (idx >= 0) outfits.value.splice(idx, 1)
  }

  function loadOutfitToCanvas(outfit: Outfit) {
    canvasLayers.value = JSON.parse(JSON.stringify(outfit.layers))
    canvasOccasion.value = outfit.occasion
    canvasLoadedOutfitId.value = outfit.id
  }

  function generateShoppingList(currentItems: WardrobeItem[]): ShoppingItem[] {
    const categories = new Set(currentItems.map(i => i.category))
    const needed: { category: WardrobeItem['category'], colors: string[] }[] = []
    if (!categories.has('top')) needed.push({ category: 'top', colors: [] })
    if (!categories.has('bottom')) needed.push({ category: 'bottom', colors: [] })
    if (!categories.has('shoes')) needed.push({ category: 'shoes', colors: [] })
    const list: ShoppingItem[] = needed.map(n => ({
      id: generateId(),
      name: `建议购入${CATEGORY_LABELS[n.category]}`,
      category: n.category,
      suggestedColor: '#8B2635',
      reason: `当前搭配缺少${CATEGORY_LABELS[n.category]}`,
    }))
    return list
  }

  return {
    outfits,
    canvasLayers,
    canvasItemIds,
    canvasOccasion,
    canvasLoadedOutfitId,
    searchQuery,
    filterStyle,
    filterOccasion,
    analysis,
    filteredOutfits,
    allColors,
    addItemToCanvas,
    removeLayer,
    updateLayer,
    clearCanvas,
    saveOutfit,
    deleteOutfit,
    loadOutfitToCanvas,
    generateShoppingList,
  }
}
