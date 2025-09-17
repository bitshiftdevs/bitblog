<!-- apps/web/pages/search.vue -->
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Search Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Search Results
      </h1>
      <div class="flex items-center space-x-4">
        <UInput
          v-model="searchQuery"
          placeholder="Search posts..."
          icon="i-lucide-magnifying-glass"
          size="lg"
          class="flex-1 max-w-md"
          @keyup.enter="performSearch"
        />
        <UButton @click="performSearch" size="lg"> Search </UButton>
      </div>

      <p v-if="searchQuery" class="mt-4 text-gray-600 dark:text-gray-400">
        {{ totalResults }} results for "{{ searchQuery }}"
      </p>
    </div>

    <!-- Search Results -->
    <div
      v-if="pending"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      <PostCardSkeleton v-for="i in 6" :key="i" />
    </div>

    <div v-else-if="searchResults?.length" class="space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <PostCard
          v-for="post in searchResults"
          :key="post.id"
          :post="post"
          :show-excerpt="true"
        />
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="flex justify-center">
        <UPagination
          v-model="currentPage"
          :page-count="pagination.totalPages"
          :total="pagination.total"
        />
      </div>
    </div>

    <div v-else-if="searchQuery" class="text-center py-12">
      <UIcon
        name="i-lucide-magnifying-glass"
        class="h-12 w-12 text-gray-400 mx-auto mb-4"
      />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No results found
      </h3>
      <p class="text-gray-500 dark:text-gray-400">
        Try different keywords or check your spelling.
      </p>
    </div>

    <div v-else class="text-center py-12">
      <UIcon
        name="i-lucide-magnifying-glass"
        class="h-12 w-12 text-gray-400 mx-auto mb-4"
      />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Search our blog
      </h3>
      <p class="text-gray-500 dark:text-gray-400">
        Enter keywords to find relevant posts.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();

const searchQuery = ref((route.query.q as string) || '');
const currentPage = ref(1);

// SEO
useSeoMeta({
  title: computed(() =>
    searchQuery.value ? `Search results for "${searchQuery.value}"` : 'Search',
  ),
  description: 'Search our blog for articles and insights',
});

// Fetch search results
const { data: searchData, pending } = await useFetch('/api/search', {
  query: computed(() => ({
    q: searchQuery.value,
    page: currentPage.value,
    limit: 12,
    type: 'posts',
  })),
  server: false,
});

const searchResults = computed(() => searchData.value?.data?.items || []);
const pagination = computed(() => searchData.value?.data?.pagination || {});
const totalResults = computed(() => pagination.value.total || 0);

const performSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ query: { q: searchQuery.value } });
    currentPage.value = 1;
  }
};

// Watch for query parameter changes
watch(
  () => route.query.q,
  (newQuery) => {
    searchQuery.value = (newQuery as string) || '';
  },
);

// Reset page when search query changes
watch(searchQuery, () => {
  currentPage.value = 1;
});
</script>
