<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Categories
      </h1>
      <p class="text-gray-600 dark:text-gray-400">Browse posts by category</p>
    </div>

    <div
      v-if="pending"
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      <div v-for="i in 8" :key="i" class="animate-pulse">
        <div class="bg-white dark:bg-gray-700 rounded-lg p-6 h-32"></div>
      </div>
    </div>

    <div
      v-else-if="categories?.length"
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      <CategoryCard
        v-for="category in categories"
        :key="category.id"
        :category="category"
      />
    </div>

    <div v-else class="text-center py-12">
      <UIcon
        name="i-heroicons-folder"
        class="h-12 w-12 text-gray-400 mx-auto mb-4"
      />
      <p class="text-gray-500 dark:text-gray-400">No categories available</p>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Categories',
  description: 'Browse all post categories',
});

const { data: categoriesData, pending } = await useFetch('/api/categories');
const categories = computed(() => categoriesData.value?.data?.items || []);
</script>
