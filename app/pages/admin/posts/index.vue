<script setup lang="ts">
definePageMeta({
  layout: 'admin',
});

// Reactive state
const selectedStatus = ref(null);
const selectedAuthor = ref(null);
const searchQuery = ref('');

const { data, pending: postsLoading } = useLazyFetch('/api/posts', {
  query: { limit: 12 },
  key: 'admin-posts-list',
});

const posts = computed(() => data.value?.data?.items || []);

// Filter options
const statusOptions = [
  { label: 'All Statuses', value: null },
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'draft' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Archived', value: 'archived' },
];

const authorOptions = computed(() => [
  { label: 'All Authors', value: null },
  ...Array.from(new Set(posts.value.map((p) => p.author.name))).map((name) => ({
    label: name,
    value: name,
  })),
]);

// Filtered posts
const filteredPosts = computed(() => {
  return posts.value.filter((post) => {
    const matchesStatus = !selectedStatus.value || post.status === selectedStatus.value;
    const matchesAuthor = !selectedAuthor.value || post.author.name === selectedAuthor.value;
    const matchesSearch =
      !searchQuery.value ||
      post.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.value.toLowerCase());

    return matchesStatus && matchesAuthor && matchesSearch;
  });
});

const clearFilters = () => {
  selectedStatus.value = null;
  selectedAuthor.value = null;
  searchQuery.value = '';
};

const deletePost = async (post: any) => {
  // Show confirmation dialog and delete post
  confirmAction({
    title: 'Confirm Deletion',
    question: `Are you sure you want to delete "${post.title}"?`,
    onConfirm: () => {
      posts.value = posts.value.filter((p) => p.id !== post.id);
    },
  });
};

// Set breadcrumbs
const setBreadcrumbs = inject('setBreadcrumbs', () => {});
setBreadcrumbs([{ label: 'Dashboard', to: '/admin' }, { label: 'Posts' }]);
</script>
<template>
  <div class="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-highlighted tracking-tight">
          Posts
        </h1>
        <p class="text-muted mt-1">Manage and organize your blog content</p>
      </div>
      <UButton to="/admin/posts/new" icon="i-lucide-plus" size="lg" class="shadow-md hover:shadow-lg transition-shadow">
        New Post
      </UButton>
    </div>

    <!-- Filters -->
    <UCard class="bg-default shadow-sm border-default/10 rounded-2xl ring-1 ring-default/10">
      <div class="flex flex-wrap items-center gap-4">
        <USelectMenu
          v-model="selectedStatus"
          :options="statusOptions"
          placeholder="All Statuses"
          class="w-full sm:w-48"
          size="lg"
        />

        <USelectMenu
          v-model="selectedAuthor"
          :options="authorOptions"
          placeholder="All Authors"
          class="w-full sm:w-48"
          size="lg"
        />

        <UInput
          v-model="searchQuery"
          placeholder="Search posts..."
          icon="i-lucide-search"
          class="flex-1 min-w-[200px]"
          size="lg"
        >
          <template #trailing>
            <UButton
              v-show="searchQuery !== ''"
              color="gray"
              variant="link"
              icon="i-lucide-x"
              :padded="false"
              @click="searchQuery = ''"
            />
          </template>
        </UInput>

        <UButton v-if="selectedStatus || selectedAuthor || searchQuery" variant="soft" size="lg" @click="clearFilters">
          Clear
        </UButton>
      </div>
    </UCard>

    <!-- Posts Table -->
    <UCard class="bg-default shadow-lg border-default/10 rounded-2xl overflow-hidden ring-1 ring-default/10">
      <div v-if="postsLoading" class="p-8">
        <div class="animate-pulse space-y-4">
          <div class="h-12 bg-muted/20 rounded-xl w-full"></div>
          <div class="h-16 bg-muted/20 rounded-xl w-full"></div>
          <div class="h-16 bg-muted/20 rounded-xl w-full"></div>
          <div class="h-16 bg-muted/20 rounded-xl w-full"></div>
        </div>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-muted/10 border-b border-default/20">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">
                Title
              </th>
              <th class="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">
                Author
              </th>
              <th class="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">
                Published
              </th>
              <th class="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">
                Views
              </th>
              <th class="px-6 py-4 text-right text-xs font-bold text-muted uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-default/10">
            <tr
              v-for="post in filteredPosts"
              :key="post.id"
              class="hover:bg-muted/5 transition-colors duration-200 group"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-4">
                  <div class="flex-shrink-0 h-12 w-12 rounded-xl overflow-hidden shadow-sm">
                    <NuxtImg
                      v-if="post.featuredImage"
                      :src="post.featuredImage"
                      :alt="post.title"
                      class="h-full w-full object-cover"
                    />
                    <div
                      v-else
                      class="h-full w-full bg-primary/10 flex items-center justify-center"
                    >
                      <UIcon
                        name="i-lucide-image"
                        class="h-5 w-5 text-primary/50"
                      />
                    </div>
                  </div>
                  <div>
                    <div class="text-sm font-bold text-highlighted group-hover:text-primary transition-colors">
                      {{ post.title }}
                    </div>
                    <div class="text-xs text-muted max-w-[200px] lg:max-w-xs truncate mt-0.5">
                      {{ post.excerpt || "No excerpt" }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <UAvatar
                    :src="post.author.avatarUrl"
                    :alt="post.author.name"
                    size="sm"
                  />
                  <span class="text-sm font-medium text-highlighted">{{ post.author.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge
                  :label="post.status"
                  :color="getStatusColor(post.status)"
                  variant="subtle"
                  class="capitalize font-semibold shadow-sm"
                />
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-muted font-medium">
                {{ post.publishedAt ? formatDate(post.publishedAt) : "-" }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-muted font-medium">
                {{ post.viewCount || 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <UButton
                    :to="`/posts/${post.slug}`"
                    target="_blank"
                    variant="ghost"
                    size="sm"
                    icon="i-lucide-external-link"
                    title="View Post"
                    color="gray"
                  />
                  <UButton
                    :to="`/admin/posts/${post.slug}`"
                    variant="ghost"
                    size="sm"
                    icon="i-lucide-edit-3"
                    title="Edit Post"
                    color="primary"
                  />
                  <UButton
                    variant="ghost"
                    size="sm"
                    icon="i-lucide-trash-2"
                    color="red"
                    @click="deletePost(post)"
                    title="Delete Post"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="!filteredPosts.length" class="text-center py-16 bg-muted/5">
          <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <UIcon
              name="i-lucide-file-x"
              class="h-8 w-8 text-primary"
            />
          </div>
          <h3 class="text-xl font-bold text-highlighted mb-2">
            No posts found
          </h3>
          <p class="text-muted mb-6">
            {{
              searchQuery || selectedStatus || selectedAuthor
                ? "Try adjusting your filters to find what you're looking for."
                : "Get started by creating your very first post!"
            }}
          </p>
          <UButton
            v-if="!searchQuery && !selectedStatus && !selectedAuthor"
            to="/admin/posts/new"
            size="lg"
          >
            Create First Post
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>
