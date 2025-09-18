<script setup lang="ts">
import { ref } from 'vue';
import { Modal, useEditorStore } from '../../stores/editorStore';
import type { PostStatus } from '~~/shared/types';
// import BadgeButton from '@/components/BadgeButton.vue'

const editorStore = useEditorStore();

// Form fields
const status = ref(editorStore.status);
const newCategory = ref('');
const newTag = ref('');

// Update methods
const updateStatus = () => {
  editorStore.setStatus(status.value as PostStatus);
};
const selectFeaturedImage = () => {
  // In a real app, you would use a media library component
  editorStore.openModal(Modal.imageFeatured);
};

const removeFeaturedImage = () => {
  editorStore.setFeaturedImage('');
};

const addCategory = () => {
  const cat = newCategory.value.trim();
  if (cat) {
    editorStore.addCategory(cat);
    newCategory.value = '';
  }
};

const addTag = () => {
  const tag = newTag.value.trim();
  if (tag) {
    editorStore.addTag(tag);
    newTag.value = '';
  }
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
  <div
    class="editor-sidebar bg-base w-64 border-r border-gray-200 overflow-y-auto h-full"
  >
    <div class="p-4">
      <!-- Blog Post Settings -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-3">Post Settings</h3>

        <!-- Status -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-400 mb-1"
            >Status</label
          >
          <select
            v-model="status"
            @change="updateStatus"
            class="select select-info"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>

        <!-- Publish Date (show if scheduled) -->
        <div class="mb-4" v-if="status === 'SCHEDULED'">
          <label class="block text-sm font-medium text-gray-400 mb-1"
            >Publish Date</label
          >
          <input
            type="datetime-local"
            v-model="editorStore.publishedAt"
            class="input input-info"
          />
        </div>

        <!-- Slug -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-400 mb-1"
            >Slug</label
          >
          <div type="text" class="btn btn-info btn-soft w-full">
            {{ editorStore.slug }}
          </div>
        </div>

        <!-- Featured Image -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-400 mb-1"
            >Featured Image</label
          >
          <div v-if="editorStore.featuredImage" class="mb-2">
            <img
              :src="editorStore.featuredImage"
              class="w-full h-auto rounded-md"
              alt="Featured Image"
            />
            <button
              @click="removeFeaturedImage"
              class="text-red-500 text-sm mt-1"
            >
              Remove
            </button>
          </div>
          <button
            @click="selectFeaturedImage"
            class="btn btn-sm btn-outline w-full"
          >
            {{ editorStore.featuredImage ? "Change Image" : "Add Image" }}
          </button>
        </div>

        <!-- Excerpt -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-400 mb-1"
            >Excerpt</label
          >
          <textarea
            v-model="editorStore.excerpt"
            class="textarea textarea-info"
            rows="3"
            placeholder="Brief summary of your post"
          ></textarea>
        </div>
      </div>

      <!-- Categories -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-3">Categories</h3>
        <div class="mb-2 flex">
          <input
            type="text"
            v-model="newCategory"
            @keyup.enter="addCategory"
            class="input input-info"
            placeholder="Add category"
          />
        </div>
        <div class="flex flex-wrap gap-2 mt-2">
          <!-- <BadgeButton -->
          <!--   v-for="category in editorStore.categories" -->
          <!--   :key="category" -->
          <!--   :value="category" -->
          <!--   :cb="editorStore.removeCategory" -->
          <!-- /> -->
        </div>
      </div>

      <!-- Tags -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-3">Tags</h3>
        <div class="mb-2 flex">
          <input
            type="text"
            v-model="newTag"
            @keyup.enter="addTag"
            class="input input-info"
            placeholder="Add tag"
          />
        </div>
        <div class="flex flex-wrap gap-2 mt-2">
          <BadgeButton
            v-for="tag in editorStore.tags"
            :key="tag"
            :value="tag"
            :cb="editorStore.removeTag"
          />
        </div>
      </div>
      <!-- Word Count Stats -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-3">Stats</h3>
        <div class="grid grid-cols-2 gap-2">
          <div class="p-2 rounded-md border border-success">
            <div class="text-sm text-gray-400">Words</div>
            <div class="text-lg font-bold">{{ editorStore.getWordCount }}</div>
          </div>
          <div class="p-2 rounded-md border border-success">
            <div class="text-sm text-gray-400">Reading time</div>
            <div class="text-lg font-bold">{{ editorStore.readingTime }}</div>
          </div>
        </div>
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
  </div>
</template>
