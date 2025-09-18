<script setup lang="ts">
import type { HeadingItem } from '@/lib/utils/types'
import { onMounted, onUnmounted, ref } from 'vue'

const {
  content,
  title,
  activeOffset = 100,
} = defineProps<{
  content: string
  title: string
  activeOffset: number
}>()

const headings = ref<HeadingItem[]>([])
const activeId = ref<string>('')

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

const updateHeadings = () => {
  const newHeadings: HeadingItem[] = []
  const hmatches = content.matchAll(/<h([123456]).id="(.*?)">(.*?)<\/h[123456]>/g)

  let cmatch = hmatches.next().value
  while (cmatch) {
    newHeadings.push({
      id: cmatch[2],
      level: Number(cmatch[1]),
      text: cmatch[3],
    })
    cmatch = hmatches.next().value
  }

  headings.value = newHeadings
}

onMounted(() => {
  updateHeadings()

  // listen for scroll events to highlight active section
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="toc-wrapper">
    <div v-if="title" class="text-xl font-bold mb-2">{{ title }}</div>
    <div v-if="headings.length === 0" class="text-sm text-gray-500">No headings found</div>
    <div v-else class="toc-container">
      <ul class="toc-list">
        <template v-for="(heading, index) in headings" :key="index">
          <li :class="[
            'toc-item',
            `toc-level-${heading.level}`,
            { 'toc-active': activeId === heading.id },
          ]" :style="{ paddingLeft: `${(heading.level - 1) * 1}rem` }">
            <a :href="`#${heading.id}`" class="toc-link block py-1 px-2 rounded hover:bg-base-200 transition-colors"
              @click.prevent="scrollToHeading(heading.id)">
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
