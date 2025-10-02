<script setup lang="ts">
import { Modal } from '~~/shared/types';
import { useEditorStore } from '../../stores/editorStore';
import type { SelectMenuItem } from '@nuxt/ui';

const editorStore = useEditorStore();

// Fetch available categories and tags
const { data: categoriesData } = await useFetch('/api/categories');
const { data: tagsData } = await useFetch('/api/tags');

const availableCategories = computed(() => categoriesData.value?.data?.items || []);
const availableTags = computed(() => tagsData.value?.data?.items || []);

// Transform categories and tags for display
const selectedCategoryNames = computed({
  get: () => editorStore.categories.map((cat) => cat.name),
  set: (value) => {
    // Convert string names back to category objects
    editorStore.categories = value.map((name) => {
      const existing = availableCategories.value.find((cat) => cat.name === name);
      return existing || { id: name.toLowerCase().replace(/\s+/g, '-'), name };
    });
  },
});

const selectedTagNames = computed({
  get: () => editorStore.tags.map((tag) => tag.name),
  set: (value) => {
    // Convert string names back to tag objects
    editorStore.tags = value.map((name) => {
      const existing = availableTags.value.find((tag) => tag.name === name);
      return existing || { id: name.toLowerCase().replace(/\s+/g, '-'), name };
    });
  },
});

const postStatusList: SelectMenuItem[] = [{ label: 'draft' }, { label: 'published' }, { label: 'scheduled' }];

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
        <USelectMenu
          class="w-full"
          :items="postStatusList"
          v-model="editorStore.status"
        />
      </UFormField>

      <!-- Publish Date (show if scheduled) -->
      <UFormField
        label="Schedule Date"
        v-if="editorStore.status === 'scheduled'"
      >
        <UInput
          type="text"
          v-if="editorStore.status === 'scheduled'"
          v-model="editorStore.publishedAt"
          placeholder="Select publish date"
        />
      </UFormField>

      <UFormField label="slug">
        <UInput
          type="text"
          class="w-full"
          :placeholder="editorStore.slug"
          disabled
        />
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
          @click="editorStore.openModal(Modal.imageFeatured)"
          class="w-1/2"
          icon="i-lucide-image-plus"
          :label="editorStore.featuredImage ? 'Change Image' : 'Add Image'"
        />
      </UFormField>

      <UFormField label="Excerpt">
        <UTextarea
          type="text"
          class="w-full"
          placeholder="Brief summary of post"
          v-model="editorStore.excerpt"
        />
      </UFormField>

      <!-- Categories -->
      <UFormField label="Categories">
        <UInputTags
          v-model="selectedCategoryNames"
          placeholder="Add or select category"
          :suggestions="availableCategories.map((cat) => cat.name)"
        />
        <template #description>
          <div
            v-if="availableCategories.length"
            class="text-xs text-gray-500 mt-1"
          >
            Available:
            {{
              availableCategories
                .slice(0, 3)
                .map((c) => c.name)
                .join(", ")
            }}{{ availableCategories.length > 3 ? "..." : "" }}
          </div>
        </template>
      </UFormField>

      <!-- Tags -->
      <UFormField label="Tags">
        <UInputTags
          v-model="selectedTagNames"
          placeholder="Add or select tag"
          :suggestions="availableTags.map((tag) => tag.name)"
        />
        <template #description>
          <div v-if="availableTags.length" class="text-xs text-gray-500 mt-1">
            Available:
            {{
              availableTags
                .slice(0, 3)
                .map((t) => t.name)
                .join(", ")
            }}{{ availableTags.length > 3 ? "..." : "" }}
          </div>
        </template>
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
