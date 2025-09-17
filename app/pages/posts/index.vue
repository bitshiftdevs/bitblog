<!-- apps/web/pages/posts/index.vue -->
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        All Posts
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Discover our latest articles and insights
      </p>
    </div>

    <!-- Filters -->
    <div class="mb-8 flex flex-wrap gap-4">
      <USelectMenu
        v-model="selectedCategory"
        :options="categoryOptions"
        placeholder="All Categories"
        class="w-48"
      />

      <USelectMenu
        v-model="selectedTag"
        :options="tagOptions"
        placeholder="All Tags"
        class="w-48"
      />

      <UInput
        v-model="searchQuery"
        placeholder="Search posts..."
        icon="i-lucide-magnifying-glass"
        class="flex-1 max-w-md"
      />
    </div>

    <!-- Posts Grid -->
    <div
      v-if="pending"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      <PostCardSkeleton v-for="i in 6" :key="i" />
    </div>

    <div v-else-if="posts?.length" class="space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <PostCard
          v-for="post in posts"
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
          show-last
          show-first
        />
      </div>
    </div>

    <div v-else class="text-center py-12">
      <UIcon
        name="i-lucide-file-text"
        class="h-12 w-12 text-gray-400 mx-auto mb-4"
      />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No posts found
      </h3>
      <p class="text-gray-500 dark:text-gray-400">
        Try adjusting your filters or search terms.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PostSummary } from '@blog-platform/shared/types';

// Meta tags
useSeoMeta({
  title: 'All Posts',
  description: 'Browse all our latest articles and insights',
});

// Reactive filters
const currentPage = ref(1);
const selectedCategory = ref(null);
const selectedTag = ref(null);
const searchQuery = ref('');

// Fetch posts with filters
const { data: postsData, pending } = await useFetch('/api/posts', {
  query: computed(() => ({
    page: currentPage.value,
    limit: 12,
    categoryId: selectedCategory.value?.id,
    tagId: selectedTag.value?.id,
    search: searchQuery.value || undefined,
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
  })),
});

const posts = computed(() => postsData.value?.data?.items || []);
const pagination = computed(
  () =>
    postsData.value?.data?.pagination || {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
);

// Fetch categories for filter
const { data: categoriesData } = await useFetch('/api/categories');
const categoryOptions = computed(() => [
  { id: null, name: 'All Categories' },
  ...(categoriesData.value?.data?.items || []),
]);

// Fetch tags for filter
const { data: tagsData } = await useFetch('/api/tags');
const tagOptions = computed(() => [
  { id: null, name: 'All Tags' },
  ...(tagsData.value?.data?.items || []),
]);

// Reset page when filters change
watch([selectedCategory, selectedTag, searchQuery], () => {
  currentPage.value = 1;
});
</script>
