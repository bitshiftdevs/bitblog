<!-- apps/web/components/CommentItem.vue -->
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
          <time class="text-xs text-gray-500 dark:text-gray-400">
            {{ formatDate(comment.createdAt) }}
          </time>
        </div>

        <div
          class="prose prose-sm dark:prose-invert max-w-none"
          v-html="comment.content"
        />
      </div>

      <!-- Reply button -->
      <div class="mt-2">
        <UButton variant="ghost" size="xs" @click="$emit('reply', comment)">
          Reply
        </UButton>
      </div>

      <!-- Replies -->
      <div v-if="comment.replies?.length" class="mt-4 space-y-4">
        <CommentItem
          v-for="reply in comment.replies"
          :key="reply.id"
          :comment="reply"
          :post-id="postId"
          @reply="$emit('reply', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Comment } from '~~/shared/types';

interface Props {
  comment: Comment;
  postId: string;
}

defineProps<Props>();
defineEmits<{
  reply: [comment: Comment];
}>();
</script>

<!-- apps/web/middleware/guest.ts -->
export default defineNuxtRouteMiddleware((to, from) => { const { $auth } =
useNuxtApp() // If user is authenticated, redirect away from auth pages if
($auth.isAuthenticated) { return navigateTo('/admin') } })
