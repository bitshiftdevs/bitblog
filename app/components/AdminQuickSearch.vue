<!-- apps/web/components/AdminQuickSearch.vue -->
<template>
  <div class="relative">
    <UInput
      v-model="searchQuery"
      placeholder="Quick search..."
      icon="i-heroicons-magnifying-glass"
      size="sm"
      class="w-64"
      @focus="showResults = true"
      @blur="hideResults"
    />

    <!-- Search results -->
    <div
      v-if="showResults && searchQuery.length > 0"
      class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto"
    >
      <div class="py-2">
        <div v-if="searchResults.length > 0" class="space-y-1">
          <button
            v-for="result in searchResults"
            :key="result.id"
            class="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3"
            @click="navigateToResult(result)"
          >
            <UIcon :name="result.icon" class="h-4 w-4 text-gray-400" />
            <div class="flex-1 min-w-0">
              <p
                class="text-sm font-medium text-gray-900 dark:text-white truncate"
              >
                {{ result.title }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ result.type }}
              </p>
            </div>
          </button>
        </div>

        <div v-else class="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
          No results found
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const searchQuery = ref('');
const showResults = ref(false);
const searchResults = ref<
  Array<{
    id: string;
    title: string;
    type: string;
    icon: string;
    path: string;
  }>
>([]);

// Debounced search
const debouncedSearch = useDebounceFn(async () => {
  if (searchQuery.value.length < 2) {
    searchResults.value = [];
    return;
  }

  try {
    const { data } = await $fetch('/api/admin/search', {
      query: { q: searchQuery.value },
    });
    searchResults.value = data || [];
  } catch (error) {
    console.error('Search failed:', error);
    searchResults.value = [];
  }
}, 300);

watch(searchQuery, debouncedSearch);

const hideResults = () => {
  setTimeout(() => {
    showResults.value = false;
  }, 150);
};

const navigateToResult = (result: (typeof searchResults.value)[0]) => {
  navigateTo(result.path);
  showResults.value = false;
  searchQuery.value = '';
};
</script>
