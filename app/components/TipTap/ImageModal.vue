<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui';
import type { SetImageOptions } from '@tiptap/extension-image';
import type { Editor } from '#imports';
import type { Media } from '~~/shared/types';

const editorStore = useEditorStore();
const route = useRoute();
const router = useRouter();

const { editor, isFeatured } = defineProps<{
  editor: Editor;
  isFeatured: boolean;
}>();
// Reactive state
const imageUrl = ref('');
const imageAlt = ref('');
const imageWidth = ref<number>();
const imageHeight = ref<number>();
// const activeTab = ref<'url' | 'upload' | 'library'>('url');
const activeTab = computed({
  get() {
    return (route.query?.tab as string) || 'url';
  },
  set(tab) {
    // Hash is specified here to prevent the page from scrolling to the top
    router.replace({
      path: route.path,
      query: { tab },
      hash: '#control-active-item',
    });
  },
});
const imageLibrary = ref<Media[]>([]);
const selectedLibraryImage = ref<Media | null>(null);
const uploadProgress = ref(0);
const isUploading = ref(false);
const isLoadingLibrary = ref(true);
const isDeleting = ref(false);
const errorMessage = ref('');
const uploadedImageUrl = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

// Initialize media library
onMounted(async () => {
  await loadImageLibrary();
});

async function loadImageLibrary() {
  isLoadingLibrary.value = true;
  errorMessage.value = '';

  try {
    const response = await $fetch('/api/media', {
      query: {
        mimeType: 'image',
        limit: 50,
      },
    });

    if (response.success) {
      imageLibrary.value = response.data.items;
    }
  } catch (error: any) {
    console.error('Error loading image library:', error);
    errorMessage.value = error.data?.message || 'Failed to load image library. Please try again.';
  } finally {
    isLoadingLibrary.value = false;
  }
}

function insertImage() {
  let src = '';

  if (activeTab.value === 'url' && imageUrl.value) {
    src = imageUrl.value;
  } else if (activeTab.value === 'upload' && uploadedImageUrl.value) {
    src = uploadedImageUrl.value;
  } else if (activeTab.value === 'library' && selectedLibraryImage.value) {
    src = selectedLibraryImage.value.url;
    if (!imageAlt.value) imageAlt.value = selectedLibraryImage.value.altText || selectedLibraryImage.value.filename;
  }

  if (src && !isFeatured) {
    const attrs: SetImageOptions = {
      src,
      alt: imageAlt.value,
    };

    if (imageWidth.value) attrs.width = imageWidth.value;
    if (imageHeight.value) attrs.height = imageHeight.value;

    editor.chain().focus().setImage(attrs).run();
  } else if (src && isFeatured) {
    editorStore.setFeaturedImage(src);
  }

  resetForm();
}

function resetForm() {
  imageUrl.value = '';
  imageAlt.value = '';
  imageWidth.value = undefined;
  imageHeight.value = undefined;
  selectedLibraryImage.value = null;
  uploadedImageUrl.value = '';
  uploadProgress.value = 0;
  isUploading.value = false;
  errorMessage.value = '';
  emit('close', true);
}

async function handleFileSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  // Check file size (limit to 10MB)
  if (file.size > 10 * 1024 * 1024) {
    errorMessage.value = 'File is too large. Maximum size is 10MB.';
    return;
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Only image files are allowed.';
    return;
  }

  errorMessage.value = '';

  // Preview the image locally before upload
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedImageUrl.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);

  // Upload to our media API
  await uploadToAPI(file);
}

async function uploadToAPI(file: File) {
  isUploading.value = true;
  uploadProgress.value = 0;
  errorMessage.value = '';

  try {
    // Create form data for upload
    const formData = new FormData();
    formData.append('file', file);

    // Upload to our media API
    const response = await $fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
      onUploadProgress(progress) {
        uploadProgress.value = Math.round((progress.loaded / progress.total) * 100);
      },
    });

    if (response.success) {
      const uploadedMedia = Array.isArray(response.data) ? response.data[0] : response.data;
      uploadedImageUrl.value = uploadedMedia.url;

      // Refresh library to include the new image
      await loadImageLibrary();
    }

    isUploading.value = false;
  } catch (error: any) {
    console.error('Upload failed:', error);
    errorMessage.value = error.data?.message || 'Upload failed. Please try again.';
    isUploading.value = false;
  }
}

function selectLibraryImage(image: Media | null) {
  selectedLibraryImage.value = image;
}

