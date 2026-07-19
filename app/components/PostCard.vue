<script setup lang="ts">
import type { PostSummary } from '~~/shared/types';

interface Props {
  post: PostSummary;
  showExcerpt?: boolean;
}

withDefaults(defineProps<Props>(), {
  showExcerpt: true,
});
</script>
<template>
  <article class="group relative flex flex-col bg-default border border-default/20 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
    <!-- Featured Image -->
    <div class="relative aspect-[16/10] overflow-hidden bg-muted/10">
      <NuxtLink :to="`/posts/${post.slug}`" class="block w-full h-full">
        <img
          :src="post.featuredImage || '/favicon.ico'"
          :alt="post.title"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </NuxtLink>
      
      <!-- Category Badge (Floating) -->
      <div v-if="post.categories?.length" class="absolute top-4 left-4 z-10 flex gap-2">
        <UBadge
          v-for="category in post.categories.slice(0, 1)"
          :key="category.id"
          :label="category.name"
          variant="solid"
          color="primary"
          class="shadow-lg backdrop-blur-md bg-primary/90 font-medium tracking-wide"
        />
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-col flex-1 p-6 sm:p-8">
      <!-- Meta Information Top -->
      <div class="flex items-center gap-3 text-xs text-muted mb-4 font-medium uppercase tracking-wider">
        <time :datetime="post.publishedAt || post.createdAt">
          {{ formatDate(post.publishedAt || post.createdAt) }}
        </time>
        <span class="w-1 h-1 rounded-full bg-default/30"></span>
        <span v-if="post.readingTime" class="flex items-center gap-1.5">
          <UIcon name="i-lucide-clock" class="w-3.5 h-3.5" />
          {{ post.readingTime }} min read
        </span>
      </div>

      <!-- Title -->
      <h2 class="text-2xl font-bold text-highlighted mb-4 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
        <NuxtLink :to="`/posts/${post.slug}`" class="focus:outline-none">
          <span class="absolute inset-0" aria-hidden="true" />
          {{ post.title }}
        </NuxtLink>
      </h2>

      <!-- Excerpt -->
      <p
        v-if="showExcerpt && post.excerpt"
        class="text-muted mb-6 line-clamp-3 leading-relaxed flex-1"
      >
        {{ post.excerpt }}
      </p>

      <!-- Tags -->
      <div v-if="post.tags?.length" class="flex flex-wrap gap-2 mb-6 mt-auto">
        <span
          v-for="tag in post.tags.slice(0, 3)"
          :key="tag.id"
          class="text-xs font-medium px-2.5 py-1 rounded-md bg-muted/10 border border-default/10 text-muted"
          :style="{ color: tag.color }"
        >
          #{{ tag.name }}
        </span>
      </div>

      <!-- Footer Info -->
      <div class="flex items-center justify-between pt-6 border-t border-default/20 mt-auto">
        <!-- Author -->
        <div class="flex items-center gap-3 relative z-20">
          <UAvatar
            :src="post.author.avatarUrl"
            :alt="post.author.name"
            size="sm"
            class="ring-2 ring-primary/20"
          />
          <span class="text-sm font-semibold text-highlighted">{{ post.author.name }}</span>
        </div>

        <!-- Stats -->
        <div class="flex items-center gap-4 text-muted text-sm font-medium">
          <span class="flex items-center gap-1.5 hover:text-primary transition-colors">
            <UIcon name="i-lucide-eye" class="w-4 h-4" />
            {{ formatNumber(post.viewCount) }}
          </span>
          <span v-if="post._count?.comments" class="flex items-center gap-1.5 hover:text-primary transition-colors">
            <UIcon name="i-lucide-message-circle" class="w-4 h-4" />
            {{ post._count.comments }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>
