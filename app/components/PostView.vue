<script setup lang="ts">
import type { PostResponse } from '~~/shared/types';

const { post } = defineProps<{ post: PostResponse }>();
const parsed = await parseMarkdown(post.content);
</script>

<template>
  <div class="bg-default pb-16">
    <!-- Hero Section -->
    <div class="relative py-16 lg:py-24 overflow-hidden border-b border-default">
      <div class="absolute inset-0 bg-gradient-to-b from-default to-muted opacity-50"></div>
      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <!-- Categories -->
        <div v-if="post.categories?.length" class="flex flex-wrap justify-center gap-2 mb-6">
          <UBadge
            v-for="category in post.categories"
            :key="category.id"
            :label="category.name"
            size="md"
            variant="subtle"
            class="text-sm font-medium tracking-wide"
          />
        </div>

        <!-- Title -->
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-highlighted tracking-tight leading-tight mb-6">
          {{ post.title }}
        </h1>

        <!-- Excerpt -->
        <p v-if="post.excerpt" class="text-xl sm:text-2xl text-muted font-light max-w-2xl mx-auto mb-8 leading-relaxed">
          {{ post.excerpt }}
        </p>

        <!-- Author + Meta -->
        <div class="flex items-center justify-center gap-6 mt-8 border-t border-default/50 pt-8">
          <UUser
            :name="post.author?.name"
            :description="formatDate(post.publishedAt)"
            :avatar="{ src: post.author?.avatarUrl, alt: post.author?.name }"
            size="lg"
          />

          <div class="h-8 w-px bg-default/50 hidden sm:block"></div>

          <div class="flex items-center gap-4 text-sm text-muted font-medium">
            <span v-if="post.readingTime" class="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
              <UIcon name="i-lucide-clock" class="size-4" />
              {{ post.readingTime }} min read
            </span>
            <span class="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
              <UIcon name="i-lucide-eye" class="size-4" />
              {{ post.viewCount }} views
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Featured Image -->
    <div
      v-if="post.featuredImage"
      class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10"
    >
      <NuxtImg
        :src="post.featuredImage"
        :alt="post.title"
        class="w-full aspect-[21/9] object-cover rounded-2xl shadow-2xl border border-default/20"
      />
    </div>

    <!-- Main content + TOC -->
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
      <UPage>
        <template #right>
          <UContentToc
            v-if="parsed.toc?.links?.length"
            :links="parsed.toc.links"
            highlight
            class="sticky top-24"
          />
        </template>

        <!-- Article body -->
        <UPageBody prose class="prose-lg prose-highlighted max-w-none">
          <MDCRenderer :body="parsed.body" :data="parsed.data ?? {}" />
        </UPageBody>

        <!-- Tags -->
        <div v-if="post.tags?.length" class="mt-12 pt-8 border-t border-default">
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="tag in post.tags"
              :key="tag.id"
              :label="tag.name"
              variant="outline"
              size="sm"
              class="font-medium hover:bg-muted transition-colors cursor-pointer"
              :style="{ borderColor: tag.color, color: tag.color }"
            />
          </div>
        </div>

        <!-- Author Bio -->
        <div v-if="post.author?.bio" class="mt-16 bg-muted/30 p-8 rounded-2xl border border-default/50 flex items-start gap-6">
          <UAvatar
            :src="post.author.avatarUrl"
            :alt="post.author.name"
            size="2xl"
            class="ring-2 ring-primary/20"
          />
          <div>
            <h3 class="text-lg font-bold text-highlighted mb-2">Written by {{ post.author.name }}</h3>
            <p class="text-muted leading-relaxed">{{ post.author.bio }}</p>
          </div>
        </div>

        <!-- Comments -->
        <div v-if="post.isLive" class="mt-16 pt-8 border-t border-default">
          <h3 class="text-2xl font-bold text-highlighted mb-8">Comments</h3>
          <CommentsSection :post-id="post.id" :comments-enabled="true" />
        </div>
      </UPage>
    </div>

    <!-- Related Posts -->
    <div v-if="post.relatedPosts?.length" class="mt-24 pt-16 bg-muted/20 border-t border-default/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 class="text-3xl font-extrabold text-highlighted mb-10 tracking-tight">Read next</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <PostCard
            v-for="relatedPost in post.relatedPosts"
            :key="relatedPost.id"
            :post="relatedPost"
            class="hover:shadow-xl transition-shadow duration-300"
          />
        </div>
      </div>
    </div>
  </div>
</template>
