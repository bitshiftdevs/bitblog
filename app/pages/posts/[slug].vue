<!-- apps/web/pages/posts/[slug].vue -->
<template>
  <div v-if="post">
    <!-- Post Header -->
    <div
      class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
    >
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Categories -->
        <div v-if="post.categories?.length" class="mb-4">
          <UBadge
            v-for="category in post.categories"
            :key="category.id"
            :label="category.category.name"
            variant="soft"
            class="mr-2"
          />
        </div>

        <!-- Title -->
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {{ post.title }}
        </h1>

        <!-- Excerpt -->
        <p
          v-if="post.excerpt"
          class="text-xl text-gray-600 dark:text-gray-300 mb-6"
        >
          {{ post.excerpt }}
        </p>

        <!-- Meta Info -->
        <div
          class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400"
        >
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <UAvatar
                :src="post.author.avatarUrl"
                :alt="post.author.name"
                size="sm"
              />
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ post.author.name }}
                </p>
                <p class="text-xs">{{ formatDate(post.publishedAt) }}</p>
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <span v-if="post.readingTime">{{ post.readingTime }} min read</span>
            <span>{{ post.viewCount }} views</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Featured Image -->
    <div v-if="post.featuredImage" class="aspect-video max-w-4xl mx-auto">
      <img
        :src="post.featuredImage"
        :alt="post.title"
        class="w-full h-full object-cover"
      />
    </div>

    <!-- Post Content -->
    <article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="prose prose-lg dark:prose-invert max-w-none">
        <TipTapRenderer :content="post.content" />
      </div>

      <!-- Tags -->
      <div
        v-if="post.tags?.length"
        class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700"
      >
        <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Tags
        </h3>
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="tag in post.tags"
            :key="tag.id"
            :label="tag.tag.name"
            variant="outline"
            :style="{ borderColor: tag.tag.color, color: tag.tag.color }"
          />
        </div>
      </div>

      <!-- Author Bio -->
      <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-start space-x-4">
          <UAvatar
            :src="post.author.avatarUrl"
            :alt="post.author.name"
            size="lg"
          />
          <div class="flex-1">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ post.author.name }}
            </h3>
            <p
              v-if="post.author.bio"
              class="text-gray-600 dark:text-gray-300 mt-1"
            >
              {{ post.author.bio }}
            </p>
          </div>
        </div>
      </div>
    </article>

    <!-- Related Posts -->
    <div
      v-if="post.relatedPosts?.length"
      class="bg-gray-50 dark:bg-gray-800 py-12"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          Related Posts
        </h2>
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

    <!-- Comments Section -->
    <div
      v-if="commentsEnabled"
      class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <CommentsSection :post-id="post.id" :comments="post.comments" />
    </div>
  </div>

  <div v-else class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Post Not Found
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mb-8">
        The post you're looking for doesn't exist or has been removed.
      </p>
      <UButton to="/posts">Back to Posts</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSiteStore } from '~/stores/site';

const route = useRoute();
const siteStore = useSiteStore();

const slug = route.params.slug as string;

// Fetch post
const { data: postData } = await useFetch(`/api/posts/${slug}`);
const post = computed(() => postData.value?.data);

// SEO
useSeoMeta({
  title: computed(() => post.value?.seoTitle || post.value?.title),
  description: computed(
    () => post.value?.seoDescription || post.value?.excerpt,
  ),
  ogTitle: computed(() => post.value?.title),
  ogDescription: computed(() => post.value?.excerpt),
  ogImage: computed(() => post.value?.featuredImage),
  ogType: 'article',
  articleAuthor: computed(() => post.value?.author.name),
  articlePublishedTime: computed(() => post.value?.publishedAt),
  articleModifiedTime: computed(() => post.value?.updatedAt),
});

// Comments enabled check
const commentsEnabled = computed(() => siteStore.isCommentsEnabled);

// Utility functions
const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
};

// 404 if post not found
if (!post.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Post not found',
  });
}
</script>
