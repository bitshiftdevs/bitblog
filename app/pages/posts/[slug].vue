<script setup lang="ts">
const route = useRoute();

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
  articleAuthor: computed(() =>
    post.value?.coAuthors.concat(post.value.author).map((au) => au.name),
  ),
  author: computed(() => post.value?.author.name),
  articlePublishedTime: computed(() => post.value?.publishedAt),
  articleModifiedTime: computed(() => post.value?.updatedAt),
});

// 404 if post not found
if (!post.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Post not found',
  });
}
</script>
<template>
  <PostView v-if="post" :post />

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
