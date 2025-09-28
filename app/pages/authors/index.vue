<script setup lang="ts">
useSeoMeta({
  title: 'Authors',
  description: 'Meet our talented writers and contributors',
});

const { data: authorsData, pending } = useLazyFetch('/api/authors', {
  key: 'authors-list',
});
const authors = computed(() => authorsData.value?.data?.items || []);
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Authors
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Meet our talented writers and contributors
      </p>
    </div>

    <div
      v-if="pending"
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
    >
      <AuthorCardSkeleton v-for="i in 8" :key="i" />
    </div>

    <div
      v-else-if="authors?.length"
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
    >
      <AuthorCard v-for="author in authors" :key="author.id" :author="author" />
    </div>

    <div v-else class="text-center py-12">
      <UIcon
        name="i-lucide-user-cog"
        class="h-12 w-12 text-gray-400 mx-auto mb-4"
      />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No Authors yet
      </h3>
      <p class="text-gray-500 dark:text-gray-400">Might be loading.</p>
    </div>
  </div>
</template>
