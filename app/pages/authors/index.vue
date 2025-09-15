<!-- apps/web/pages/authors/index.vue -->
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Authors
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Meet our talented writers and contributors
      </p>
    </div>

    <div
      v-if="pending"
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
    >
      <div v-for="i in 8" :key="i" class="animate-pulse text-center">
        <div
          class="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"
        ></div>
        <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
        <div
          class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mx-auto"
        ></div>
      </div>
    </div>

    <div
      v-else-if="authors?.length"
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
    >
      <AuthorCard v-for="author in authors" :key="author.id" :author="author" />
    </div>

    <div v-else class="text-center py-12">
      <UIcon
        name="i-heroicons-document-text"
        class="h-12 w-12 text-gray-400 mx-auto mb-4"
      />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No posts yet
      </h3>
      <p class="text-gray-500 dark:text-gray-400">
        No posts have been tagged with "{{ tag.name }}" yet.
      </p>
    </div>
  </div>

  <!-- <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> -->
  <!--   <div class="text-center"> -->
  <!--     <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4"> -->
  <!--       Tag Not Found -->
  <!--     </h1> -->
  <!--     <UButton to="/tags">Back to Tags</UButton> -->
  <!--   </div> -->
  <!-- </div> -->
</template>

<script setup lang="ts">
const route = useRoute();
const slug = route.params.slug as string;
const currentPage = ref(1);

// Fetch tag
const { data: tagData } = await useFetch(`/api/tags/${slug}`);
const tag = computed(() => tagData.value?.data);

// Fetch posts with tag
const { data: postsData, pending } = await useFetch('/api/posts', {
  query: computed(() => ({
    tagId: tag.value?.id,
    page: currentPage.value,
    limit: 12,
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
  })),
});

const posts = computed(() => postsData.value?.data?.items || []);
const pagination = computed(() => postsData.value?.data?.pagination || {});

// SEO
useSeoMeta({
  title: computed(() => `Posts tagged "${tag.value?.name}"`),
  description: computed(
    () => tag.value?.description || `Posts tagged with ${tag.value?.name}`,
  ),
});

if (!tag.value) {
  throw createError({ statusCode: 404, statusMessage: 'Tag not found' });
}
</script>
