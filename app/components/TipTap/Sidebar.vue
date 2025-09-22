<script setup lang="ts">
import { Modal } from '~~/shared/types';
import { useEditorStore } from '../../stores/editorStore';
import type { SelectMenuItem } from '@nuxt/ui';

const editorStore = useEditorStore();

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
</script>
<template>
  <UDashboardSidebar class="w-96">
    <div class="p-4">
      <h3 class="text-lg font-semibold mb-3">Post Settings</h3>

      <UFormField label="Post Status">
        <USelectMenu :items="postStatusList" v-model="editorStore.status" />
      </UFormField>

      <!-- Publish Date (show if scheduled) -->
      <UFormField
        label="Schedule Date"
        v-if="editorStore.status === 'SCHEDULED'"
      >
        <UInput
          type="text"
          v-model="editorStore.publishedAt"
          placeholder="Select publish date"
        />
      </UFormField>

      <UFormField label="slug">
        <UInput type="text" :placeholder="editorStore.slug" disabled />
      </UFormField>

      <UFormField label="Featured Image">
        <div v-if="editorStore.featuredImage" class="mb-2">
          <NuxtImg
            :src="editorStore.featuredImage"
            class="w-full h-auto rounded-md"
            format="webp"
            alt="Featured Image"
          />
          <button
            @click="removeFeaturedImage"
            class="text-red-500 text-sm mt-1"
          >
            Remove
          </button>
        </div>
        <UButton
          @click="selectFeaturedImage"
          class="w-1/2"
          icon="i-lucide-image-plus"
          :label="editorStore.featuredImage ? 'Change Image' : 'Add Image'"
        />
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
