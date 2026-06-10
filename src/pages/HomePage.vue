<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Outfit, WardrobeItem, OutfitLayer, Occasion } from '@/types'
import { Palette, LayoutGrid, Heart, Sparkles, GitCompare, CalendarDays } from 'lucide-vue-next'
import WardrobePanel from '@/components/wardrobe/WardrobePanel.vue'
import OutfitCanvas from '@/components/canvas/OutfitCanvas.vue'
import InspirationGallery from '@/components/inspiration/InspirationGallery.vue'
import ComparisonPanel from '@/components/comparison/ComparisonPanel.vue'
import OutfitCalendar from '@/components/calendar/OutfitCalendar.vue'
import { useComparison } from '@/composables/useComparison'
import { useOutfit } from '@/composables/useOutfit'

type Tab = 'studio' | 'inspiration' | 'comparison' | 'calendar'

const { count } = useComparison()
const { loadLayersToCanvas } = useOutfit()

const activeTab = ref<Tab>('studio')
const savedNotification = ref(false)

function handleSaved(_outfit: Outfit) {
  savedNotification.value = true
  setTimeout(() => {
    savedNotification.value = false
  }, 2500)
}

function handleLoadOutfit() {
  activeTab.value = 'studio'
}

function handleLoadCalendarOutfit(layers: OutfitLayer[], occasion: Occasion | '') {
  loadLayersToCanvas(layers, occasion)
  activeTab.value = 'studio'
}

function handleDragItem(_item: WardrobeItem) {
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="sticky top-0 z-40 bg-cream-50/85 backdrop-blur-md border-b border-cream-200/60">
      <div class="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-burgundy-500 to-burgundy-700 flex items-center justify-center shadow-soft">
            <Palette class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="font-display text-2xl font-bold text-ink-900 leading-none tracking-tight">Palette</h1>
            <p class="text-[11px] text-ink-500 tracking-wider mt-0.5">色彩搭配 · 穿搭灵感</p>
          </div>
        </div>

        <nav class="flex items-center gap-1 bg-white/70 rounded-xl p-1 border border-cream-200/60 shadow-soft">
          <button
            :class="[
              'px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200',
              activeTab === 'studio'
                ? 'bg-burgundy-500 text-white shadow-soft'
                : 'text-ink-700 hover:text-burgundy-500 hover:bg-cream-100/60',
            ]"
            @click="activeTab = 'studio'"
          >
            <LayoutGrid class="w-4 h-4" />
            搭配工作台
          </button>
          <button
            :class="[
              'px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200',
              activeTab === 'inspiration'
                ? 'bg-burgundy-500 text-white shadow-soft'
                : 'text-ink-700 hover:text-burgundy-500 hover:bg-cream-100/60',
            ]"
            @click="activeTab = 'inspiration'"
          >
            <Heart class="w-4 h-4" />
            灵感收藏夹
          </button>
          <button
            :class="[
              'px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200',
              activeTab === 'comparison'
                ? 'bg-burgundy-500 text-white shadow-soft'
                : 'text-ink-700 hover:text-burgundy-500 hover:bg-cream-100/60',
            ]"
            @click="activeTab = 'comparison'"
          >
            <GitCompare class="w-4 h-4" />
            对比决策台
            <span
              v-if="count > 0"
              class="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
              :class="activeTab === 'comparison' ? 'bg-white/25 text-white' : 'bg-burgundy-100 text-burgundy-600'"
            >{{ count }}</span>
          </button>
          <button
            :class="[
              'px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200',
              activeTab === 'calendar'
                ? 'bg-burgundy-500 text-white shadow-soft'
                : 'text-ink-700 hover:text-burgundy-500 hover:bg-cream-100/60',
            ]"
            @click="activeTab = 'calendar'"
          >
            <CalendarDays class="w-4 h-4" />
            穿搭日历
          </button>
        </nav>

        <div class="text-xs text-ink-500">
          <span class="hidden sm:inline">数据保存在浏览器本地</span>
        </div>
      </div>
    </header>

    <main class="flex-1 max-w-[1600px] w-full mx-auto px-6 py-6">
      <Transition name="fade" mode="out-in">
        <div v-if="activeTab === 'studio'" key="studio" class="h-[calc(100vh-130px)] grid grid-cols-12 gap-6 animate-fade-in">
          <div class="col-span-3 card p-5 overflow-hidden">
            <WardrobePanel @drag-item="handleDragItem" />
          </div>
          <div class="col-span-9 card p-5 overflow-hidden">
            <OutfitCanvas @saved="handleSaved" />
          </div>
        </div>

        <div v-else-if="activeTab === 'inspiration'" key="inspiration" class="h-[calc(100vh-130px)] card p-5 overflow-hidden animate-fade-in">
          <InspirationGallery @load-outfit="handleLoadOutfit" />
        </div>

        <div v-else-if="activeTab === 'comparison'" key="comparison" class="h-[calc(100vh-130px)] card p-5 overflow-hidden animate-fade-in">
          <ComparisonPanel @load-outfit="handleLoadOutfit" />
        </div>

        <div v-else key="calendar" class="h-[calc(100vh-130px)] card p-5 overflow-hidden animate-fade-in">
          <OutfitCalendar @load-outfit="handleLoadCalendarOutfit" />
        </div>
      </Transition>
    </main>

    <Teleport to="body">
      <Transition name="slide-up">
        <div
          v-if="savedNotification"
          class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-ink-900 text-white px-5 py-3 rounded-xl shadow-card flex items-center gap-2"
        >
          <Sparkles class="w-4 h-4 text-yellow-300" />
          <span class="text-sm font-medium">搭配已收藏到灵感夹</span>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 30px);
}
</style>
