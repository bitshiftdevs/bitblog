<script setup lang="ts">
import type { Comment } from '~~/shared/types';

interface Props {
  postId: string;
  comments?: Comment[];
  commentsEnabled: boolean;
}

const props = defineProps<Props>();

const auth = useAuth();
const toast = useToast();

const isSubmitting = ref(false);
const commentForm = reactive({
  content: '',
  guestName: '',
  guestEmail: '',
  parentId: null as string | null,
});

const isFormValid = computed(() => {
  const hasContent = commentForm.content.trim().length > 0;
  const hasGuestInfo = auth.user || (commentForm.guestName.trim() && commentForm.guestEmail.trim());
  return hasContent && hasGuestInfo;
});

const submitComment = async () => {
  if (!isFormValid.value) return;

  isSubmitting.value = true;

  try {
    await $fetch('/api/comments', {
      method: 'POST',
      body: {
        postId: props.postId,
        content: commentForm.content,
        parentId: commentForm.parentId,
        ...(auth.user
          ? {}
          : {
              guestName: commentForm.guestName,
              guestEmail: commentForm.guestEmail,
            }),
      },
    });

    toast.add({
      title: 'Comment submitted',
      description: 'Your comment has been submitted and is awaiting approval.',
      color: 'success',
    });

    // Reset form
    commentForm.content = '';
    commentForm.parentId = null;
    if (!auth.user) {
      commentForm.guestName = '';
      commentForm.guestEmail = '';
    }

    // Refresh page to show new comment
    await refreshCookie();
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

const handleReply = (parentComment: Comment) => {
  commentForm.parentId = parentComment.id;
  // You could scroll to the form or show an inline reply form here
};
</script>
<template>
  <div class="space-y-6">
    <div class="border-t border-gray-200 dark:border-gray-700 pt-8">
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Comments ({{ comments?.length || 0 }})
      </h3>

      <!-- Comment Form -->
      <div v-if="commentsEnabled" class="mb-8">
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Leave a comment
        </h4>

        <form @submit.prevent="submitComment" class="space-y-4">
          <div v-if="!user" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Name" required>
              <UInput
                v-model="commentForm.guestName"
                placeholder="Your name"
                required
                :disabled="isSubmitting"
              />
            </UFormField>

            <UFormField label="Email" required>
              <UInput
                v-model="commentForm.guestEmail"
                type="email"
                placeholder="Your email"
                required
                :disabled="isSubmitting"
              />
            </UFormField>
          </div>

          <UFormField label="Comment" required>
            <UTextarea
              v-model="commentForm.content"
              placeholder="Write your comment..."
              :rows="4"
              required
              :disabled="isSubmitting"
            />
          </UFormField>

          <div class="flex justify-between items-center">
            <p v-if="!user" class="text-sm text-gray-500 dark:text-gray-400">
              Your email will not be published.
            </p>

            <UButton
              type="submit"
              :loading="isSubmitting"
              :disabled="!isFormValid"
            >
              Post Comment
            </UButton>
          </div>
        </form>
      </div>

      <!-- Comments List -->
      <div v-if="comments?.length" class="space-y-6">
        <CommentItem
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
          :post-id="postId"
          @reply="handleReply"
        />
      </div>

      <div v-else-if="!commentsEnabled" class="text-center py-8">
        <p class="text-gray-500 dark:text-gray-400">
          Comments are disabled for this post.
        </p>
      </div>

      <div v-else class="text-center py-8">
        <p class="text-gray-500 dark:text-gray-400">
          No comments yet. Be the first to comment!
        </p>
      </div>
    </div>
  </div>
</template>
