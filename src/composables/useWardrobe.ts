import { computed, ref } from 'vue'
import type { WardrobeItem, Category } from '@/types'
import { useStorage } from './useStorage'
import { extractColors } from '@/utils/colorExtractor'

export function useWardrobe() {
  const { wardrobe, generateId } = useStorage()
  const activeCategory = ref<Category | 'all'>('all')
  const searchQuery = ref('')

  const filteredItems = computed(() => {
    let items = wardrobe.value
    if (activeCategory.value !== 'all') {
      items = items.filter(i => i.category === activeCategory.value)
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      items = items.filter(i => i.name.toLowerCase().includes(q))
    }
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  })

  async function addItem(
    file: File,
    name: string,
    category: Category,
  ): Promise<WardrobeItem> {
    const image = await fileToDataUrl(file)
    let colors: string[] = []
    try {
      colors = await extractColors(image, 4)
    } catch {
      colors = ['#888888']
    }
    const item: WardrobeItem = {
      id: generateId(),
      name: name || file.name.replace(/\.[^.]+$/, ''),
      image,
      category,
      colors,
      createdAt: new Date().toISOString(),
    }
    wardrobe.value.push(item)
    return item
  }

  function removeItem(id: string) {
    const idx = wardrobe.value.findIndex(i => i.id === id)
    if (idx >= 0) wardrobe.value.splice(idx, 1)
  }

  function updateItemColors(id: string, colors: string[]) {
    const item = wardrobe.value.find(i => i.id === id)
    if (item) item.colors = colors
  }

  function getItemById(id: string) {
    return wardrobe.value.find(i => i.id === id)
  }

  return {
    wardrobe,
    activeCategory,
    searchQuery,
    filteredItems,
    addItem,
    removeItem,
    updateItemColors,
    getItemById,
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
