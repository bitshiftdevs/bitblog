<script setup lang="ts">
import type { HeadingItem } from '@/lib/utils/types'
import type { Editor } from '@tiptap/vue-3'
import { onMounted, onUnmounted, ref, watch } from 'vue'

const {
  editor,
  title,
  levels = [1, 2, 3],
  updateEvent = 'update:toc',
  activeOffset = 100,
} = defineProps<{
  editor: Editor
  title: string
  levels: number[]
  updateEvent: string
  activeOffset: number
}>()

const headings = ref<HeadingItem[]>([])
const activeId = ref<string>('')

// handle toc updates
const handleTocUpdate = (e: CustomEvent) => {
  headings.value = e.detail.headings
}

// Detect active heading on scroll
const handleScroll = () => {
  if (!headings.value.length) return
  // find the heading that's currently in view
  const headingElements = headings.value.map((h) => ({
    id: h.id,
    element: document.getElementById(h.id),
    top: document.getElementById(h.id)?.getBoundingClientRect().top || 0,
  }))

  // get the first heading that's below the offset
  const currentHeading = headingElements
    .filter((h) => h.element && h.top <= activeOffset)
    .sort((a, b) => b.top - a.top)[0]

  activeId.value = currentHeading?.id || ''
}

const scrollToHeading = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeId.value = id
  }
}

watch(
  () => editor,
  (newEditor) => {
    if (newEditor) updateHeadings()
  },
)
const updateHeadings = () => {
  if (!editor) return

  const newHeadings: HeadingItem[] = []
  editor.state.doc.descendants((node, pos, _, idx) => {
    if (node.type.name === 'heading' && levels.includes(node.attrs.level)) {
      // Generate an ID based on text content if none exists
      let id = node.attrs.id

      newHeadings.push({
        id,
        level: node.attrs.level,
        text: node.textContent,
      })
    }
    return true
  })

  headings.value = newHeadings
}

onMounted(() => {
  updateHeadings()
  // listen for toc updates
  window.addEventListener(updateEvent as any, handleTocUpdate as EventListener)

  // listen for scroll events to highlight active section
  window.addEventListener('scroll', handleScroll)
  handleScroll()
  if (editor) editor.on('update', updateHeadings)
})

onUnmounted(() => {
  window.removeEventListener(updateEvent as any, handleTocUpdate as EventListener)
  window.removeEventListener('scroll', handleScroll)
  if (editor) editor.off('update', updateHeadings)
})
</script>

<template>
  <div class="toc-wrapper">
    <div v-if="title" class="text-xl font-bold mb-2">{{ title }}</div>
    <div v-if="headings.length === 0" class="text-sm text-gray-500">No headings found</div>
    <div v-else class="toc-container">
      <ul class="toc-list">
        <template v-for="(heading, index) in headings" :key="index">
          <li
            :class="[
              'toc-item',
              `toc-level-${heading.level}`,
              { 'toc-active': activeId === heading.id },
            ]"
            :style="{ paddingLeft: `${(heading.level - 1) * 1}rem` }"
          >
            <a
              :href="`#${heading.id}`"
              class="toc-link block py-1 px-2 rounded hover:bg-base-200 transition-colors"
              @click.prevent="scrollToHeading(heading.id)"
            >
              {{ heading.text }}
            </a>
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<style>
.toc-wrapper {
  /* border border-base-300 rounded-lg p-4 bg-base-100; */
}

.toc-list {
  /* @apply mt-2; */
}

.toc-item {
  /* @apply text-sm; */
}

.toc-active .toc-link {
  /* @apply font-medium bg-base-200 text-primary; */
}

/* Optional: Different styling for different heading levels */
.toc-level-1 {
  font-size: 20;
}

.toc-level-2 {
  /* @apply text-sm; */
}

.toc-level-3 {
  /* @apply text-xs; */
}
</style>
