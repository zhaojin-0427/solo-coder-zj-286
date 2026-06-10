<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Outfit, WardrobeItem, OutfitSnapshot } from '@/types'
import { OCCASION_LABELS, STYLE_LABELS, CATEGORY_LABELS } from '@/types'
import { X, Search, Check, Palette } from 'lucide-vue-next'
import { useOutfit } from '@/composables/useOutfit'
import { useWardrobe } from '@/composables/useWardrobe'
import { createOutfitSnapshot, createSnapshotFromCanvasItems } from '@/composables/useCalendar'
import { analyzeColors } from '@/utils/colorTheory'

const props = defineProps<{
  show: boolean
  allowCanvas?: boolean
}>()

const emit = defineEmits<{
  close: []
  select: [snapshot: OutfitSnapshot]
}>()

const { outfits, canvasLayers, canvasOccasion, canvasItemIds } = useOutfit()
const { getItemById, wardrobe } = useWardrobe()

const searchQuery = ref('')
const selectedId = ref<string | null>(null)
const sourceMode = ref<'saved' | 'canvas'>('saved')

const filteredOutfits = computed(() => {
  let list = outfits.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(o => o.name.toLowerCase().includes(q))
  }
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
})

function getOutfitItems(outfit: Outfit): WardrobeItem[] {
  return outfit.itemIds.map(id => getItemById(id)).filter(Boolean) as WardrobeItem[]
}

function getAllColors(items: WardrobeItem[]): string[] {
  const c: string[] = []
  items.forEach(i => c.push(...i.colors))
  return c
}

const canvasItems = computed(() =>
  canvasLayers.value
    .map(layer => ({ layer, item: getItemById(layer.itemId) }))
    .filter(x => x.item != null) as Array<{ layer: any; item: WardrobeItem }>,
)

const canvasHasItems = computed(() => canvasItems.value.length > 0)

const canvasAnalysis = computed(() => {
  const colorList: string[] = []
  canvasItems.value.forEach(({ item }) => colorList.push(...item.colors))
  return analyzeColors(colorList)
})

function handleSelectSaved(outfit: Outfit) {
  selectedId.value = outfit.id
}

function handleConfirm() {
  if (sourceMode.value === 'canvas') {
    if (!canvasHasItems.value) return
    const items = canvasItems.value.map(c => c.item)
    const snapshot = createSnapshotFromCanvasItems(
      '当前画布搭配',
      canvasOccasion.value,
      canvasAnalysis.value.style,
      canvasAnalysis.value.score,
      items,
      canvasLayers.value,
    )
    emit('select', snapshot)
  } else {
    const outfit = outfits.value.find(o => o.id === selectedId.value)
    if (!outfit) return
    const items = getOutfitItems(outfit)
    const snapshot = createOutfitSnapshot(outfit, items)
    emit('select', snapshot)
  }
  handleClose()
}

function handleClose() {
  emit('close')
}

