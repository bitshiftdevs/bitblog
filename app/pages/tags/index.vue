<script setup lang="ts">
const config = useRuntimeConfig();
const siteUrl = config.public.siteUrl || 'https://blog.bitshiftdevs.com';

useSeoMeta({
  title: 'Tags',
  description: 'Explore posts by topic and tag',
  ogUrl: `${siteUrl}/tags`,
});
useHead({ link: [{ rel: 'canonical', href: `${siteUrl}/tags` }] });

const currentPage = ref(1);
const limit = 40;

const { data: tagsData, pending } = useLazyFetch('/api/tags', {
  key: 'tags-list',
  query: computed(() => ({
    page: currentPage.value,
    limit,
  })),
});

const tags = computed(() => tagsData.value?.data?.items || []);
const pagination = computed(
  () =>
    tagsData.value?.data?.pagination || {
      page: 1,
      limit,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
);
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Tags
      </h1>
      <p class="text-gray-600 dark:text-gray-400">Explore posts by topic</p>
    </div>

    <div v-if="pending" class="flex flex-wrap gap-3">
      <div v-for="i in 20" :key="i" class="animate-pulse">
        <div
          class="bg-gray-300 dark:bg-gray-600 rounded-full px-4 py-2 h-8 w-16"
        ></div>
      </div>
    </div>

    <div v-else-if="tags?.length" class="space-y-8">
      <div class="flex flex-wrap gap-2">
        <NuxtLink
          v-for="tag in tags"
          :key="tag.id"
          :to="`/tags/${tag.id}`"
          class="inline-flex items-center px-3 py-1 rounded-full text-sm transition-colors hover:scale-105"
          :style="{
            backgroundColor: tag.color + '15',
            color: tag.color,
            borderColor: tag.color + '40',
          }"
          :class="'border'"
        >
          {{ tag.name }}
          <span class="ml-1 text-xs opacity-75"
            >({{ tag._count?.posts || 0 }})</span
          >
        </NuxtLink>
      </div>

      <div v-if="pagination.totalPages > 1" class="flex justify-center">
        <UPagination
          v-model:page="currentPage"
          :items-per-page="pagination.limit"
          :total="pagination.total"
          show-last
          show-first
        />
      </div>
    </div>

    <div v-else class="text-center py-12">
      <UIcon name="i-lucide-tag" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400">No tags available</p>
    </div>
  </div>
</template>
