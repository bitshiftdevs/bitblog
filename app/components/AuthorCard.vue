
<!-- apps/web/components/AuthorCard.vue -->
<template>
  <NuxtLink 
    :to="`/authors/${author.id}`"
    class="text-center group"
  >
    <div class="mb-4">
      <UAvatar 
        :src="author.avatarUrl" 
        :alt="author.name"
        size="lg"
        class="mx-auto group-hover:scale-105 transition-transform"
      />
    </div>
    
    <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
      {{ author.name }}
    </h3>
    
    <p v-if="author.bio" class="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
      {{ author.bio }}
    </p>
    
    <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
      {{ author._count?.posts || 0 }} posts
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { User } from '@blog-platform/shared/types'

interface Props {
  author: User & { _count?: { posts: number } }
}

defineProps<Props>()
</script>


