<script setup lang="ts">
import { ref } from 'vue';
import { Modal, useEditorStore } from '../../stores/editorStore';
import type { PostStatus } from '~~/shared/types';
import type { SelectMenuItem } from '@nuxt/ui';

const editorStore = useEditorStore();

// Form fields
const status = ref(editorStore.status);

const postStatusList: SelectMenuItem[] = [
  { label: 'DRAFT' },
  { label: 'PUBLISHED' },
  { label: 'SCHEDULED' },
];

const selectFeaturedImage = () => {
  // In a real app, you would use a media library component
  editorStore.openModal(Modal.imageFeatured);
};

const removeFeaturedImage = () => {
  editorStore.setFeaturedImage('');
};

// Revisions
const viewRevisions = () => {
  // In a real app, this would open a modal with revision history
  alert('Revision history feature would open here');
};

// Update references when store changes
editorStore.$subscribe((mutation, state) => {
  if (mutation.type.includes('set')) {
    status.value = state.status;
  }
});
</script>
<template>
  <UDashboardSidebar>
    <div class="p-4">
      <h3 class="text-lg font-semibold mb-3">Post Settings</h3>

      <UFormField label="Post Status">
        <USelectMenu :items="postStatusList" v-model="editorStore.getStatus" />
      </UFormField>

      <!-- Publish Date (show if scheduled) -->
      <div class="mb-4" v-if="editorStore.getStatus === 'SCHEDULED'">
        <label class="block text-sm font-medium text-gray-400 mb-1"
          >Publish Date</label
        >
        <input
          type="datetime-local"
          v-model="editorStore.publishedAt"
          class="input input-info"
        />
      </div>

      <UFormField label="slug">
        <UInput type="text" :placeholder="editorStore.slug" disabled />
      </UFormField>

      <UFormField label="Featured Image">
        <UFileUpload />
      </UFormField>

      <UFormField label="Excerpt">
        <UInput
          type="text"
          placeholder="Brief summary of post"
          v-model="editorStore.excerpt"
        />
      </UFormField>

      <!-- Categories -->
      <UFormField label="Categories" required>
        <UInputTags
          v-model="editorStore.categories"
          class="input input-info"
          placeholder="Add category"
        />
      </UFormField>

      <!-- Tags -->
      <UFormField label="Tags" required>
        <UInputTags
          v-model="editorStore.tags"
          class="input input-info"
          placeholder="Add tag"
        />
      </UFormField>
      <!-- Word Count Stats -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-3">Stats</h3>
        <UContainer class="flex-col flex">
          <UFieldGroup>
            <UInput placeholder="Words" variant="soft" disabled />
            <UButton
              class="text-lg font-bold"
              :label="`${editorStore.wordCount}`"
              variant="soft"
              disabled
            />
          </UFieldGroup>
          <UFieldGroup>
            <UInput placeholder="Reading time" variant="soft" disabled />
            <UButton
              class="text-lg font-bold"
              :label="`${editorStore.readingTime}`"
              variant="soft"
              disabled
            />
          </UFieldGroup>
        </UContainer>
      </div>

      <!-- Revision History -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-3">Revisions</h3>
        <div class="space-y-2">
          <button @click="viewRevisions" class="btn btn-sm btn-outline w-full">
            View Revision History
          </button>
        </div>
      </div>
    </div>
  </UDashboardSidebar>
</template>
