<script setup lang="ts">
import type { Comment } from "~~/shared/types";
import { formatDate } from "~/utils/date";
import { stripHtml } from "~/utils/text";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

const toast = useToast();

// Reactive state
const comments = ref<Comment[]>([]);
const posts = ref<any[]>([]);
const isLoading = ref(true);
const isUpdating = ref(false);
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
});
const stats = ref({
  pending: 0,
  approved: 0,
  rejected: 0,
  spam: 0,
});

// Filters
const selectedStatus = ref("all");
const searchQuery = ref("");
const selectedPostId = ref("all");

const statusOptions = [
  { label: "All Comments", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Spam", value: "SPAM" },
];

const postOptions = computed(() => [
  { label: "All Posts", value: "all" },
  ...posts.value.map((post) => ({ label: post.title, value: post.id })),
]);

// Load data on mount
onMounted(() => {
  loadComments();
  loadPosts();
});

// Watch filters for auto-reload
watch([selectedStatus, searchQuery, selectedPostId], () => {
  pagination.value.page = 1;
  loadComments();
});

const loadComments = async () => {
  try {
    isLoading.value = true;

    const query: any = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    };

    if (selectedStatus.value !== "all") {
      query.status = selectedStatus.value;
    }

    if (searchQuery.value) {
      query.search = searchQuery.value;
    }

    if (selectedPostId.value !== "all") {
      query.postId = selectedPostId.value;
    }

    const response = await $fetch("/api/admin/comments", { query });

    if (response.success) {
      comments.value = response.data.items;
      pagination.value = response.data.pagination;
      stats.value = response.data.stats || {};
    }
  } catch (error: any) {
    console.error("Failed to load comments:", error);
    toast.add({
      title: "Error",
      description: "Failed to load comments",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
};

const loadPosts = async () => {
  try {
    const response = await $fetch("/api/posts", {
      query: { limit: 100 }, // Get all posts for the filter
    });

    if (response.success) {
      posts.value = response.data.items;
    }
  } catch (error: any) {
    console.error("Failed to load posts:", error);
  }
};

// Comment actions
const updateCommentStatus = async (
  commentId: string,
  newStatus: "approved" | "REJECTED" | "SPAM",
) => {
  try {
    isUpdating.value = true;

    const response = await $fetch(`/api/comments/${commentId}`, {
      method: "PUT",
      body: { status: newStatus },
    });

    if (response.success) {
      // Update the comment in the list
      const commentIndex = comments.value.findIndex((c) => c.id === commentId);
      if (commentIndex !== -1) {
        comments.value[commentIndex] = response.data;
      }

      toast.add({
        title: "Success",
        description: `Comment ${newStatus.toLowerCase()} successfully`,
        color: "success",
      });

      // Reload to update stats
      await loadComments();
    }
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.data?.message || "Failed to update comment",
      color: "error",
    });
  } finally {
    isUpdating.value = false;
  }
};

const deleteComment = async (commentId: string) => {
  console.log("deleting");
  confirmAction({
    title: "Confirm Deletion",
    question:
      "Are you sure you want to delete this comment? This action cannot be undone.",
    onConfirm: async () => {
      try {
        isUpdating.value = true;

        const response = await $fetch(`/api/comments/${commentId}`, {
          method: "DELETE",
        });

        if (response.success) {
          // Remove the comment from the list
          comments.value = comments.value.filter((c) => c.id !== commentId);

          toast.add({
            title: "Success",
            description: "Comment deleted successfully",
            color: "success",
          });

          // Reload to update stats and pagination
          await loadComments();
        }
      } catch (error: any) {
        toast.add({
          title: "Error",
          description: error.data?.message || "Failed to delete comment",
          color: "error",
        });
      } finally {
        isUpdating.value = false;
      }
    },
  });
};

const bulkApprove = async () => {
  const pendingComments = comments.value.filter((c) => c.status === "pending");

  if (pendingComments.length === 0) {
    toast.add({
      title: "Info",
      description: "No pending comments to approve",
      color: "info",
    });
    return;
  }

  confirmAction({
    title: "Confirm Aproval",
    question: `Are you sure you want to approve ${pendingComments.length} pending comments?`,
    onConfirm: async () => {
      try {
        isUpdating.value = true;

        const response = await $fetch("/api/admin/comments/bulk", {
          method: "POST",
          body: {
            commentIds: pendingComments.map((c) => c.id),
            action: "approve",
          },
        });

        if (response.success) {
          toast.add({
            title: "Success",
            description: response.message,
            color: "success",
          });

          // Reload comments
          await loadComments();
        }
      } catch (error: any) {
        toast.add({
          title: "Error",
          description: error.data?.message || "Failed to approve comments",
          color: "error",
        });
      } finally {
        isUpdating.value = false;
      }
    },
  });
};

// Pagination
const goToPage = (page: number) => {
  pagination.value.page = page;
  loadComments();
};

const getPostTitle = (postId: string) => {
  const post = posts.value.find((p) => p.id === postId);
  return post?.title || "Unknown Post";
};

// Set breadcrumbs
const setBreadcrumbs = inject("setBreadcrumbs", () => {});
setBreadcrumbs([{ label: "Dashboard", to: "/admin" }, { label: "Comments" }]);
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
          :disabled="
            !comments.some((c) => c.status === 'pending') || isUpdating
          "
          :loading="isUpdating"
          color="success"
          variant="outline"
          size="sm"
          icon="i-heroicons-check"
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

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin" />
      <span class="ml-2">Loading comments...</span>
    </div>

    <!-- Comments List -->
    <div v-else class="space-y-4">
      <div
        v-for="comment in comments"
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
                  click: () => updateCommentStatus(comment.id, 'approved'),
                  disabled: comment.status === 'approved',
                },
                {
                  label: 'Reject',
                  icon: 'i-lucide-x',
                  click: () => updateCommentStatus(comment.id, 'REJECTED'),
                  disabled: comment.status === 'rejected',
                },
                {
                  label: 'Mark as Spam',
                  icon: 'i-lucide-flag',
                  click: () => updateCommentStatus(comment.id, 'SPAM'),
                  disabled: comment.status === 'spam',
                },
              ],
              [
                {
                  label: 'Delete',
                  icon: 'i-lucide-trash',
                  click: () => deleteComment(comment.id),
                },
              ],
            ]"
          >
            <UButton
              icon="i-lucide-more-vertical"
              size="xs"
              color="neutral"
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
        <div
          class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          <div
            class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400"
          >
            <span>On: {{ getPostTitle(comment.postId) }}</span>
            <span v-if="comment._count?.replies">
              {{ comment._count.replies }}
              {{ comment._count.replies === 1 ? "reply" : "replies" }}
            </span>
          </div>

          <div class="flex items-center space-x-2">
            <UButton
              v-if="comment.status === 'pending'"
              @click="updateCommentStatus(comment.id, 'approved')"
              size="xs"
              color="success"
              icon="i-lucide-check"
            >
              Approve
            </UButton>
            <UButton
              v-if="comment.status === 'pending'"
              @click="updateCommentStatus(comment.id, 'REJECTED')"
              size="xs"
              color="error"
              variant="outline"
              icon="i-lucide-x"
            >
              Reject
            </UButton>
            <UButton
              v-if="comment.status !== 'spam'"
              @click="updateCommentStatus(comment.id, 'SPAM')"
              size="xs"
              color="warning"
              variant="outline"
              icon="i-lucide-flag"
            >
              Spam
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="flex justify-center">
      <UPagination
        v-model="pagination.page"
        :page-count="pagination.totalPages"
        :total="pagination.total"
        @update:model-value="goToPage"
      />
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && !comments.length" class="text-center py-12">
      <UIcon
        name="i-lucide-message-circle"
        class="mx-auto h-12 w-12 text-gray-400"
      />
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        {{
          searchQuery || selectedStatus !== "all"
            ? "No comments found"
            : "No comments yet"
        }}
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{
          searchQuery || selectedStatus !== "all"
            ? "Try adjusting your filters."
            : "Comments will appear here when users start engaging with your posts."
        }}
      </p>
    </div>

    <!-- Stats Summary -->
    <div v-if="!isLoading" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div
        class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
      >
        <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
          {{ stats.pending || 0 }}
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          Pending Review
        </div>
      </div>
      <div
        class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
      >
        <div class="text-2xl font-bold text-green-600 dark:text-green-400">
          {{ stats.approved || 0 }}
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400">Approved</div>
      </div>
      <div
        class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
      >
        <div class="text-2xl font-bold text-red-600 dark:text-red-400">
          {{ stats.rejected || 0 }}
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400">Rejected</div>
      </div>
      <div
        class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
      >
        <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">
          {{ stats.spam || 0 }}
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400">Spam</div>
      </div>
    </div>
  </div>
</template>
