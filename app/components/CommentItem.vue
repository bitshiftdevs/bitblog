<script setup lang="ts">
import type { Comment } from '~~/shared/types';
import { formatDate, formatRelativeTime } from '~/utils/date';
import { sanitizeHtml } from '~/utils/text';
import { confirmAction } from '~/composables/useConfirmModal';

interface Props {
  comment: Comment;
  postId: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  reply: [comment: Comment];
  update: [comment: Comment];
  delete: [commentId: string];
}>();

const auth = useAuth();
const toast = useToast();

const isEditing = ref(false);
const isLoading = ref(false);
const editContent = ref(props.comment.content);

// Check if current user can edit/delete this comment
const canEdit = computed(() => {
  if (!auth.user) return false;
  if (auth.user.isAdmin) return true;

  // User can edit their own comment within 30 minutes
  if (props.comment.authorId === auth.user.id) {
    const commentAge = Date.now() - new Date(props.comment.createdAt).getTime();
    const editTimeLimit = 30 * 60 * 1000; // 30 minutes
    return commentAge <= editTimeLimit;
  }

  return false;
});

const canDelete = computed(() => {
  if (!auth.user) return false;
  if (auth.user.isAdmin) return true;

  // User can delete their own comment within 30 minutes and if no replies
  if (props.comment.authorId === auth.user.id) {
    const commentAge = Date.now() - new Date(props.comment.createdAt).getTime();
    const deleteTimeLimit = 30 * 60 * 1000; // 30 minutes
    const hasReplies = props.comment._count?.replies && props.comment._count.replies > 0;
    return commentAge <= deleteTimeLimit && !hasReplies;
  }

  return false;
});

const startEdit = () => {
  isEditing.value = true;
  editContent.value = props.comment.content;
};

const cancelEdit = () => {
  isEditing.value = false;
  editContent.value = props.comment.content;
};

const saveEdit = async () => {
  if (!editContent.value.trim()) {
    toast.add({
      title: 'Error',
      description: 'Comment content cannot be empty',
      color: 'error'
    });
    return;
  }

  isLoading.value = true;

  try {
    const response = await $fetch(`/api/comments/${props.comment.id}`, {
      method: 'PUT',
      body: {
        content: editContent.value
      }
    });

    if (response.success) {
      emit('update', response.data);
      isEditing.value = false;
      toast.add({
        title: 'Success',
        description: 'Comment updated successfully',
        color: 'success'
      });
    }
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to update comment',
      color: 'error'
    });
  } finally {
    isLoading.value = false;
  }
};

const deleteComment = () => {
  confirmAction({
    title: 'Delete Comment',
    question: 'Are you sure you want to delete this comment? This action cannot be undone.',
    onConfirm: async () => {
      isLoading.value = true;

      try {
        const response = await $fetch(`/api/comments/${props.comment.id}`, {
          method: 'DELETE'
        });

        if (response.success) {
          emit('delete', props.comment.id);
          toast.add({
            title: 'Success',
            description: 'Comment deleted successfully',
            color: 'success'
          });
        }
      } catch (error: any) {
        toast.add({
          title: 'Error',
          description: error.data?.message || 'Failed to delete comment',
          color: 'error'
        });
      } finally {
        isLoading.value = false;
      }
    }
  });
};
</script>

<template>
  <div class="flex space-x-3">
    <UAvatar
      :src="comment.author?.avatarUrl"
      :alt="comment.author?.name || comment.guestName"
      size="sm"
    />

    <div class="flex-1 min-w-0">
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-sm font-medium text-gray-900 dark:text-white">
            {{ comment.author?.name || comment.guestName }}
          </h4>
          <div class="flex items-center space-x-2">
            <time class="text-xs text-gray-500 dark:text-gray-400" :title="formatDate(comment.createdAt)">
              {{ formatRelativeTime(comment.createdAt) }}
            </time>

            <!-- Edit/Delete buttons for comment owner or admin -->
            <div v-if="canEdit || canDelete" class="flex items-center space-x-1">
              <UButton
                v-if="canEdit && !isEditing"
                icon="i-heroicons-pencil"
                size="2xs"
                variant="ghost"
                @click="startEdit"
                :disabled="isLoading"
              />
              <UButton
                v-if="canDelete"
                icon="i-heroicons-trash"
                size="2xs"
                variant="ghost"
                color="red"
                @click="deleteComment"
                :disabled="isLoading"
                :loading="isLoading"
              />
            </div>
          </div>
        </div>

        <!-- Comment content (editing mode) -->
        <div v-if="isEditing" class="space-y-3">
          <UTextarea
            v-model="editContent"
            :rows="3"
            placeholder="Edit your comment..."
            :disabled="isLoading"
          />
          <div class="flex justify-end space-x-2">
            <UButton
              size="xs"
              variant="ghost"
              @click="cancelEdit"
              :disabled="isLoading"
            >
              Cancel
            </UButton>
            <UButton
              size="xs"
              @click="saveEdit"
              :loading="isLoading"
              :disabled="!editContent.trim()"
            >
              Save
            </UButton>
          </div>
        </div>

        <!-- Comment content (display mode) -->
        <div
          v-else
          class="prose prose-sm dark:prose-invert max-w-none"
          v-html="sanitizeHtml(comment.content)"
        />
      </div>

      <!-- Reply button -->
      <div class="mt-2 flex items-center space-x-2">
        <UButton variant="ghost" size="xs" @click="$emit('reply', comment)">
          Reply
        </UButton>

        <!-- Comment status badge for admins -->
        <UBadge
          v-if="auth.user?.isAdmin && comment.status !== 'approved'"
          :label="comment.status"
          :color="comment.status === 'pending' ? 'yellow' : comment.status === 'REJECTED' ? 'red' : 'orange'"
          size="xs"
        />
      </div>

      <!-- Replies -->
      <div v-if="comment.replies?.length" class="mt-4 space-y-4">
        <CommentItem
          v-for="reply in comment.replies"
          :key="reply.id"
          :comment="reply"
          :post-id="postId"
          @reply="$emit('reply', $event)"
          @update="$emit('update', $event)"
          @delete="$emit('delete', $event)"
        />
      </div>
    </div>
  </div>
</template>
