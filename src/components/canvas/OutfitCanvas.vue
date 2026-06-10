<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { OutfitLayer, WardrobeItem, Occasion, Outfit } from '@/types'
import { OCCASION_LABELS, STYLE_LABELS } from '@/types'
import { Save, Trash2, Download, ShoppingBag, Sparkles, GitCompare } from 'lucide-vue-next'
import CanvasItem from './CanvasItem.vue'
import HarmonyBadge from './HarmonyBadge.vue'
import ColorAnalysis from '@/components/analysis/ColorAnalysis.vue'
import ShoppingListModal from '@/components/shopping/ShoppingListModal.vue'
import { useOutfit } from '@/composables/useOutfit'
import { useWardrobe } from '@/composables/useWardrobe'
import { useComparison } from '@/composables/useComparison'
import { analyzeColors } from '@/utils/colorTheory'
import { exportCanvasToImage } from '@/utils/imageExporter'

const emit = defineEmits<{
  saved: [outfit: Outfit]
}>()

const {
  canvasLayers,
  canvasItemIds,
  canvasOccasion,
  canvasLoadedOutfitId,
  outfits,
  addItemToCanvas,
  removeLayer,
  updateLayer,
  clearCanvas,
  saveOutfit,
  generateShoppingList,
} = useOutfit()

const { getItemById, wardrobe } = useWardrobe()
const {
  canAddMore,
  isCanvasInComparison,
  addOutfitToComparison,
  buildTemporaryOutfit,
} = useComparison()

const addedNotification = ref(false)
const fullNotification = ref(false)
const duplicateNotification = ref(false)

const canvasRef = ref<HTMLElement | null>(null)
const isDragOver = ref(false)
const showSaveModal = ref(false)
const showShoppingModal = ref(false)
const outfitName = ref('')
const outfitOccasion = ref<Occasion | ''>('')

const canvasItems = computed(() =>
  canvasLayers.value
    .map(layer => ({ layer, item: getItemById(layer.itemId) }))
    .filter(x => x.item != null) as Array<{ layer: OutfitLayer; item: WardrobeItem }>,
)

const allColors = computed(() => {
  const colors: string[] = []
  canvasItems.value.forEach(({ item }) => colors.push(...item.colors))
  return colors
})

const analysis = computed(() => analyzeColors(allColors.value))

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  e.dataTransfer!.dropEffect = 'copy'
  isDragOver.value = true
}

