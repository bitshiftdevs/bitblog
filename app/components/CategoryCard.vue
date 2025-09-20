<!-- apps/web/components/CategoryCard.vue -->
<template>
  <NuxtLink
    :to="`/categories/${category.id}`"
    class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 hover:shadow-md group"
  >
    <div class="flex items-center justify-between mb-3">
      <h3
        class="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
      >
        {{ category.name }}
      </h3>
      <UIcon
        name="i-lucide-folder-open"
        class="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors"
      />
    </div>

    <p
      v-if="category.description"
      class="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2"
    >
      {{ category.description }}
    </p>

    <div
      class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400"
    >
      <span>{{ category._count?.posts || 0 }} posts</span>
      <UIcon
        name="i-lucide-arrow-right"
        class="h-4 w-4 group-hover:translate-x-1 transition-transform"
      />
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Category } from '~~/shared/types';

interface Props {
  category: Category;
}

defineProps<Props>();
</script>
