
<!-- apps/web/components/AuthorCard.vue -->
<template>
  <NuxtLink 
    :to="`/authors/${author.id}`"
    class="block bg-default p-8 border border-default/20 rounded-3xl text-center group hover:border-primary/40 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
  >
    <div class="mb-6 relative inline-block">
      <div class="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/40 transition-colors duration-500 scale-150"></div>
      <UAvatar 
        :src="author.avatarUrl" 
        :alt="author.name"
        size="3xl"
        class="mx-auto relative z-10 ring-4 ring-default group-hover:ring-primary/30 transition-all duration-300 shadow-md"
      />
    </div>
    
    <h3 class="text-xl font-bold text-highlighted group-hover:text-primary transition-colors mb-2">
      {{ author.name }}
    </h3>
    
    <p v-if="author.bio" class="text-sm text-muted mt-2 line-clamp-2 leading-relaxed font-medium">
      {{ author.bio }}
    </p>
    
    <div class="mt-6 flex items-center justify-center gap-2">
      <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-muted/10 text-muted text-xs font-bold uppercase tracking-wider rounded-full">
        <UIcon name="i-lucide-pen-tool" class="w-3.5 h-3.5" />
        {{ author._count?.posts || 0 }} posts
      </span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { User } from '~~/shared/types';

interface Props {
  author: User & { _count?: { posts: number } };
}

defineProps<Props>();
</script>