function handleDragLeave() {
  isDragOver.value = false
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false
  const itemId = e.dataTransfer?.getData('itemId')
  if (!itemId || !canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left - 70
  const y = e.clientY - rect.top - 80
  addItemToCanvas(itemId, Math.max(0, x), Math.max(0, y))
}

function handleLayerUpdate(itemId: string, patch: Partial<OutfitLayer>) {
  updateLayer(itemId, patch)
}

function bringLayerToFront(itemId: string) {
  const maxZ = Math.max(0, ...canvasLayers.value.map(l => l.zIndex))
  updateLayer(itemId, { zIndex: maxZ + 1 })
}

function handleSave() {
  if (canvasItems.value.length === 0) return
  showSaveModal.value = true
}

function confirmSave() {
  const items = canvasItems.value.map(c => c.item)
  const outfit = saveOutfit(outfitName.value, outfitOccasion.value, items)
  emit('saved', outfit)
  showSaveModal.value = false
  outfitName.value = ''
  outfitOccasion.value = ''
}

async function handleExport() {
  if (!canvasRef.value || canvasItems.value.length === 0) return
  try {
    await exportCanvasToImage(canvasRef.value, `outfit-${Date.now()}.png`)
  } catch (e) {
    console.error(e)
  }
}

function handleShoppingList() {
  if (canvasItems.value.length === 0) return
  showShoppingModal.value = true
}

function handleAddToComparison() {
  if (canvasItems.value.length === 0) return
  const currentItemIds = canvasItemIds.value
  if (isCanvasInComparison(currentItemIds)) {
    duplicateNotification.value = true
    setTimeout(() => {
      duplicateNotification.value = false
    }, 2500)
    return
  }
  if (!canAddMore.value) {
    fullNotification.value = true
    setTimeout(() => {
      fullNotification.value = false
    }, 2500)
    return
  }
  const items = canvasItems.value.map(c => c.item)
  const loadedOutfit = outfits.value.find(o => o.id === canvasLoadedOutfitId.value)
  const tempOutfit = buildTemporaryOutfit(
    canvasLayers.value,
    items,
    canvasOccasion.value,
    loadedOutfit?.name,
  )
  const success = addOutfitToComparison(tempOutfit, items, true, currentItemIds)
  if (success) {
    addedNotification.value = true
    setTimeout(() => {
      addedNotification.value = false
    }, 2500)
  }
}

watch(canvasLayers, () => {}, { deep: true })
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="font-display text-2xl font-semibold text-ink-900">搭配画布</h2>
        <p class="text-sm text-ink-500 mt-0.5">
          {{ canvasItems.length > 0 ? `已添加 ${canvasItems.length} 件单品` : '从左侧衣橱拖拽单品到画布' }}
        </p>
      </div>
      <div class="flex gap-2 flex-wrap">
        <button
          class="btn-secondary flex items-center gap-1.5"
          :disabled="canvasItems.length === 0"
          @click="handleAddToComparison"
          :title="isCanvasInComparison(canvasItemIds) ? '这套搭配已在对比区' : (!canAddMore ? '对比区已满（最多3套）' : '将当前画布搭配加入对比')"
        >
          <GitCompare class="w-4 h-4" />加入对比
        </button>
        <button
          class="btn-secondary flex items-center gap-1.5"
          :disabled="canvasItems.length === 0"
          @click="handleShoppingList"
        >
          <ShoppingBag class="w-4 h-4" />购物清单
        </button>
        <button
          class="btn-secondary flex items-center gap-1.5"
          :disabled="canvasItems.length === 0"
          @click="handleExport"
        >
          <Download class="w-4 h-4" />导出
        </button>
        <button
          class="btn-secondary flex items-center gap-1.5"
          :disabled="canvasItems.length === 0"
          @click="clearCanvas"
        >
          <Trash2 class="w-4 h-4" />清空
        </button>
        <button
          class="btn-primary flex items-center gap-1.5"
          :disabled="canvasItems.length === 0"
          @click="handleSave"
        >
          <Save class="w-4 h-4" />收藏搭配
        </button>
      </div>
    </div>

    <div class="flex gap-4 flex-1 min-h-0">
      <div
        ref="canvasRef"
        :class="[
          'flex-1 relative bg-cream-50 rounded-xl border-2 border-dashed transition-all duration-200 min-h-[500px] overflow-hidden',
          isDragOver ? 'dragging-over border-burgundy-500 bg-burgundy-50/30' : 'border-cream-300',
        ]"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      >
        <div
          v-if="canvasItems.length === 0"
          class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none"
        >
          <div class="text-6xl mb-4 animate-float">👗</div>
          <p class="font-display text-xl text-ink-700 mb-1">打造你的专属造型</p>
          <p class="text-sm text-ink-500">从左侧衣橱拖拽单品到这里开始搭配</p>
          <p class="text-xs text-ink-300 mt-2">系统将实时分析色彩协调性</p>
        </div>

        <CanvasItem
          v-for="{ layer, item } in canvasItems"
          :key="layer.itemId"
          :layer="layer"
          :item="item"
          :canvas-ref="canvasRef"
          @update="(patch) => handleLayerUpdate(layer.itemId, patch)"
          @remove="removeLayer"
          @bring-to-front="bringLayerToFront(layer.itemId)"
        />

        <HarmonyBadge
          v-if="canvasItems.length > 0"
          :score="analysis.score"
          :style="analysis.style"
          :description="analysis.description"
        />
      </div>

      <ColorAnalysis
        v-if="canvasItems.length > 0"
        class="w-72 shrink-0"
        :colors="allColors"
        :score="analysis.score"
        :style-type="analysis.style"
        :description="analysis.description"
      />
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showSaveModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm p-4"
          @click.self="showSaveModal = false"
        >
          <div class="bg-white rounded-2xl shadow-card w-full max-w-md animate-scale-in">
            <div class="flex items-center justify-between px-6 py-4 border-b border-cream-200">
              <h3 class="font-display text-xl font-semibold text-ink-900 flex items-center gap-2">
                <Sparkles class="w-5 h-5 text-burgundy-500" />
                收藏搭配方案
              </h3>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-ink-700 mb-2">搭配名称</label>
                <input v-model="outfitName" type="text" class="input-field" placeholder="如：春日通勤 Look" />
              </div>
              <div>
                <label class="block text-sm font-medium text-ink-700 mb-2">适用场合</label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="(label, key) in OCCASION_LABELS"
                    :key="key"
                    :class="[
                      'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                      outfitOccasion === key
                        ? 'bg-burgundy-500 text-white border-burgundy-500'
                        : 'bg-white text-ink-700 border-cream-300 hover:border-burgundy-300',
                    ]"
                    @click="outfitOccasion = outfitOccasion === key ? '' : (key as Occasion)"
                  >{{ label }}</button>
                </div>
              </div>
              <div class="bg-cream-50 rounded-lg p-3 flex items-center gap-3">
                <div class="flex -space-x-1">
                  <span
                    v-for="c in analysis.dominantColors.slice(0, 4)"
                    :key="c"
                    class="w-6 h-6 rounded-full border-2 border-white"
                    :style="{ backgroundColor: c }"
                  ></span>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-ink-900">{{ STYLE_LABELS[analysis.style] }} · {{ analysis.score }}分</p>
                  <p class="text-xs text-ink-500">{{ analysis.description }}</p>
                </div>
              </div>
            </div>
            <div class="flex gap-3 px-6 py-4 border-t border-cream-200">
              <button class="btn-secondary flex-1" @click="showSaveModal = false">取消</button>
              <button class="btn-primary flex-1" @click="confirmSave">确认收藏</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <ShoppingListModal
      :show="showShoppingModal"
      :items="canvasItems.map(c => c.item)"
      @close="showShoppingModal = false"
    />

    <Teleport to="body">
      <Transition name="slide-up">
        <div
          v-if="addedNotification"
          class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-ink-900 text-white px-5 py-3 rounded-xl shadow-card flex items-center gap-2"
        >
          <GitCompare class="w-4 h-4 text-burgundy-300" />
          <span class="text-sm font-medium">已加入对比决策台</span>
        </div>
      </Transition>
      <Transition name="slide-up">
        <div
          v-if="fullNotification"
          class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-amber-600 text-white px-5 py-3 rounded-xl shadow-card flex items-center gap-2"
        >
          <GitCompare class="w-4 h-4" />
          <span class="text-sm font-medium">对比区已满，最多同时对比 3 套方案</span>
        </div>
      </Transition>
      <Transition name="slide-up">
        <div
          v-if="duplicateNotification"
          class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-ink-700 text-white px-5 py-3 rounded-xl shadow-card flex items-center gap-2"
        >
          <GitCompare class="w-4 h-4 text-cream-200" />
          <span class="text-sm font-medium">这套画布搭配已在对比区</span>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 30px);
}
</style>