async function deleteLibraryImage(image: Media, event: Event) {
  // Stop the click event from selecting the image
  event.stopPropagation();

  if (!confirm(`Are you sure you want to delete "${image.filename}"?`)) {
    return;
  }

  isDeleting.value = true;
  errorMessage.value = '';

  try {
    // Delete via our media API
    const response = await $fetch(`/api/media/${image.id}`, {
      method: 'DELETE',
    });

    if (response.success) {
      // If the deleted image was selected, clear selection
      if (selectedLibraryImage.value?.id === image.id) {
        selectedLibraryImage.value = null;
      }

      // Refresh the library
      await loadImageLibrary();
    }
  } catch (error: any) {
    console.error('Error deleting image:', error);
    errorMessage.value = error.data?.message || 'Failed to delete image. Please try again.';
  } finally {
    isDeleting.value = false;
  }
}

const items: TabsItem[] = [
  {
    key: 'url',
    value: 'url',
    label: 'URL',
    icon: 'i-lucide-link',
    slot: 'url',
  },
  {
    key: 'upload',
    value: 'upload',
    label: 'Upload',
    icon: 'i-lucide-image',
    slot: 'upload',
  },
  {
    key: 'library',
    value: 'library',
    label: 'Library',
    icon: 'i-lucide-images',
    slot: 'library',
  },
];

const emit = defineEmits<{
  close: [boolean];
}>();
</script>

<template>
  <UModal :title="isFeatured ? 'Set Featured Image' : 'Insert Image'">
    <template #body>
      <UTabs v-model="activeTab" :ui="{ trigger: 'grow' }" :items class="mb-4">
        <template #url>
          <div class="space-y-4">
            <UFormField label="Image URL" required>
              <UInput
                v-model="imageUrl"
                placeholder="https://example.com/image.jpg"
                type="url"
              />
            </UFormField>
          </div>
        </template>

        <template #upload>
          <div class="space-y-4">
            <UFormField label="Upload Image">
              <UInput
                type="file"
                accept="image/*"
                @change="handleFileSelect"
                ref="fileInput"
              />
            </UFormField>

            <div v-if="isUploading" class="space-y-2">
              <UProgress :value="uploadProgress" />
              <p class="text-sm text-gray-600">
                Uploading: {{ uploadProgress }}%
              </p>
            </div>

            <div v-if="uploadedImageUrl" class="mt-4">
              <img
                :src="uploadedImageUrl"
                alt="Preview"
                class="max-h-40 rounded-lg shadow-md border"
              />
            </div>
          </div>
        </template>

        <template #library>
          <div class="space-y-4">
            <div
              v-if="isLoadingLibrary"
              class="flex justify-center items-center p-8"
            >
              <UIcon
                name="i-heroicons-arrow-path"
                class="h-6 w-6 animate-spin"
              />
              <span class="ml-2">Loading images...</span>
            </div>
            <div
              v-else-if="imageLibrary.length === 0"
              class="p-8 text-center text-gray-500"
            >
              <UIcon
                name="i-heroicons-photo"
                class="h-12 w-12 mx-auto mb-4 text-gray-300"
              />
              <p>No images found in the library</p>
            </div>
            <div v-else class="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto">
              <div
                v-for="image in imageLibrary"
                :key="image.id"
                :class="`relative cursor-pointer border rounded-lg p-2 group transition-all ${
                  selectedLibraryImage?.id === image.id
                    ? 'border-primary border-2 bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`"
                @click="selectLibraryImage(image)"
              >
                <img
                  :src="image.url"
                  :alt="image.altText || image.filename"
                  class="w-full h-24 object-cover rounded"
                />
                <p class="text-xs mt-1 truncate">
                  {{ image.altText || image.filename }}
                </p>

                <!-- Delete button -->
                <UButton
                  icon="i-heroicons-x-mark"
                  size="sm"
                  color="error"
                  variant="solid"
                  class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  @click.stop="deleteLibraryImage(image, $event)"
                  :disabled="isDeleting"
                  :loading="isDeleting"
                />
              </div>
            </div>
          </div>
        </template>
      </UTabs>

      <!-- Common Fields for All Tabs -->
      <div class="space-y-4 mt-6">
        <UFormField label="Alt Text">
          <UInput v-model="imageAlt" placeholder="Image description" />
        </UFormField>

        <div v-if="!isFeatured" class="grid grid-cols-2 gap-4">
          <UFormField label="Width">
            <UInput v-model="imageWidth" placeholder="e.g., 300px or 50%" />
          </UFormField>
          <UFormField label="Height">
            <UInput v-model="imageHeight" placeholder="e.g., 200px" />
          </UFormField>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton variant="ghost" @click="emit('close', true)"> Cancel </UButton>
        <UButton
          @click="insertImage"
          :disabled="
            (activeTab === 'url' && !imageUrl) ||
            (activeTab === 'upload' && !uploadedImageUrl) ||
            (activeTab === 'library' && !selectedLibraryImage) ||
            isUploading ||
            isDeleting
          "
          :loading="isUploading"
        >
          {{ editorStore.isFeatured ? "Set Featured Image" : "Insert Image" }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
/* Add any component-specific styles here */
</style>
