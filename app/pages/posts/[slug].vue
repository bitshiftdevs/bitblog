<script setup lang="ts">
const route = useRoute();

const slug = route.params.slug as string;

// Fetch post (non-blocking)
const { data: postData, pending: postLoading } = useLazyFetch(`/api/posts/${slug}`, {
  key: `post-${slug}`,
});
const post = computed(() => postData.value?.data);

// SEO
useSeoMeta({
  title: computed(() => post.value?.seoTitle || post.value?.title),
  description: computed(() => post.value?.seoDescription || post.value?.excerpt),
  ogTitle: computed(() => post.value?.title),
  ogDescription: computed(() => post.value?.excerpt),
  ogImage: computed(() => post.value?.featuredImage),
  ogType: 'article',
  articleAuthor: computed(() => post.value?.coAuthors.concat(post.value.author || []).map((au) => au.name)),
  author: computed(() => post.value?.author?.name),
  articlePublishedTime: computed(() => post.value?.publishedAt),
  articleModifiedTime: computed(() => post.value?.updatedAt),
});
</script>
<template>
  <div v-if="postLoading" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="animate-pulse space-y-8">
      <div class="h-12 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
      <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
      <div class="h-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
      <div class="space-y-4">
        <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
        <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/5"></div>
      </div>
    </div>
  </div>

  <PostView v-else-if="post" :post />

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
