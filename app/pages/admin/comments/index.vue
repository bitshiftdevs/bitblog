<script setup lang="ts">
import type { Comment } from '~~/shared/types';

definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
});

const toast = useToast();

// Mock data for comments (replace with actual API)
const comments = ref<Comment[]>([
  {
    id: '1',
    content: 'This is a great article! Really helped me understand the concepts better.',
    status: 'PENDING',
    postId: 'post-1',
    guestName: 'John Doe',
    guestEmail: 'john@example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { replies: 0 }
  },
  {
    id: '2',
    content: 'I have a question about the implementation details mentioned in section 3.',
    status: 'APPROVED',
    postId: 'post-1',
    author: {
      id: 'user-1',
      name: 'Jane Smith',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b172e341?w=150'
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    _count: { replies: 2 }
  },
  {
    id: '3',
    content: 'Spam comment with suspicious links...',
    status: 'REJECTED',
    postId: 'post-2',
    guestName: 'Spammer',
    guestEmail: 'spam@spam.com',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    _count: { replies: 0 }
  }
]);

// Mock posts data
const posts = ref([
  { id: 'post-1', title: 'Getting Started with TypeScript', slug: 'getting-started-typescript' },
  { id: 'post-2', title: 'Modern CSS Layout Techniques', slug: 'modern-css-layout' }
]);

// Filters
const selectedStatus = ref('all');
const searchQuery = ref('');
const selectedPostId = ref('all');

const statusOptions = [
  { label: 'All Comments', value: 'all' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Spam', value: 'SPAM' }
];

const postOptions = computed(() => [
  { label: 'All Posts', value: 'all' },
  ...posts.value.map(post => ({ label: post.title, value: post.id }))
]);

// Filtered comments
const filteredComments = computed(() => {
  let filtered = comments.value;

  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(comment => comment.status === selectedStatus.value);
  }

  if (selectedPostId.value !== 'all') {
    filtered = filtered.filter(comment => comment.postId === selectedPostId.value);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(comment =>
      comment.content.toLowerCase().includes(query) ||
      comment.author?.name.toLowerCase().includes(query) ||
      comment.guestName?.toLowerCase().includes(query)
    );
  }

  return filtered;
});

// Comment actions
const updateCommentStatus = async (commentId: string, newStatus: 'APPROVED' | 'REJECTED' | 'SPAM') => {
  const comment = comments.value.find(c => c.id === commentId);
  if (!comment) return;

  comment.status = newStatus;
  comment.updatedAt = new Date().toISOString();

  toast.add({
    title: 'Success',
    description: `Comment ${newStatus.toLowerCase()} successfully`,
    color: 'success'
  });
};

const deleteComment = async (commentId: string) => {
  const confirmed = confirm('Are you sure you want to delete this comment?');
  if (!confirmed) return;

  const index = comments.value.findIndex(c => c.id === commentId);
  if (index !== -1) {
    comments.value.splice(index, 1);
    toast.add({
      title: 'Success',
      description: 'Comment deleted successfully',
      color: 'success'
    });
  }
};

const bulkApprove = async () => {
  const pendingComments = filteredComments.value.filter(c => c.status === 'PENDING');
  pendingComments.forEach(comment => {
    comment.status = 'APPROVED';
    comment.updatedAt = new Date().toISOString();
  });

  toast.add({
    title: 'Success',
    description: `${pendingComments.length} comments approved`,
    color: 'success'
  });
};

// Status styling
const getStatusColor = (status: string) => {
  switch (status) {
    case 'APPROVED': return 'success';
    case 'PENDING': return 'yellow';
    case 'REJECTED': return 'error';
    case 'SPAM': return 'error';
    default: return 'gray';
  }
};

const stripHtml = (html: string) => {
  return html.replace(/<[^>]*>/g, '');
};

const getPostTitle = (postId: string) => {
  const post = posts.value.find(p => p.id === postId);
  return post?.title || 'Unknown Post';
};

// Set breadcrumbs
const setBreadcrumbs = inject('setBreadcrumbs', () => {});
setBreadcrumbs([
  { label: 'Dashboard', to: '/admin' },
  { label: 'Comments' }
]);
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
          Comments
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Moderate and manage comments on your posts
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <UButton
          @click="bulkApprove"
          :disabled="!filteredComments.some(c => c.status === 'PENDING')"
          color="green"
          variant="outline"
          size="sm"
          icon="i-lucide-check"
        >
          Approve All Pending
        </UButton>
      </div>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UInput
        v-model="searchQuery"
        placeholder="Search comments..."
        icon="i-lucide-search"
      />
      <USelectMenu
        v-model="selectedStatus"
        :options="statusOptions"
        placeholder="Filter by status"
      />
      <USelectMenu
        v-model="selectedPostId"
        :options="postOptions"
        placeholder="Filter by post"
      />
    </div>

    <!-- Comments List -->
    <div class="space-y-4">
      <div
        v-for="comment in filteredComments"
        :key="comment.id"
        class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
      >
        <!-- Comment Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center space-x-3">
            <UAvatar
              :src="comment.author?.avatarUrl"
              :alt="comment.author?.name || comment.guestName"
              size="sm"
            />
            <div>
              <div class="flex items-center space-x-2">
                <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ comment.author?.name || comment.guestName }}
                </h3>
                <UBadge
                  :label="comment.status"
                  :color="getStatusColor(comment.status)"
                  size="xs"
                />
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatDate(comment.createdAt) }}
                {{ comment.guestEmail && ` • ${comment.guestEmail}` }}
              </div>
            </div>
          </div>

          <UDropdownMenu
            :items="[
              [
                {
                  label: 'Approve',
                  icon: 'i-lucide-check',
                  click: () => updateCommentStatus(comment.id, 'APPROVED'),
                  disabled: comment.status === 'APPROVED'
                },
                {
                  label: 'Reject',
                  icon: 'i-lucide-x',
                  click: () => updateCommentStatus(comment.id, 'REJECTED'),
                  disabled: comment.status === 'REJECTED'
                },
                {
                  label: 'Mark as Spam',
                  icon: 'i-lucide-flag',
                  click: () => updateCommentStatus(comment.id, 'SPAM'),
                  disabled: comment.status === 'SPAM'
                }
              ],
              [
                {
                  label: 'Delete',
                  icon: 'i-lucide-trash',
                  click: () => deleteComment(comment.id)
                }
              ]
            ]"
          >
            <UButton
              icon="i-lucide-more-vertical"
              size="xs"
              color="gray"
              variant="ghost"
            />
          </UDropdownMenu>
        </div>

        <!-- Comment Content -->
        <div class="mb-4">
          <p class="text-gray-700 dark:text-gray-300">
            {{ stripHtml(comment.content) }}
          </p>
        </div>

        <!-- Comment Meta -->
        <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span>On: {{ getPostTitle(comment.postId) }}</span>
            <span v-if="comment._count?.replies">
              {{ comment._count.replies }} {{ comment._count.replies === 1 ? 'reply' : 'replies' }}
            </span>
          </div>

          <div class="flex items-center space-x-2">
            <UButton
              v-if="comment.status === 'PENDING'"
              @click="updateCommentStatus(comment.id, 'APPROVED')"
              size="xs"
              color="green"
              icon="i-lucide-check"
            >
              Approve
            </UButton>
            <UButton
              v-if="comment.status === 'PENDING'"
              @click="updateCommentStatus(comment.id, 'REJECTED')"
              size="xs"
              color="red"
              variant="outline"
              icon="i-lucide-x"
            >
              Reject
            </UButton>
            <UButton
              v-if="comment.status !== 'SPAM'"
              @click="updateCommentStatus(comment.id, 'SPAM')"
              size="xs"
              color="orange"
              variant="outline"
              icon="i-lucide-flag"
            >
              Spam
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!filteredComments.length" class="text-center py-12">
      <UIcon name="i-lucide-message-circle" class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        {{ searchQuery || selectedStatus !== 'all' ? 'No comments found' : 'No comments yet' }}
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ searchQuery || selectedStatus !== 'all' ? 'Try adjusting your filters.' : 'Comments will appear here when users start engaging with your posts.' }}
      </p>
    </div>

    <!-- Stats Summary -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ comments.filter(c => c.status === 'PENDING').length }}
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          Pending Review
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div class="text-2xl font-bold text-green-600 dark:text-green-400">
          {{ comments.filter(c => c.status === 'APPROVED').length }}
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          Approved
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div class="text-2xl font-bold text-red-600 dark:text-red-400">
          {{ comments.filter(c => c.status === 'REJECTED').length }}
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          Rejected
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">
          {{ comments.filter(c => c.status === 'SPAM').length }}
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          Spam
        </div>
      </div>
    </div>
  </div>
</template>