const canConfirm = computed(() => {
  if (sourceMode.value === 'canvas') return canvasHasItems.value
  return selectedId.value !== null
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm p-4"
        @click.self="handleClose"
      >
        <div class="bg-white rounded-2xl shadow-card w-full max-w-3xl max-h-[85vh] flex flex-col animate-scale-in">
          <div class="flex items-center justify-between px-6 py-4 border-b border-cream-200">
            <h3 class="font-display text-xl font-semibold text-ink-900 flex items-center gap-2">
              <Palette class="w-5 h-5 text-burgundy-500" />
              选择搭配
            </h3>
            <button
                class="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-cream-100 transition-all"
                @click="handleClose"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

          <div class="px-6 py-3 border-b border-cream-200">
            <div class="flex gap-2">
              <button
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  sourceMode === 'saved'
                    ? 'bg-burgundy-500 text-white'
                    : 'bg-cream-100 text-ink-700 hover:bg-cream-200',
                ]"
                @click="sourceMode = 'saved'"
              >
                从灵感收藏
              </button>
              <button
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  sourceMode === 'canvas'
                    ? 'bg-burgundy-500 text-white'
                    : 'bg-cream-100 text-ink-700 hover:bg-cream-200',
                  !allowCanvas ? 'opacity-50 cursor-not-allowed' : '',
                ]"
                :disabled="!allowCanvas"
                @click="allowCanvas && (sourceMode = 'canvas')"
              >
                使用当前画布
              </button>
            </div>
          </div>

          <div v-if="sourceMode === 'saved'" class="px-6 py-3 border-b border-cream-200">
            <div class="relative">
              <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索搭配名称..."
                class="input-field pl-10"
              />
            </div>
          </div>

          <div class="flex-1 overflow-y-auto scrollbar-thin p-6">
            <div v-if="sourceMode === 'saved'">
              <div v-if="filteredOutfits.length === 0" class="flex flex-col items-center justify-center h-full text-center py-16">
                <div class="text-5xl mb-4">✨</div>
                <p class="text-ink-700 font-medium mb-1">暂无收藏的搭配</p>
                <p class="text-sm text-ink-500">在搭配画布中组合单品后点击「收藏搭配」</p>
              </div>
              <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div
                  v-for="outfit in filteredOutfits"
                  :key="outfit.id"
                  :class="[
                    'card p-3 cursor-pointer transition-all duration-200 relative',
                    selectedId === outfit.id
                      ? 'ring-2 ring-burgundy-500 shadow-card'
                      : 'hover:shadow-card hover:-translate-y-0.5',
                  ]"
                  @click="handleSelectSaved(outfit)"
                >
                  <div v-if="selectedId === outfit.id" class="absolute top-2 right-2 z-10">
                    <span class="w-6 h-6 rounded-full bg-burgundy-500 text-white flex items-center justify-center shadow-soft">
                      <Check class="w-4 h-4" />
                    </span>
                  </div>
                  <div class="relative aspect-[4/3] rounded-lg overflow-hidden bg-cream-50 mb-2">
                    <div class="absolute inset-0 p-2 flex flex-wrap gap-1 items-center justify-center content-center">
                      <img
                        v-for="item in getOutfitItems(outfit).slice(0, 4)"
                        :key="item.id"
                        :src="item.image"
                        class="w-10 h-10 object-cover rounded-md shadow-soft border border-white"
                      />
                    </div>
                    <div class="absolute bottom-1 left-1 right-1 flex gap-0.5">
                      <span
                        v-for="(c, idx) in getAllColors(getOutfitItems(outfit)).slice(0, 5)"
                        :key="idx"
                        class="flex-1 h-1 rounded-full"
                        :style="{ backgroundColor: c }"
                      ></span>
                    </div>
                  </div>
                  <p class="text-sm font-medium text-ink-900 truncate">{{ outfit.name }}</p>
                  <div class="flex flex-wrap gap-1 mt-1">
                    <span v-if="outfit.style" class="chip !py-0.5 !text-[10px] !px-2">
                      {{ STYLE_LABELS[outfit.style] }}
                    </span>
                    <span v-if="outfit.occasion" class="chip !py-0.5 !text-[10px] !px-2 !bg-sage-100 !text-sage-600 !border-sage-300">
                      {{ OCCASION_LABELS[outfit.occasion] }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else>
              <div v-if="!canvasHasItems" class="flex flex-col items-center justify-center h-full text-center py-16">
                <div class="text-5xl mb-4">🎨</div>
                <p class="text-ink-700 font-medium mb-1">当前画布为空</p>
                <p class="text-sm text-ink-500">请先在搭配工作台中添加单品</p>
              </div>
              <div v-else class="max-w-sm mx-auto">
                <div class="card p-4">
                  <div class="relative aspect-[4/3] rounded-lg overflow-hidden bg-cream-50 mb-3">
                    <div class="absolute inset-0 p-3 flex flex-wrap gap-1.5 items-center justify-center content-center">
                      <img
                        v-for="{ item } in canvasItems"
                        :key="item.id"
                        :src="item.image"
                        class="w-14 h-14 object-cover rounded-md shadow-soft border border-white"
                      />
                    </div>
                    <div class="absolute bottom-2 left-2 right-2 flex gap-1">
                      <span
                        v-for="(c, idx) in canvasAnalysis.dominantColors.slice(0, 5)"
                        :key="idx"
                        class="flex-1 h-1.5 rounded-full"
                        :style="{ backgroundColor: c }"
                      ></span>
                    </div>
                  </div>
                  <p class="font-medium text-ink-900">当前画布搭配</p>
                  <p class="text-xs text-ink-500 mt-0.5">{{ canvasItems.length }} 件单品</p>
                  <div class="flex flex-wrap gap-1 mt-2">
                    <span class="chip !py-0.5 !text-[10px] !px-2">
                      {{ STYLE_LABELS[canvasAnalysis.style] }} · {{ canvasAnalysis.score }}分
                    </span>
                    <span
                      v-for="(cat, idx) in [...new Set(canvasItems.map(c => c.item.category))]"
                      :key="idx"
                      class="chip !py-0.5 !text-[10px] !px-2 !bg-cream-50"
                    >
                      {{ CATEGORY_LABELS[cat] }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-3 px-6 py-4 border-t border-cream-200">
            <button class="btn-secondary flex-1" @click="handleClose">取消</button>
            <button class="btn-primary flex-1" :disabled="!canConfirm" @click="handleConfirm">
              确认选择
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
