<template>
  <article
    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
  >
    <!-- Featured Image -->
    <div class="aspect-video overflow-hidden">
      <NuxtLink :to="`/posts/${post.slug}`">
        <img
          :src="post.featuredImage || '/favicon.ico'"
          :alt="post.title"
          class="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
        />
      </NuxtLink>
    </div>

    <!-- Content -->
    <div class="p-6">
      <!-- Categories -->
      <div v-if="post.categories?.length" class="mb-3">
        <UBadge
          v-for="category in post.categories.slice(0, 2)"
          :key="category.id"
          :label="category.category.name"
          variant="soft"
          size="sm"
          class="mr-2"
        />
      </div>

      <!-- Title -->
      <h2
        class="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2"
      >
        <NuxtLink
          :to="`/posts/${post.slug}`"
          class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          {{ post.title }}
        </NuxtLink>
      </h2>

      <!-- Excerpt -->
      <p
        v-if="showExcerpt && post.excerpt"
        class="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3"
      >
        {{ post.excerpt }}
      </p>

      <!-- Tags -->
      <div v-if="post.tags?.length" class="mb-4">
        <UBadge
          v-for="tag in post.tags.slice(0, 3)"
          :key="tag.id"
          :label="tag.tag.name"
          variant="outline"
          size="sm"
          :style="{ borderColor: tag.tag.color, color: tag.tag.color }"
          class="mr-2 mb-1"
        />
      </div>

      <!-- Meta Information -->
      <div
        class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400"
      >
        <!-- Author and Date -->
        <div class="flex items-center space-x-3">
          <div class="flex items-center space-x-2">
            <UAvatar
              :src="post.author.avatarUrl"
              :alt="post.author.name"
              size="xs"
            />
            <span>{{ post.author.name }}</span>
          </div>

          <span>•</span>

          <time :datetime="post.publishedAt || post.createdAt">
            {{ formatDate(post.publishedAt || post.createdAt) }}
          </time>
        </div>

        <!-- Reading Stats -->
        <div class="flex items-center space-x-3">
          <span v-if="post.readingTime" class="flex items-center">
            <UIcon name="i-lucide-clock" class="h-4 w-4 mr-1" />
            {{ post.readingTime }} min
          </span>

          <span class="flex items-center">
            <UIcon name="i-lucide-eye" class="h-4 w-4 mr-1" />
            {{ formatNumber(post.viewCount) }}
          </span>

          <span v-if="post._count?.comments" class="flex items-center">
            <UIcon name="i-lucide-chat-bubble-left" class="h-4 w-4 mr-1" />
            {{ post._count.comments }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

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
