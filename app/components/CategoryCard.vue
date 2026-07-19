<!-- apps/web/components/CategoryCard.vue -->
<template>
  <NuxtLink
    :to="`/categories/${category.id}`"
    class="block bg-default p-6 border border-default/20 rounded-2xl group hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden"
  >
    <div class="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors duration-500"></div>
    <div class="flex items-center justify-between mb-4 relative z-10">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
          <UIcon
            name="i-lucide-folder-open"
            class="h-5 w-5"
          />
        </div>
        <h3
          class="text-lg font-bold text-highlighted group-hover:text-primary transition-colors"
        >
          {{ category.name }}
        </h3>
      </div>
    </div>

    <p
      v-if="category.description"
      class="text-sm text-muted mb-6 line-clamp-2 leading-relaxed relative z-10 font-medium"
    >
      {{ category.description }}
    </p>
    <p v-else class="text-sm text-muted/50 mb-6 italic relative z-10">No description provided.</p>

    <div
      class="flex items-center justify-between text-sm font-semibold text-muted relative z-10"
    >
      <span class="flex items-center gap-2 bg-muted/10 px-3 py-1 rounded-md">
        <UIcon name="i-lucide-file-text" class="w-4 h-4" />
        {{ category._count?.posts || 0 }} posts
      </span>
      <UIcon
        name="i-lucide-arrow-right"
        class="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"
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
