<script setup lang="ts">
const route = useRoute();
const id = route.params.id as string;
const currentPage = ref(1);

// Fetch author
const { data: authorData } = await useFetch(`/api/authors/${id}`);
const author = computed(() => authorData.value?.data);

// Fetch author's posts
const { data: postsData, pending } = await useFetch('/api/posts', {
  query: computed(() => ({
    authorId: id,
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
  title: computed(() => author.value?.name),
  description: computed(
    () => author.value?.bio || `Posts by ${author.value?.name}`,
  ),
});

if (!author.value) {
  throw createError({ statusCode: 404, statusMessage: 'Author not found' });
}
</script>
<template>
  <div v-if="author" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Author Header -->
    <div class="bg-white dark:bg-gray-800 rounded-lg p-8 mb-8 text-center">
      <UAvatar
        :src="author.avatarUrl"
        :alt="author.name"
        size="2xl"
        class="mx-auto mb-4"
      />
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {{ author.name }}
      </h1>
      <p
        v-if="author.bio"
        class="text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto"
      >
        {{ author.bio }}
      </p>
      <div class="text-sm text-gray-500 dark:text-gray-400">
        {{ author._count?.posts || 0 }} posts published
      </div>
    </div>

    <!-- Author's Posts -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Posts by {{ author.name }}
      </h2>

      <div
        v-if="pending"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <PostCardSkeleton v-for="i in 6" :key="i" />
      </div>

      <div v-else-if="posts?.length" class="space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <PostCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
            :show-excerpt="true"
          />
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="flex justify-center">
          <UPagination
            v-model="currentPage"
            :page-count="pagination.totalPages"
            :total="pagination.total"
          />
        </div>
      </div>

      <div v-else class="text-center py-12">
        <UIcon
          name="i-lucide-file-text"
          class="h-12 w-12 text-gray-400 mx-auto mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No posts yet
        </h3>
        <p class="text-gray-500 dark:text-gray-400">
          This author hasn't published any posts yet.
        </p>
      </div>
    </div>
  </div>

  <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Author Not Found
      </h1>
      <UButton to="/authors">Back to Authors</UButton>
    </div>
  </div>
</template>
