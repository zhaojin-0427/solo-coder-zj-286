import { ref, watch } from 'vue'
import type { WardrobeItem, Outfit } from '@/types'
import { loadStorage, saveStorage, generateId } from '@/utils/storage'

const storage = loadStorage()
const wardrobe = ref<WardrobeItem[]>(storage.wardrobe)
const outfits = ref<Outfit[]>(storage.outfits)

watch(
  () => ({ wardrobe: wardrobe.value, outfits: outfits.value }),
  (data) => saveStorage(data),
  { deep: true },
)

export function useStorage() {
  return {
    wardrobe,
    outfits,
    generateId,
  }
}
