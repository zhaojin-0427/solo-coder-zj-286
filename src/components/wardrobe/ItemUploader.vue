<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Category } from '@/types'
import { CATEGORY_LABELS } from '@/types'
import { Plus, X, Upload } from 'lucide-vue-next'
import { extractColors } from '@/utils/colorExtractor'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [data: { file: File; name: string; category: Category; colors: string[] }]
}>()

const file = ref<File | null>(null)
const preview = ref('')
const name = ref('')
const category = ref<Category>('top')
const extractedColors = ref<string[]>([])
const extracting = ref(false)

watch(
  () => props.show,
  (v) => {
    if (!v) {
      file.value = null
      preview.value = ''
      name.value = ''
      category.value = 'top'
      extractedColors.value = []
    }
  },
)

function handleFile(e: Event) {
  const target = e.target as HTMLInputElement
  const f = target.files?.[0]
  if (!f) return
  file.value = f
  name.value = f.name.replace(/\.[^.]+$/, '')
  const reader = new FileReader()
  reader.onload = async () => {
    preview.value = reader.result as string
    extracting.value = true
    try {
      extractedColors.value = await extractColors(preview.value, 4)
    } catch {
      extractedColors.value = ['#888888']
    } finally {
      extracting.value = false
    }
  }
  reader.readAsDataURL(f)
}

function handleSubmit() {
  if (!file.value) return
  emit('submit', {
    file: file.value,
    name: name.value,
    category: category.value,
    colors: extractedColors.value,
  })
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
        <div class="bg-white rounded-2xl shadow-card w-full max-w-md animate-scale-in">
          <div class="flex items-center justify-between px-6 py-4 border-b border-cream-200">
            <h3 class="font-display text-xl font-semibold text-ink-900">添加单品</h3>
            <button class="btn-ghost !p-1.5" @click="emit('close')">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-ink-700 mb-2">单品照片</label>
              <div
                v-if="!preview"
                class="border-2 border-dashed border-cream-300 rounded-xl p-8 text-center
                       hover:border-burgundy-500 hover:bg-burgundy-50/30 transition-all cursor-pointer"
              >
                <input type="file" accept="image/*" class="hidden" id="file-input" @change="handleFile" />
                <label for="file-input" class="cursor-pointer block">
                  <Upload class="w-10 h-10 mx-auto text-ink-300 mb-2" />
                  <p class="text-sm text-ink-500">点击或拖拽上传照片</p>
                  <p class="text-xs text-ink-300 mt-1">支持 JPG、PNG、WEBP 格式</p>
                </label>
              </div>
              <div v-else class="relative">
                <img :src="preview" class="w-full h-48 object-cover rounded-xl" />
                <button
                  class="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center"
                  @click="preview = ''; file = null"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-ink-700 mb-2">单品名称</label>
              <input v-model="name" type="text" class="input-field" placeholder="如：米白针织毛衣" />
            </div>

            <div>
              <label class="block text-sm font-medium text-ink-700 mb-2">分类</label>
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="(label, key) in CATEGORY_LABELS"
                  :key="key"
                  :class="[
                    'py-2 px-3 rounded-lg text-sm font-medium border transition-all',
                    category === key
                      ? 'bg-burgundy-500 text-white border-burgundy-500'
                      : 'bg-white text-ink-700 border-cream-300 hover:border-burgundy-300',
                  ]"
                  @click="category = key as Category"
                >{{ label }}</button>
              </div>
            </div>

            <div v-if="extractedColors.length > 0">
              <label class="block text-sm font-medium text-ink-700 mb-2">
                {{ extracting ? '正在提取颜色...' : '提取的主色调' }}
              </label>
              <div class="flex gap-2 items-center">
                <span
                  v-for="(c, i) in extractedColors"
                  :key="i"
                  class="w-10 h-10 rounded-lg border-2 border-white shadow-soft"
                  :style="{ backgroundColor: c }"
                  :title="c"
                ></span>
              </div>
            </div>
          </div>

          <div class="flex gap-3 px-6 py-4 border-t border-cream-200">
            <button class="btn-secondary flex-1" @click="emit('close')">取消</button>
            <button class="btn-primary flex-1" :disabled="!file || extracting" @click="handleSubmit">
              <span class="flex items-center justify-center gap-2">
                <Plus class="w-4 h-4" />加入衣橱
              </span>
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
