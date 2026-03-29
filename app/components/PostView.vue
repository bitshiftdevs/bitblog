<script setup lang="ts">
import type { PostResponse } from '~~/shared/types';

const { post } = defineProps<{ post: PostResponse }>();
const parsed = await parseMarkdown(post.content);
</script>

<template>
  <!-- Header (full width, outside UPage grid) -->
  <div class="border-b border-default bg-default">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <!-- Categories -->
      <div v-if="post.categories?.length" class="flex flex-wrap gap-2 mb-4">
        <UBadge
          v-for="category in post.categories"
          :key="category.id"
          :label="category.name"
          variant="soft"
        />
      </div>

      <!-- Title -->
      <h1 class="text-4xl font-bold text-highlighted mb-3">
        {{ post.title }}
      </h1>

      <!-- Excerpt -->
      <p v-if="post.excerpt" class="text-xl text-muted mb-6">
        {{ post.excerpt }}
      </p>

      <!-- Author + Meta -->
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <UUser
          :name="post.author?.name"
          :description="formatDate(post.publishedAt)"
          :avatar="{ src: post.author?.avatarUrl, alt: post.author?.name }"
        />

        <div class="flex items-center gap-3 text-sm text-muted">
          <span v-if="post.readingTime" class="flex items-center gap-1">
            <UIcon name="i-lucide-clock" class="size-4" />
            {{ post.readingTime }} min read
          </span>
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-eye" class="size-4" />
            {{ post.viewCount }} views
          </span>
        </div>
      </div>
    </div>
  </div>

  <!-- Featured Image (full width, outside UPage grid) -->
  <div
    v-if="post.featuredImage"
    class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8"
  >
    <NuxtImg
      :src="post.featuredImage"
      :alt="post.title"
      class="w-full aspect-video object-cover rounded-lg"
    />
  </div>

  <!-- Main content + TOC -->
  <UPage>
    <template #right>
      <UContentToc
        v-if="parsed.toc?.links?.length"
        :links="parsed.toc.links"
        highlight
      />
    </template>

    <!-- Article body -->
    <UPageBody prose>
      <MDCRenderer :body="parsed.body" :data="parsed.data ?? {}" />
    </UPageBody>

    <!-- Tags -->
    <div v-if="post.tags?.length" class="mt-8 pt-8 border-t border-default">
      <p class="text-sm font-medium text-highlighted mb-3">Tags</p>
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="tag in post.tags"
          :key="tag.id"
          :label="tag.name"
          variant="outline"
          :style="{ borderColor: tag.color, color: tag.color }"
        />
      </div>
    </div>

    <!-- Author Bio -->
    <div v-if="post.author?.bio" class="mt-8 pt-8 border-t border-default">
      <UUser
        :name="post.author.name"
        :description="post.author.bio"
        :avatar="{ src: post.author.avatarUrl, alt: post.author.name }"
        size="lg"
        :ui="{ description: 'line-clamp-none mt-1' }"
      />
    </div>

    <!-- Comments -->
    <div v-if="post.isLive" class="mt-8 pt-8 border-t border-default">
      <CommentsSection :post-id="post.id" :comments-enabled="true" />
    </div>
  </UPage>

  <!-- Related Posts (full width, outside UPage grid) -->
  <div v-if="post.relatedPosts?.length" class="bg-muted mt-12 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-2xl font-bold text-highlighted mb-8">Related Posts</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <PostCard
          v-for="relatedPost in post.relatedPosts"
          :key="relatedPost.id"
          :post="relatedPost"
          :show-excerpt="false"
        />
      </div>
    </div>
  </div>
</template>
