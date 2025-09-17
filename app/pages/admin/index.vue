<!-- apps/web/pages/admin/index.vue -->
<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
        Dashboard
      </h1>
      <div class="flex items-center space-x-3">
        <UButton to="/admin/posts/new" icon="i-lucide-plus" size="sm">
          New Post
        </UButton>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Posts"
        :value="stats.posts?.total || 0"
        icon="i-lucide-document-text"
        color="blue"
      />
      <StatCard
        title="Published"
        :value="stats.posts?.published || 0"
        icon="i-lucide-eye"
        color="green"
      />
      <StatCard
        title="Drafts"
        :value="stats.posts?.draft || 0"
        icon="i-lucide-pencil"
        color="yellow"
      />
      <StatCard
        title="Comments"
        :value="stats.comments?.total || 0"
        icon="i-lucide-chat-bubble-left"
        color="purple"
        :badge="
          stats.comments?.pending > 0 ? stats.comments.pending : undefined
        "
      />
    </div>

    <!-- Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Posts -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-medium">Recent Posts</h2>
            <UButton to="/admin/posts" variant="ghost" size="sm">
              View all
            </UButton>
          </div>
        </template>

        <div class="space-y-4">
          <div
            v-for="post in recentPosts"
            :key="post.id"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div class="flex-1 min-w-0">
              <h3
                class="text-sm font-medium text-gray-900 dark:text-white truncate"
              >
                {{ post.title }}
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatDate(post.updatedAt) }}
              </p>
            </div>
            <UBadge
              :label="post.status"
              :color="getStatusColor(post.status)"
              variant="soft"
              size="xs"
            />
          </div>

          <div v-if="!recentPosts?.length" class="text-center py-6">
            <p class="text-gray-500 dark:text-gray-400">No posts yet</p>
          </div>
        </div>
      </UCard>

      <!-- Pending Comments -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-medium">Pending Comments</h2>
            <UButton to="/admin/comments" variant="ghost" size="sm">
              View all
            </UButton>
          </div>
        </template>

        <div class="space-y-4">
          <div
            v-for="comment in pendingComments"
            :key="comment.id"
            class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div class="flex items-start justify-between mb-2">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                {{ comment.author?.name || comment.guestName }}
              </h3>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatDate(comment.createdAt) }}
              </span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {{ stripHtml(comment.content) }}
            </p>
          </div>

          <div v-if="!pendingComments?.length" class="text-center py-6">
            <p class="text-gray-500 dark:text-gray-400">No pending comments</p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Quick Actions -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-medium">Quick Actions</h2>
      </template>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <UButton
          to="/admin/posts/new"
          variant="outline"
          class="justify-center h-20 flex-col"
        >
          <UIcon name="i-lucide-plus" class="h-6 w-6 mb-2" />
          New Post
        </UButton>

        <UButton
          to="/admin/media"
          variant="outline"
          class="justify-center h-20 flex-col"
        >
          <UIcon name="i-lucide-photo" class="h-6 w-6 mb-2" />
          Upload Media
        </UButton>

        <UButton
          to="/admin/users/invite"
          variant="outline"
          class="justify-center h-20 flex-col"
        >
          <UIcon name="i-lucide-user-plus" class="h-6 w-6 mb-2" />
          Invite User
        </UButton>

        <UButton
          to="/admin/settings"
          variant="outline"
          class="justify-center h-20 flex-col"
        >
          <UIcon name="i-lucide-cog-6-tooth" class="h-6 w-6 mb-2" />
          Settings
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
});

// Mock data for now - replace with actual API call
const dashboardData = ref({
  data: {
    stats: {
      posts: {
        total: 25,
        published: 18,
        draft: 5,
        scheduled: 2,
      },
      comments: {
        total: 147,
        pending: 3,
        approved: 144,
      },
    },
    recentPosts: [
      {
        id: '1',
        title: 'Getting Started with TypeScript',
        status: 'PUBLISHED',
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Modern CSS Layout Techniques',
        status: 'DRAFT',
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    pendingComments: [
      {
        id: '1',
        content: 'Great article! Thanks for sharing this.',
        guestName: 'John Doe',
        createdAt: new Date().toISOString(),
      },
    ],
  },
});

const stats = computed(() => dashboardData.value?.data?.stats || {});
const recentPosts = computed(
  () => dashboardData.value?.data?.recentPosts || [],
);
const pendingComments = computed(
  () => dashboardData.value?.data?.pendingComments || [],
);

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

const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

// Set breadcrumbs
const setBreadcrumbs = inject('setBreadcrumbs', () => {});
setBreadcrumbs([{ label: 'Dashboard' }]);
</script>
