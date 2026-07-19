<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
});

const { data, pending: dashboardLoading } = await useLazyFetch('/api/admin/dashboard', {
  key: 'dashboard-stats',
});

const stats = computed(() => data.value?.data);
const recentPosts = computed(() => data.value?.data?.recentPosts || []);
const pendingComments = computed(() => data.value?.data?.pendingComments || []);

const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

// Set breadcrumbs
const setBreadcrumbs = inject('setBreadcrumbs', () => {});
setBreadcrumbs([{ label: 'Dashboard' }]);
</script>
<template>
  <div class="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-highlighted tracking-tight">
          Dashboard
        </h1>
        <p class="text-muted mt-1">Welcome back, here's what's happening today.</p>
      </div>
      <div class="flex items-center space-x-3">
        <UButton to="/admin/posts/new" icon="i-lucide-plus" size="lg" class="shadow-md hover:shadow-lg transition-shadow">
          New Post
        </UButton>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Posts"
        :value="stats?.posts?.total || 0"
        icon="i-lucide-file-text"
        color="blue"
        class="bg-default border border-default/20 shadow-sm hover:shadow-md transition-shadow rounded-2xl"
      />
      <StatCard
        title="Published"
        :value="stats?.posts?.published || 0"
        icon="i-lucide-check-circle"
        color="success"
        class="bg-default border border-default/20 shadow-sm hover:shadow-md transition-shadow rounded-2xl"
      />
      <StatCard
        title="Drafts"
        :value="stats?.posts?.draft || 0"
        icon="i-lucide-pen-tool"
        color="yellow"
        class="bg-default border border-default/20 shadow-sm hover:shadow-md transition-shadow rounded-2xl"
      />
      <StatCard
        title="Comments"
        :value="stats?.comments?.total || 0"
        icon="i-lucide-message-square"
        color="purple"
        :badge="stats?.comments?.pending! > 0 ? stats?.comments.pending : undefined"
        class="bg-default border border-default/20 shadow-sm hover:shadow-md transition-shadow rounded-2xl"
      />
    </div>

    <!-- Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Recent Posts -->
      <UCard class="bg-default shadow-lg border-default/10 rounded-2xl overflow-hidden ring-1 ring-default/10">
        <template #header>
          <div class="flex items-center justify-between py-2">
            <h2 class="text-xl font-bold text-highlighted">Recent Posts</h2>
            <UButton to="/admin/posts" variant="ghost" size="sm" class="hover:bg-muted/20">
              View all
            </UButton>
          </div>
        </template>

        <div class="space-y-4 p-2">
          <div
            v-for="post in recentPosts"
            :key="post.id"
            class="group flex items-center justify-between p-4 bg-muted/10 hover:bg-muted/20 border border-default/5 rounded-xl transition-colors duration-200 cursor-pointer"
          >
            <div class="flex-1 min-w-0 pr-4">
              <h3 class="text-base font-semibold text-highlighted truncate group-hover:text-primary transition-colors">
                {{ post.title }}
              </h3>
              <div class="flex items-center gap-2 mt-1">
                <UIcon name="i-lucide-clock" class="w-3.5 h-3.5 text-muted" />
                <p class="text-xs text-muted font-medium">
                  {{ formatDate(post.updatedAt) }}
                </p>
              </div>
            </div>
            <UBadge
              :label="post.status"
              :color="getStatusColor(post.status)"
              variant="subtle"
              size="sm"
              class="capitalize font-semibold shadow-sm"
            />
          </div>

          <div v-if="!recentPosts?.length" class="text-center py-10 bg-muted/5 rounded-xl border border-dashed border-default/20">
            <UIcon name="i-lucide-file-text" class="w-10 h-10 text-muted/50 mx-auto mb-3" />
            <p class="text-muted font-medium">No posts yet</p>
          </div>
        </div>
      </UCard>

      <!-- Pending Comments -->
      <UCard class="bg-default shadow-lg border-default/10 rounded-2xl overflow-hidden ring-1 ring-default/10">
        <template #header>
          <div class="flex items-center justify-between py-2">
            <h2 class="text-xl font-bold text-highlighted">Pending Comments</h2>
            <UButton to="/admin/comments" variant="ghost" size="sm" class="hover:bg-muted/20">
              View all
            </UButton>
          </div>
        </template>

        <div class="space-y-4 p-2">
          <div
            v-for="comment in pendingComments"
            :key="comment.id"
            class="p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/30 dark:border-amber-700/30 rounded-xl"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2">
                <UAvatar
                  :alt="comment.author?.name || comment.guestName"
                  size="sm"
                  class="ring-2 ring-background"
                />
                <h3 class="text-sm font-bold text-highlighted">
                  {{ comment.author?.name || comment.guestName }}
                </h3>
              </div>
              <span class="text-xs text-muted font-medium bg-background px-2 py-1 rounded-md shadow-sm">
                {{ formatDate(comment.createdAt) }}
              </span>
            </div>
            <p class="text-sm text-muted line-clamp-2 leading-relaxed pl-10 border-l-2 border-amber-200 dark:border-amber-800 ml-3">
              {{ stripHtml(comment.content) }}
            </p>
          </div>

          <div v-if="!pendingComments?.length" class="text-center py-10 bg-muted/5 rounded-xl border border-dashed border-default/20">
            <UIcon name="i-lucide-message-square-check" class="w-10 h-10 text-muted/50 mx-auto mb-3" />
            <p class="text-muted font-medium">No pending comments</p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Quick Actions -->
    <UCard class="bg-default shadow-lg border-default/10 rounded-2xl overflow-hidden ring-1 ring-default/10">
      <template #header>
        <h2 class="text-xl font-bold text-highlighted py-2">Quick Actions</h2>
      </template>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-2">
        <UButton
          to="/admin/posts/new"
          variant="soft"
          class="justify-center h-28 flex-col gap-3 rounded-xl hover:scale-[1.02] transition-transform bg-primary/10 hover:bg-primary/20"
        >
          <UIcon name="i-lucide-file-pen" class="h-8 w-8 text-primary" />
          <span class="font-semibold">New Post</span>
        </UButton>

        <UButton
          to="/admin/media"
          variant="soft"
          class="justify-center h-28 flex-col gap-3 rounded-xl hover:scale-[1.02] transition-transform bg-blue-500/10 hover:bg-blue-500/20"
        >
          <UIcon name="i-lucide-image" class="h-8 w-8 text-blue-500" />
          <span class="font-semibold text-blue-600 dark:text-blue-400">Upload Media</span>
        </UButton>

        <UButton
          to="/admin/users/invite"
          variant="soft"
          class="justify-center h-28 flex-col gap-3 rounded-xl hover:scale-[1.02] transition-transform bg-emerald-500/10 hover:bg-emerald-500/20"
        >
          <UIcon name="i-lucide-user-plus" class="h-8 w-8 text-emerald-500" />
          <span class="font-semibold text-emerald-600 dark:text-emerald-400">Invite User</span>
        </UButton>

        <UButton
          to="/admin/settings"
          variant="soft"
          class="justify-center h-28 flex-col gap-3 rounded-xl hover:scale-[1.02] transition-transform bg-purple-500/10 hover:bg-purple-500/20"
        >
          <UIcon name="i-lucide-settings" class="h-8 w-8 text-purple-500" />
          <span class="font-semibold text-purple-600 dark:text-purple-400">Settings</span>
        </UButton>
      </div>
    </UCard>
  </div>
</template>
