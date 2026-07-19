<script setup lang="ts">
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

// Fetch posts with filters (non-blocking)
const { data: postsData, pending } = useLazyFetch('/api/posts', {
  key: 'posts-list',
  query: computed(() => ({
    page: currentPage.value,
    limit: 12,
    categoryId: selectedCategory.value?.id,
    tagId: selectedTag.value?.id,
    search: searchQuery.value || undefined,
    status: 'published',
    visibility: 'public',
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

// Fetch categories for filter (non-blocking)
const { data: categoriesData } = useLazyFetch('/api/categories', {
  key: 'posts-filter-categories',
});
const categoryOptions = computed(() => [
  { id: null, name: 'All Categories' },
  ...(categoriesData.value?.data?.items || []),
]);

// Fetch tags for filter (non-blocking)
const { data: tagsData } = useLazyFetch('/api/tags', {
  key: 'posts-filter-tags',
});
const tagOptions = computed(() => [{ id: null, name: 'All Tags' }, ...(tagsData.value?.data?.items || [])]);

// Reset page when filters change
watch([selectedCategory, selectedTag, searchQuery], () => {
  currentPage.value = 1;
});
</script>
<template>
  <div class="bg-default min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <!-- Header -->
      <div class="mb-12 text-center max-w-3xl mx-auto">
        <h1 class="text-4xl sm:text-5xl font-extrabold text-highlighted tracking-tight mb-6">
          Explore the Blog
        </h1>
        <p class="text-xl text-muted leading-relaxed">
          Dive into our latest articles, insights, and stories. Find exactly what you're looking for.
        </p>
      </div>

      <!-- Filters -->
      <div class="mb-16 bg-muted/10 p-6 rounded-2xl border border-default/50 shadow-sm backdrop-blur-md flex flex-wrap gap-4 items-center justify-between">
        <div class="flex flex-wrap gap-4 w-full md:w-auto flex-1">
          <USelectMenu
            v-model="selectedCategory"
            :options="categoryOptions"
            placeholder="All Categories"
            class="w-full sm:w-56"
            size="lg"
            variant="outline"
          />

          <USelectMenu
            v-model="selectedTag"
            :options="tagOptions"
            placeholder="All Tags"
            class="w-full sm:w-56"
            size="lg"
            variant="outline"
          />
        </div>

        <div class="w-full md:w-auto flex-1 max-w-md">
          <UInput
            v-model="searchQuery"
            placeholder="Search posts..."
            icon="i-lucide-search"
            size="lg"
            class="w-full"
            :ui="{ icon: { trailing: { pointer: '' } } }"
          >
            <template #trailing>
              <UButton
                v-show="searchQuery !== ''"
                color="gray"
                variant="link"
                icon="i-lucide-x"
                :padded="false"
                @click="searchQuery = ''"
              />
            </template>
          </UInput>
        </div>
      </div>

      <!-- Posts Grid -->
      <div
        v-if="pending"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <PostCardSkeleton v-for="i in 6" :key="i" />
      </div>

      <div v-else-if="posts?.length" class="space-y-16">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <PostCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
            :show-excerpt="true"
            class="hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
          />
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="flex justify-center border-t border-default/50 pt-10">
          <UPagination
            v-model="currentPage"
            :page-count="pagination.totalPages"
            :total="pagination.total"
            show-last
            show-first
            size="lg"
            :ui="{ rounded: 'rounded-xl' }"
          />
        </div>
      </div>

      <div v-else class="text-center py-20 bg-muted/5 rounded-3xl border border-dashed border-default/50 max-w-3xl mx-auto">
        <div class="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <UIcon
            name="i-lucide-search-x"
            class="h-10 w-10 text-primary"
          />
        </div>
        <h3 class="text-2xl font-bold text-highlighted mb-3">
          No posts found
        </h3>
        <p class="text-lg text-muted">
          Try adjusting your filters or search terms to find what you're looking for.
        </p>
        <UButton
          v-if="selectedCategory || selectedTag || searchQuery"
          @click="selectedCategory = null; selectedTag = null; searchQuery = ''"
          variant="soft"
          class="mt-8"
          size="lg"
        >
          Clear all filters
        </UButton>
      </div>
    </div>
  </div>
</template>
