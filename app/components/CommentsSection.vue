<script setup lang="ts">
import type { Comment } from '~~/shared/types';
import { formatDate } from '~/utils/date';
import { CreateCommentSchema, type CommentSchema } from '~~/shared/schemas';
import type { FormError, FormSubmitEvent } from '@nuxt/ui';

interface Props {
  postId: string;
  commentsEnabled: boolean;
}

const props = defineProps<Props>();

const auth = useAuth();
const toast = useToast();

// Reactive state
const comments = ref<Comment[]>([]);
const isLoading = ref(true);
const isSubmitting = ref(false);
const replyingTo = ref<Comment | null>(null);

const commentForm = reactive<Partial<CommentSchema>>({
  content: undefined,
  guestName: auth.user?.name,
  guestEmail: auth.user?.email,
  parentId: null as string | null,
  postId: props.postId,
});

// Load comments when component mounts
onMounted(() => {
  loadComments();
});

const loadComments = async () => {
  try {
    isLoading.value = true;
    const response = await $fetch(`/api/posts/${props.postId}/comments`, {
      query: {
        includeAll: auth.user?.isAdmin ? 'true' : 'false',
      },
    });

    if (response.success) {
      comments.value = response.data.items;
    }
  } catch (error: any) {
    console.error('Failed to load comments:', error);
    toast.add({
      title: 'Error',
      description: 'Failed to load comments',
      color: 'error',
    });
  } finally {
    isLoading.value = false;
  }
};

const submitComment = async (event: FormSubmitEvent<CommentSchema>) => {
  isSubmitting.value = true;

  try {
    const response = await $fetch('/api/comments', {
      method: 'POST',
      body: event.data,
    });

    if (response.success) {
      toast.add({
        title: 'Comment submitted',
        description: response.message || 'Your comment has been submitted and is awaiting approval.',
        color: 'success',
      });

      // Reset form
      resetForm();

      // Reload comments to show the new comment (if approved) or for admin users
      await loadComments();
    }
  } catch (error: any) {
    toast.add({
      title: 'Comment failed',
      description: error.data?.message || 'Failed to submit comment. Please try again.',
      color: 'error',
    });
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  commentForm.content = '';
  commentForm.parentId = null;
  replyingTo.value = null;
  if (!auth.user) {
    commentForm.guestName = undefined;
    commentForm.guestEmail = undefined;
  }
};

const handleReply = (parentComment: Comment) => {
  replyingTo.value = parentComment;
  commentForm.parentId = parentComment.id;

  // Scroll to form
  nextTick(() => {
    const formElement = document.getElementById('comment-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
};

const handleCommentUpdate = (updatedComment: Comment) => {
  // Update comment in the list
  const updateCommentInList = (commentList: Comment[]): Comment[] => {
    return commentList.map((comment) => {
      if (comment.id === updatedComment.id) {
        return updatedComment;
      }
      if (comment.replies) {
        comment.replies = updateCommentInList(comment.replies);
      }
      return comment;
    });
  };

  comments.value = updateCommentInList(comments.value);
};

const handleCommentDelete = (commentId: string) => {
  // Remove comment from the list
  const removeCommentFromList = (commentList: Comment[]): Comment[] => {
    return commentList.filter((comment) => {
      if (comment.id === commentId) {
        return false;
      }
      if (comment.replies) {
        comment.replies = removeCommentFromList(comment.replies);
      }
      return true;
    });
  };

  comments.value = removeCommentFromList(comments.value);
};

const cancelReply = () => {
  resetForm();
};
</script>
<template>
  <div class="space-y-6">
    <div class="border-t border-gray-200 dark:border-gray-700 pt-8">
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Comments ({{ comments.length }})
      </h3>

      <!-- Comment Form -->
      <div v-if="commentsEnabled" id="comment-form" class="mb-8">
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {{
            replyingTo
              ? `Reply to ${replyingTo.author?.name || replyingTo.guestName}`
              : "Leave a comment"
          }}
        </h4>

        <!-- Reply context -->
        <div
          v-if="replyingTo"
          class="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-primary"
        >
          <div class="flex items-center justify-between">
            <div class="text-sm">
              <span class="font-medium">{{
                replyingTo.author?.name || replyingTo.guestName
              }}</span>
              <span class="text-gray-500 dark:text-gray-400 ml-2">{{
                formatDate(replyingTo.createdAt)
              }}</span>
            </div>
            <UButton
              icon="i-heroicons-x-mark"
              size="xs"
              variant="ghost"
              @click="cancelReply"
            />
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {{ replyingTo.content.substring(0, 150)
            }}{{ replyingTo.content.length > 150 ? "..." : "" }}
          </p>
        </div>

        <UForm
          :state="commentForm"
          :schema="CreateCommentSchema"
          @submit.prevent="submitComment"
          class="space-y-4"
        >
          <div v-if="!auth.user" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Name" name="guestName">
              <UInput
                v-model="commentForm.guestName"
                placeholder="Your name"
                :disabled="isSubmitting"
              />
            </UFormField>

            <UFormField label="Email" name="guestEmail">
              <UInput
                v-model="commentForm.guestEmail"
                type="email"
                placeholder="Your email"
                :disabled="isSubmitting"
              />
            </UFormField>
          </div>

          <UFormField label="Comment" name="content">
            <UTextarea
              v-model="commentForm.content"
              placeholder="Write your comment..."
              :rows="4"
              :disabled="isSubmitting"
            />
          </UFormField>

          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-4">
              <p
                v-if="!auth.user"
                class="text-sm text-gray-500 dark:text-gray-400"
              >
                Your email will not be published.
              </p>
              <UButton
                v-if="replyingTo"
                variant="ghost"
                size="sm"
                @click="cancelReply"
                :disabled="isSubmitting"
              >
                Cancel Reply
              </UButton>
            </div>

            <UButton type="submit" :loading="isSubmitting">
              {{ replyingTo ? "Post Reply" : "Post Comment" }}
            </UButton>
          </div>
        </UForm>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="h-6 w-6 animate-spin" />
        <span class="ml-2">Loading comments...</span>
      </div>

      <!-- Comments List -->
      <div v-else-if="comments.length" class="space-y-6">
        <CommentItem
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
          :post-id="postId"
          @reply="handleReply"
          @update="handleCommentUpdate"
          @delete="handleCommentDelete"
        />
      </div>

      <!-- Empty States -->
      <div v-else-if="!commentsEnabled" class="text-center py-8">
        <UIcon
          name="i-lucide-message-circle-dashed"
          class="h-12 w-12 mx-auto text-gray-300 mb-4"
        />
        <p class="text-gray-500 dark:text-gray-400">
          Comments are disabled for this post.
        </p>
      </div>

      <div v-else class="text-center py-8">
        <UIcon
          name="i-lucide-message-circle-dashed"
          class="h-12 w-12 mx-auto text-gray-300 mb-4"
        />
        <p class="text-gray-500 dark:text-gray-400">
          No comments yet. Be the first to comment!
        </p>
      </div>
    </div>
  </div>
</template>
