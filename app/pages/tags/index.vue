<!-- apps/web/pages/tags/index.vue -->
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

    <div v-else-if="tags?.length" class="space-y-6">
      <!-- Popular tags -->
      <div>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Popular Tags
        </h2>
        <div class="flex flex-wrap gap-3">
          <NuxtLink
            v-for="tag in popularTags"
            :key="tag.id"
            :to="`/tags/${tag.slug}`"
            class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors hover:scale-105"
            :style="{
              backgroundColor: tag.color + '20',
              color: tag.color,
              borderColor: tag.color,
            }"
            :class="'border'"
          >
            {{ tag.name }}
            <span class="ml-2 text-xs opacity-75"
              >({{ tag._count?.posts || 0 }})</span
            >
          </NuxtLink>
        </div>
      </div>

      <!-- All tags -->
      <div>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          All Tags
        </h2>
        <div class="flex flex-wrap gap-2">
          <NuxtLink
            v-for="tag in allTags"
            :key="tag.id"
            :to="`/tags/${tag.slug}`"
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
      </div>
    </div>

    <div v-else class="text-center py-12">
      <UIcon
        name="i-heroicons-tag"
        class="h-12 w-12 text-gray-400 mx-auto mb-4"
      />
      <p class="text-gray-500 dark:text-gray-400">No tags available</p>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Tags',
  description: 'Explore posts by topic and tag',
});

const { data: tagsData, pending } = await useFetch('/api/tags');
const tags = computed(() => tagsData.value?.data?.items || []);

const popularTags = computed(() =>
  tags.value.filter((tag) => (tag._count?.posts || 0) >= 2).slice(0, 10),
);

const allTags = computed(() => tags.value);
</script>
