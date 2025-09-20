<script setup lang="ts">
const route = useRoute();
const id = route.params.id as string;
const currentPage = ref(1);

// Fetch category
const { data: categoryData } = await useFetch(`/api/categories/${id}`);
const category = computed(() => categoryData.value?.data);

// Fetch posts in category
const { data: postsData, pending } = await useFetch('/api/posts', {
  query: computed(() => ({
    categoryId: category.value?.id,
    page: currentPage.value,
    limit: 12,
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
  })),
});

const posts = computed(() => postsData.value?.data?.items || []);
const pagination = computed(() => postsData.value?.data?.pagination || {});

// SEO
useSeoMeta({
  title: computed(() => category.value?.name),
  description: computed(
    () =>
      category.value?.description ||
      `Posts in ${category.value?.name} category`,
  ),
});

if (!category.value) {
  throw createError({ statusCode: 404, statusMessage: 'Category not found' });
}
</script>

<template>
  <div v-if="category" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Category Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        {{ category.name }}
      </h1>
      <p
        v-if="category.description"
        class="text-gray-600 dark:text-gray-400 mb-4"
      >
        {{ category.description }}
      </p>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ category._count?.posts || 0 }} posts in this category
      </p>
    </div>

    <!-- Posts -->
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
        />
      </div>
    </div>

    <div v-else class="text-center py-12">
      <UIcon
        name="i-lucide-file-text"
        class="h-12 w-12 text-gray-400 mx-auto mb-4"
      />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No posts yet
      </h3>
      <p class="text-gray-500 dark:text-gray-400">
        No posts have been published in this category yet.
      </p>
    </div>
  </div>

  <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Category Not Found
      </h1>
      <UButton to="/categories">Back to Categories</UButton>
    </div>
  </div>
</template>
