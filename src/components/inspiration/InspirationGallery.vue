<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Outfit, StyleType, Occasion, WardrobeItem } from '@/types'
import { STYLE_LABELS, OCCASION_LABELS } from '@/types'
import { Search, Filter } from 'lucide-vue-next'
import OutfitCard from './OutfitCard.vue'
import { useOutfit } from '@/composables/useOutfit'
import { useWardrobe } from '@/composables/useWardrobe'

const emit = defineEmits<{
  loadOutfit: [outfit: Outfit]
}>()

const {
  outfits,
  searchQuery,
  filterStyle,
  filterOccasion,
  filteredOutfits,
  deleteOutfit,
  loadOutfitToCanvas,
} = useOutfit()

const { getItemById } = useWardrobe()

const showFilters = ref(false)

function getOutfitItems(outfit: Outfit): WardrobeItem[] {
  return outfit.itemIds.map(id => getItemById(id)).filter(Boolean) as WardrobeItem[]
}

function handleLoad(outfit: Outfit) {
  loadOutfitToCanvas(outfit)
  emit('loadOutfit', outfit)
}

const isEmpty = computed(() => filteredOutfits.value.length === 0)
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="font-display text-2xl font-semibold text-ink-900">灵感收藏</h2>
        <p class="text-sm text-ink-500 mt-0.5">共收藏 {{ outfits.length }} 套搭配</p>
      </div>
      <button
        class="btn-secondary flex items-center gap-1.5"
        @click="showFilters = !showFilters"
      >
        <Filter class="w-4 h-4" />
        筛选
      </button>
    </div>

    <div class="space-y-3 mb-4">
      <div class="relative">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索搭配名称..."
          class="input-field pl-10"
        />
      </div>

      <Transition name="collapse">
        <div v-if="showFilters" class="space-y-3 animate-fade-in">
          <div>
            <p class="text-xs font-medium text-ink-500 mb-2 uppercase tracking-wider">搭配风格</p>
            <div class="flex flex-wrap gap-2">
              <button
                :class="[
                  'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                  filterStyle === 'all'
                    ? 'bg-burgundy-500 text-white border-burgundy-500'
                    : 'bg-white text-ink-700 border-cream-300 hover:border-burgundy-300',
                ]"
                @click="filterStyle = 'all'"
              >全部</button>
              <button
                v-for="(label, key) in STYLE_LABELS"
                :key="key"
                :class="[
                  'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                  filterStyle === key
                    ? 'bg-burgundy-500 text-white border-burgundy-500'
                    : 'bg-white text-ink-700 border-cream-300 hover:border-burgundy-300',
                ]"
                @click="filterStyle = key as StyleType"
              >{{ label }}</button>
            </div>
          </div>
          <div>
            <p class="text-xs font-medium text-ink-500 mb-2 uppercase tracking-wider">适用场合</p>
            <div class="flex flex-wrap gap-2">
              <button
                :class="[
                  'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                  filterOccasion === 'all'
                    ? 'bg-sage-500 text-white border-sage-500'
                    : 'bg-white text-ink-700 border-cream-300 hover:border-sage-300',
                ]"
                @click="filterOccasion = 'all'"
              >全部</button>
              <button
                v-for="(label, key) in OCCASION_LABELS"
                :key="key"
                :class="[
                  'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                  filterOccasion === key
                    ? 'bg-sage-500 text-white border-sage-500'
                    : 'bg-white text-ink-700 border-cream-300 hover:border-sage-300',
                ]"
                @click="filterOccasion = key as Occasion"
              >{{ label }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <div class="flex-1 overflow-y-auto scrollbar-thin pr-1 -mr-1">
      <div v-if="isEmpty" class="flex flex-col items-center justify-center h-full text-center py-12">
        <div class="text-5xl mb-4">✨</div>
        <p class="text-ink-700 font-medium mb-1">暂无收藏的搭配</p>
        <p class="text-sm text-ink-500">在搭配画布中组合单品后点击「收藏搭配」</p>
      </div>

      <div v-else class="grid grid-cols-2 gap-3 pb-4">
        <OutfitCard
          v-for="outfit in filteredOutfits"
          :key="outfit.id"
          :outfit="outfit"
          :items="getOutfitItems(outfit)"
          @delete="deleteOutfit"
          @load="handleLoad"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.collapse-enter-active, .collapse-leave-active { transition: all 0.3s ease; overflow: hidden; }
.collapse-enter-from, .collapse-leave-to { opacity: 0; max-height: 0; margin-top: 0; margin-bottom: 0; }
.collapse-enter-to, .collapse-leave-from { max-height: 300px; }
</style>
