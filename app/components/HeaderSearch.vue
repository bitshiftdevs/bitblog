<template>
  <div class="relative">
    <UInput
      v-model="searchQuery"
      placeholder="Search posts..."
      icon="i-heroicons-magnifying-glass"
      size="sm"
      class="w-full sm:w-64"
      @keyup.enter="performSearch"
      @input="handleInput"
    />

    <!-- Search suggestions dropdown -->
    <div 
      v-if="showSuggestions && suggestions.length > 0"
      class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto"
    >
      <div class="py-2">
        <!-- Quick results -->
        <div v-if="quickResults.length > 0" class="px-3 py-2">
          <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Posts
          </h4>
          <div class="space-y-1">
            <NuxtLink
              v-for="post in quickResults.slice(0, 3)"
              :key="post.id"
              :to="`/posts/${post.slug}`"
              class="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              @click="closeSuggestions"
            >
              <div class="font-medium">{{ post.title }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ post.author.name }}</div>
            </NuxtLink>
          </div>
        </div>

        <!-- Search suggestions -->
        <div v-if="searchSuggestions.length > 0" class="border-t border-gray-200 dark:border-gray-700 px-3 py-2">
          <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Suggestions
          </h4>
          <div class="space-y-1">
            <button
              v-for="suggestion in searchSuggestions.slice(0, 5)"
              :key="suggestion"
              class="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              @click="selectSuggestion(suggestion)"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>

        <!-- View all results -->
        <div class="border-t border-gray-200 dark:border-gray-700 px-3 py-2">
          <NuxtLink
            :to="`/search?q=${encodeURIComponent(searchQuery)}`"
            class="block w-full text-left px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            @click="closeSuggestions"
          >
            View all results for "{{ searchQuery }}"
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Backdrop to close suggestions -->
    <div 
      v-if="showSuggestions"
      class="fixed inset-0 z-40"
      @click="closeSuggestions"
    />
  </div>
</template>

<script setup lang="ts">
import type { PostSummary } from '@blog-platform/shared/types'

const searchQuery = ref('')
const showSuggestions = ref(false)
const quickResults = ref<PostSummary[]>([])
const searchSuggestions = ref<string[]>([])
const searchTimeout = ref<NodeJS.Timeout>()

const suggestions = computed(() => {
  return quickResults.value.length > 0 || searchSuggestions.value.length > 0
})

const handleInput = () => {
  // Clear previous timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  // Don't search for very short queries
  if (searchQuery.value.length < 2) {
    closeSuggestions()
    return
  }

  // Debounce search
  searchTimeout.value = setTimeout(async () => {
    await fetchSuggestions()
  }, 300)
}

const fetchSuggestions = async () => {
  if (!searchQuery.value.trim()) return

  try {
    // Fetch quick post results
    const { data: postsData } = await $fetch<{ data: { items: PostSummary[] } }>('/api/search', {
      query: {
        q: searchQuery.value,
        type: 'posts',
        limit: 5
      }
    })

    quickResults.value = postsData?.items || []

    // Generate search suggestions based on popular searches or tags
    const { data: suggestionsData } = await $fetch<{ data: string[] }>('/api/search/suggestions', {
      query: {
        q: searchQuery.value,
        limit: 5
      }
    }).catch(() => ({ data: [] }))

    searchSuggestions.value = suggestionsData || []

    showSuggestions.value = true
  } catch (error) {
    console.error('Search suggestions failed:', error)
    showSuggestions.value = false
  }
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    navigateTo(`/search?q=${encodeURIComponent(searchQuery.value)}`)
    closeSuggestions()
  }
}

const selectSuggestion = (suggestion: string) => {
  searchQuery.value = suggestion
  performSearch()
}

const closeSuggestions = () => {
  showSuggestions.value = false
}

// Close suggestions when route changes
const route = useRoute()
watch(() => route.path, () => {
  closeSuggestions()
})

// Close suggestions on escape key
onMounted(() => {
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeSuggestions()
    }
  }

  document.addEventListener('keydown', handleEscape)
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value)
    }
  })
})
</script>
