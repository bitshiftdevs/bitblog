<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
          Posts
        </h1>
        <p class="text-gray-600 dark:text-gray-400">Manage your blog posts</p>
      </div>
      <UButton to="/admin/posts/new" icon="i-lucide-plus" size="lg">
        New Post
      </UButton>
    </div>

    <!-- Filters -->
    <UCard>
      <div class="flex flex-wrap gap-4">
        <USelectMenu
          v-model="selectedStatus"
          :options="statusOptions"
          placeholder="All Statuses"
          class="w-40"
        />

        <USelectMenu
          v-model="selectedAuthor"
          :options="authorOptions"
          placeholder="All Authors"
          class="w-40"
        />

        <UInput
          v-model="searchQuery"
          placeholder="Search posts..."
          icon="i-lucide-search"
          class="flex-1 max-w-md"
        />

        <UButton variant="outline" @click="clearFilters">
          Clear Filters
        </UButton>
      </div>
    </UCard>

    <!-- Posts Table -->
    <UCard>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Title
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Author
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Published
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Views
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700"
          >
            <tr
              v-for="post in filteredPosts"
              :key="post.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img
                      v-if="post.featuredImage"
                      :src="post.featuredImage"
                      :alt="post.title"
                      class="h-10 w-10 rounded-lg object-cover"
                    />
                    <div
                      v-else
                      class="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                    >
                      <UIcon
                        name="i-lucide-file-text"
                        class="h-5 w-5 text-gray-400"
                      />
                    </div>
                  </div>
                  <div class="ml-4">
                    <div
                      class="text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {{ post.title }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ post.excerpt || "No excerpt" }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <UAvatar
                    :src="post.author.avatarUrl"
                    :alt="post.author.name"
                    size="xs"
                  />
                  <span class="ml-2 text-sm text-gray-900 dark:text-white">{{
                    post.author.name
                  }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge
                  :label="post.status"
                  :color="getStatusColor(post.status)"
                  variant="soft"
                />
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
              >
                {{ post.publishedAt ? formatDate(post.publishedAt) : "-" }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
              >
                {{ post.viewCount || 0 }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
              >
                <div class="flex items-center justify-end space-x-2">
                  <UButton
                    :to="`/posts/${post.slug}`"
                    target="_blank"
                    variant="ghost"
                    size="sm"
                    icon="i-lucide-eye"
                    title="View Post"
                  />
                  <UButton
                    :to="`/admin/posts/${post.id}/edit`"
                    variant="ghost"
                    size="sm"
                    icon="i-lucide-square-pen"
                    title="Edit Post"
                  />
                  <UButton
                    variant="ghost"
                    size="sm"
                    icon="i-lucide-trash"
                    color="error"
                    @click="deletePost(post)"
                    title="Delete Post"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="!filteredPosts.length" class="text-center py-12">
          <UIcon
            name="i-lucide-file-text"
            class="h-12 w-12 text-gray-400 mx-auto mb-4"
          />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No posts found
          </h3>
          <p class="text-gray-500 dark:text-gray-400 mb-4">
            {{
              searchQuery || selectedStatus || selectedAuthor
                ? "Try adjusting your filters"
                : "Get started by creating your first post"
            }}
          </p>
          <UButton
            v-if="!searchQuery && !selectedStatus && !selectedAuthor"
            to="/admin/posts/new"
          >
            Create your first post
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
});

// Reactive state
const selectedStatus = ref(null);
const selectedAuthor = ref(null);
const searchQuery = ref('');

// Mock data - replace with actual API calls
const posts = ref([
  {
    id: '1',
    title: 'Getting Started with TypeScript',
    slug: 'getting-started-with-typescript',
    excerpt:
      'Learn the basics of TypeScript and how it can improve your development workflow.',
    status: 'PUBLISHED',
    publishedAt: '2024-01-15T10:00:00Z',
    viewCount: 1250,
    featuredImage: null,
    author: {
      name: 'John Smith',
      avatarUrl: null,
    },
  },
  {
    id: '2',
    title: 'Modern CSS Layout Techniques',
    slug: 'modern-css-layout-techniques',
    excerpt:
      'Explore modern CSS layout methods including Grid, Flexbox, and Container Queries.',
    status: 'DRAFT',
    publishedAt: null,
    viewCount: 0,
    featuredImage: null,
    author: {
      name: 'Sarah Johnson',
      avatarUrl: null,
    },
  },
  {
    id: '3',
    title: 'Building Scalable React Applications',
    slug: 'building-scalable-react-applications',
    excerpt: 'Best practices for structuring and scaling React applications.',
    status: 'SCHEDULED',
    publishedAt: '2024-02-01T09:00:00Z',
    viewCount: 0,
    featuredImage: null,
    author: {
      name: 'Mike Chen',
      avatarUrl: null,
    },
  },
]);

// Filter options
const statusOptions = [
  { label: 'All Statuses', value: null },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'Archived', value: 'ARCHIVED' },
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
    const matchesStatus =
      !selectedStatus.value || post.status === selectedStatus.value;
    const matchesAuthor =
      !selectedAuthor.value || post.author.name === selectedAuthor.value;
    const matchesSearch =
      !searchQuery.value ||
      post.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.value.toLowerCase());

    return matchesStatus && matchesAuthor && matchesSearch;
  });
});

// Helper functions
const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PUBLISHED':
      return 'green';
    case 'DRAFT':
      return 'yellow';
    case 'SCHEDULED':
      return 'blue';
    case 'ARCHIVED':
      return 'gray';
    default:
      return 'gray';
  }
};

const clearFilters = () => {
  selectedStatus.value = null;
  selectedAuthor.value = null;
  searchQuery.value = '';
};

const deletePost = async (post: any) => {
  // Show confirmation dialog and delete post
  const confirmed = confirm(`Are you sure you want to delete "${post.title}"?`);
  if (confirmed) {
    // TODO: Implement delete API call
    posts.value = posts.value.filter((p) => p.id !== post.id);
  }
};

// Set breadcrumbs
const setBreadcrumbs = inject('setBreadcrumbs', () => {});
setBreadcrumbs([{ label: 'Dashboard', to: '/admin' }, { label: 'Posts' }]);
</script>
