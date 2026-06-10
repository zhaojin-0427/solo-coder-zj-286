<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Search } from 'lucide-vue-next'
import CategoryTabs from './CategoryTabs.vue'
import ItemCard from './ItemCard.vue'
import ItemUploader from './ItemUploader.vue'
import { useWardrobe } from '@/composables/useWardrobe'
import type { WardrobeItem } from '@/types'

const emit = defineEmits<{
  dragItem: [item: WardrobeItem]
}>()

const {
  activeCategory,
  searchQuery,
  filteredItems,
  addItem,
  removeItem,
} = useWardrobe()

const showUploader = ref(false)

const isEmpty = computed(() => filteredItems.value.length === 0)

async function handleSubmit(data: { file: File; name: string; category: any }) {
  await addItem(data.file, data.name, data.category)
  showUploader.value = false
}

function handleDragStart(item: WardrobeItem) {
  emit('dragItem', item)
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="font-display text-2xl font-semibold text-ink-900">单品衣橱</h2>
        <p class="text-sm text-ink-500 mt-0.5">共 {{ filteredItems.length }} 件单品</p>
      </div>
      <button class="btn-primary flex items-center gap-1.5" @click="showUploader = true">
        <Plus class="w-4 h-4" />添加
      </button>
    </div>

    <div class="space-y-3 mb-4">
      <div class="relative">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索单品..."
          class="input-field pl-10"
        />
      </div>
      <CategoryTabs v-model="activeCategory" />
    </div>

    <div class="flex-1 overflow-y-auto scrollbar-thin pr-1 -mr-1">
      <div v-if="isEmpty" class="flex flex-col items-center justify-center h-full text-center py-12">
        <div class="text-5xl mb-4">🧥</div>
        <p class="text-ink-700 font-medium mb-1">衣橱空空如也</p>
        <p class="text-sm text-ink-500 mb-4">上传你的第一件单品开始搭配</p>
        <button class="btn-secondary" @click="showUploader = true">上传单品</button>
      </div>

      <div v-else class="grid grid-cols-2 gap-3 pb-4">
        <ItemCard
          v-for="item in filteredItems"
          :key="item.id"
          :item="item"
          :draggable="true"
          @remove="removeItem"
          @drag-start="handleDragStart"
        />
      </div>
    </div>

    <ItemUploader
      :show="showUploader"
      @close="showUploader = false"
      @submit="handleSubmit"
    />
  </div>
</template>
