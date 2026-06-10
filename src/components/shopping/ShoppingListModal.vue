<script setup lang="ts">
import { computed } from 'vue'
import type { WardrobeItem, ShoppingItem, Category } from '@/types'
import { CATEGORY_LABELS } from '@/types'
import { X, Download, ShoppingBag } from 'lucide-vue-next'
import { useOutfit } from '@/composables/useOutfit'
import { getComplementaryColor } from '@/utils/colorTheory'

const props = defineProps<{
  show: boolean
  items: WardrobeItem[]
}>()

const emit = defineEmits<{
  close: []
}>()

const { generateShoppingList } = useOutfit()

const shoppingList = computed<ShoppingItem[]>(() => {
  const baseList = generateShoppingList(props.items)
  if (props.items.length > 0 && baseList.length > 0) {
    const firstItem = props.items[0]
    if (firstItem.colors.length > 0) {
      const compColor = getComplementaryColor(firstItem.colors[0])
      baseList.forEach((item, idx) => {
        if (item.suggestedColor === '#8B2635') {
          baseList[idx] = { ...item, suggestedColor: idx % 2 === 0 ? firstItem.colors[0] : compColor }
        }
      })
    }
  }
  return baseList
})

const existingCategories = computed(() => new Set(props.items.map(i => i.category)))

function exportList() {
  const lines = ['# 穿搭购物清单', '']
  if (shoppingList.value.length > 0) {
    lines.push('## 建议购入')
    shoppingList.value.forEach(item => {
      lines.push(`- [ ] ${CATEGORY_LABELS[item.category as Category]} - 推荐色系: ${item.suggestedColor}`)
      lines.push(`  ${item.reason}`)
    })
    lines.push('')
  }
  if (props.items.length > 0) {
    lines.push('## 已包含单品')
    props.items.forEach(item => {
      lines.push(`- ${CATEGORY_LABELS[item.category as Category]}: ${item.name}`)
    })
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'shopping-list.txt'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm p-4"
        @click.self="emit('close')"
      >
        <div class="bg-white rounded-2xl shadow-card w-full max-w-md animate-scale-in max-h-[85vh] flex flex-col">
          <div class="flex items-center justify-between px-6 py-4 border-b border-cream-200">
            <h3 class="font-display text-xl font-semibold text-ink-900 flex items-center gap-2">
              <ShoppingBag class="w-5 h-5 text-sage-500" />
              购物清单
            </h3>
            <button class="btn-ghost !p-1.5" @click="emit('close')">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
            <div v-if="items.length > 0">
              <p class="text-xs font-medium text-ink-500 uppercase tracking-wider mb-2">当前搭配单品</p>
              <div class="space-y-2">
                <div
                  v-for="item in items"
                  :key="item.id"
                  class="flex items-center gap-3 p-2.5 bg-sage-50/50 rounded-lg border border-sage-100"
                >
                  <img :src="item.image" class="w-10 h-10 rounded object-cover" />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-ink-900 truncate">{{ item.name }}</p>
                    <p class="text-xs text-sage-600">{{ CATEGORY_LABELS[item.category as Category] }}</p>
                  </div>
                  <div class="flex gap-1">
                    <span
                      v-for="c in item.colors.slice(0, 3)"
                      :key="c"
                      class="w-4 h-4 rounded-full border border-white shadow-sm"
                      :style="{ backgroundColor: c }"
                    ></span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="shoppingList.length > 0">
              <p class="text-xs font-medium text-ink-500 uppercase tracking-wider mb-2">建议购入</p>
              <div class="space-y-2">
                <div
                  v-for="item in shoppingList"
                  :key="item.id"
                  class="flex items-start gap-3 p-3 bg-burgundy-50/40 rounded-lg border border-burgundy-100/60"
                >
                  <div
                    class="w-10 h-10 rounded-lg shrink-0 shadow-soft border border-white"
                    :style="{ backgroundColor: item.suggestedColor }"
                  ></div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-ink-900">{{ item.name }}</p>
                    <p class="text-xs text-ink-500 mt-0.5">{{ item.reason }}</p>
                    <p class="text-xs font-mono text-burgundy-500 mt-1">{{ item.suggestedColor.toUpperCase() }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="shoppingList.length === 0" class="text-center py-8">
              <div class="text-4xl mb-3">🎯</div>
              <p class="text-ink-700 font-medium">搭配已完整</p>
              <p class="text-sm text-ink-500 mt-1">这套搭配的主要单品都已包含</p>
            </div>
          </div>

          <div class="flex gap-3 px-6 py-4 border-t border-cream-200">
            <button class="btn-secondary flex-1" @click="emit('close')">关闭</button>
            <button
              class="btn-primary flex-1 flex items-center justify-center gap-2"
              :disabled="shoppingList.length === 0"
              @click="exportList"
            >
              <Download class="w-4 h-4" />
              导出清单
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
