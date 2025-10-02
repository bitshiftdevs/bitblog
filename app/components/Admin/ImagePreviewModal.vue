<script setup lang="ts">
import type { Media } from '~~/shared/types';

const props = defineProps<{
  media: Media;
}>();

const emit = defineEmits<{
  close: [];
  update: [{ altText: string; caption: string }];
  delete: [string];
  download: [string];
}>();

// Form data for editable fields
const formData = ref({
  altText: props.media.altText || '',
  caption: props.media.caption || '',
});

// UI state
const isEditing = ref(false);
const isLoading = ref(false);
const isDeleting = ref(false);
const imageLoaded = ref(false);
const imageError = ref(false);

// Watch for media prop changes to update form data
watch(
  () => props.media,
  (newMedia) => {
    formData.value = {
      altText: newMedia.altText || '',
      caption: newMedia.caption || '',
    };
    imageLoaded.value = false;
    imageError.value = false;
  },
  { immediate: true },
);

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Handle image load events
function onImageLoad() {
  imageLoaded.value = true;
  imageError.value = false;
}

function onImageError() {
  imageLoaded.value = false;
  imageError.value = true;
}

// Save metadata changes
async function saveChanges() {
  isLoading.value = true;
  try {
    await $fetch(`/api/media/${props.media.id}`, {
      method: 'PUT',
      body: {
        altText: formData.value.altText,
        caption: formData.value.caption,
      },
    });

    emit('update', formData.value);
    isEditing.value = false;
  } catch (error) {
    console.error('Failed to update media:', error);
    // You might want to show a toast notification here
  } finally {
    isLoading.value = false;
  }
}

// Cancel editing
function cancelEdit() {
  formData.value = {
    altText: props.media.altText || '',
    caption: props.media.caption || '',
  };
  isEditing.value = false;
}

// Delete media
async function deleteMedia() {
  if (!confirm(`Are you sure you want to delete "${props.media.filename}"? This action cannot be undone.`)) {
    return;
  }

  isDeleting.value = true;
  try {
    await $fetch(`/api/media/${props.media.id}`, {
      method: 'DELETE',
    });

    emit('delete', props.media.id);
    emit('close');
  } catch (error) {
    console.error('Failed to delete media:', error);
    // You might want to show a toast notification here
  } finally {
    isDeleting.value = false;
  }
}

// Copy URL to clipboard
async function copyUrl() {
  try {
    await navigator.clipboard.writeText(props.media.url);
    // You might want to show a toast notification here
  } catch (error) {
    console.error('Failed to copy URL:', error);
  }
}

// Download media
function downloadMedia() {
  emit('download', props.media.url);
  // Create a temporary link to download the file
  const link = document.createElement('a');
  link.href = props.media.url;
  link.download = props.media.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
</script>

<template>
  <UModal @close="emit('close')">
    <template #body>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold truncate">{{ media.filename }}</h3>
        <div class="flex items-center gap-2">
          <UButton
            icon="i-heroicons-pencil"
            size="sm"
            variant="ghost"
            @click="isEditing = !isEditing"
            :disabled="isLoading"
          />
          <UButton
            icon="i-heroicons-arrow-down-tray"
            size="sm"
            variant="ghost"
            @click="downloadMedia"
            title="Download"
          />
          <UButton
            icon="i-heroicons-clipboard"
            size="sm"
            variant="ghost"
            @click="copyUrl"
            title="Copy URL"
          />
          <UButton
            icon="i-heroicons-trash"
            size="sm"
            color="red"
            variant="ghost"
            @click="deleteMedia"
            :loading="isDeleting"
            title="Delete"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Image Preview -->
        <div class="lg:col-span-2">
          <div
            class="relative bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden"
          >
            <!-- Loading skeleton -->
            <div v-if="!imageLoaded && !imageError" class="animate-pulse">
              <div
                class="aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
              >
                <UIcon
                  name="i-heroicons-photo"
                  class="h-12 w-12 text-gray-400"
                />
              </div>
            </div>

            <!-- Error state -->
            <div
              v-else-if="imageError"
              class="aspect-video bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center text-gray-500"
            >
              <UIcon
                name="i-heroicons-exclamation-triangle"
                class="h-12 w-12 mb-2"
              />
              <p>Failed to load image</p>
            </div>

            <!-- Image -->
            <img
              v-show="imageLoaded && !imageError"
              :src="media.url"
              :alt="media.altText || media.filename"
              class="w-full h-auto max-h-96 object-contain"
              @load="onImageLoad"
              @error="onImageError"
            />
          </div>
        </div>

        <!-- Media Information -->
        <div class="space-y-6">
          <!-- File Information -->
          <div>
            <h4
              class="font-medium text-sm text-gray-700 dark:text-gray-300 mb-3"
            >
              File Information
            </h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Size:</span>
                <span>{{ formatFileSize(media.size) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Type:</span>
                <span>{{ media.mimeType }}</span>
              </div>
              <div
                v-if="media.width && media.height"
                class="flex justify-between"
              >
                <span class="text-gray-600 dark:text-gray-400"
                  >Dimensions:</span
                >
                <span>{{ media.width }} × {{ media.height }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Uploaded:</span>
                <span>{{ formatDate(media.createdAt) }}</span>
              </div>
              <div v-if="media.uploadedBy" class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">By:</span>
                <span>{{ media.uploadedBy.name }}</span>
              </div>
            </div>
          </div>

          <!-- Metadata Form -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-medium text-sm text-gray-700 dark:text-gray-300">
                Metadata
              </h4>
              <UButton
                v-if="!isEditing"
                icon="i-heroicons-pencil"
                size="xs"
                variant="ghost"
                @click="isEditing = true"
              />
            </div>

            <UForm
              v-if="isEditing"
              @submit.prevent="saveChanges"
              class="space-y-4"
            >
              <UFormField
                label="Alt Text"
                hint="Describe the image for accessibility"
              >
                <UInput
                  v-model="formData.altText"
                  placeholder="Image description"
                />
              </UFormField>

              <UFormField label="Caption" hint="Optional caption for the image">
                <UTextarea
                  v-model="formData.caption"
                  placeholder="Image caption"
                  :rows="3"
                />
              </UFormField>

              <div class="flex gap-2">
                <UButton type="submit" size="sm" :loading="isLoading">
                  Save
                </UButton>
                <UButton
                  type="button"
                  size="sm"
                  variant="ghost"
                  @click="cancelEdit"
                  :disabled="isLoading"
                >
                  Cancel
                </UButton>
              </div>
            </UForm>

            <div v-else class="space-y-3">
              <div>
                <label class="text-xs text-gray-600 dark:text-gray-400"
                  >Alt Text</label
                >
                <p class="text-sm mt-1">
                  {{ media.altText || "No alt text set" }}
                </p>
              </div>
              <div>
                <label class="text-xs text-gray-600 dark:text-gray-400"
                  >Caption</label
                >
                <p class="text-sm mt-1">
                  {{ media.caption || "No caption set" }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end">
        <UButton variant="ghost" @click="emit('close')"> Close </UButton>
      </div>
    </template>
  </UModal>
</template>

