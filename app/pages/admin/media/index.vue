<script setup lang="ts">
import ImagePreviewModal from '~/components/Admin/ImagePreviewModal.vue';
import type { Media } from '~~/shared/types';

definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
});

const toast = useToast();
const fileInputRef = ref<HTMLInputElement>();
const selectedMedia = ref<Media[]>([]);
const isUploading = ref(false);

// Fetch media (non-blocking)
const {
  data: mediaData,
  refresh,
  pending: mediaLoading,
} = useLazyFetch('/api/media', {
  key: 'admin-media-list',
  default: () => ({ success: false, data: { items: [] } }),
});

const mediaItems = computed(() => mediaData.value?.data?.items || []);

// Search and filter
const searchQuery = ref('');
const selectedType = ref('all');

const filteredMedia = computed(() => {
  let filtered = mediaItems.value;

  if (searchQuery.value) {
    filtered = filtered.filter(
      (item: Media) =>
        item.filename.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        item.altText?.toLowerCase().includes(searchQuery.value.toLowerCase()),
    );
  }

  if (selectedType.value !== 'all') {
    filtered = filtered.filter((item: Media) => item.mimeType.startsWith(selectedType.value));
  }

  return filtered;
});

const typeOptions = [
  { label: 'All Files', value: 'all' },
  { label: 'Images', value: 'image' },
  { label: 'Videos', value: 'video' },
  { label: 'Documents', value: 'application' },
];

// Upload functionality
const handleUploadClick = () => {
  fileInputRef.value?.click();
};

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);

  if (!files.length) return;

  isUploading.value = true;

  try {
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      await $fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });
    }

    toast.add({
      title: 'Success',
      description: `${files.length} file(s) uploaded successfully`,
      color: 'success',
    });

    refresh();
  } catch (error: any) {
    toast.add({
      title: 'Upload failed',
      description: error.data?.message || 'Failed to upload files',
      color: 'error',
    });
  } finally {
    isUploading.value = false;
    target.value = '';
  }
};

// Selection management
const toggleSelection = (media: Media) => {
  const index = selectedMedia.value.findIndex((item) => item.id === media.id);
  if (index === -1) {
    selectedMedia.value.push(media);
  } else {
    selectedMedia.value.splice(index, 1);
  }
};

const viewMedia = (media: Media) => {
  const overlay = useOverlay();
  const modal = overlay.create(ImagePreviewModal);
  modal.open({
    media,
  });
};

const isSelected = (media: Media) => {
  return selectedMedia.value.some((item) => item.id === media.id);
};

const selectAll = () => {
  if (selectedMedia.value.length === filteredMedia.value.length) {
    selectedMedia.value = [];
  } else {
    selectedMedia.value = [...filteredMedia.value];
  }
};

// Delete functionality
const deleteSelected = async () => {
  if (!selectedMedia.value.length) return;

  const confirmed = confirm(`Are you sure you want to delete ${selectedMedia.value.length} file(s)?`);
  if (!confirmed) return;

  try {
    for (const media of selectedMedia.value) {
      await $fetch(`/api/media/${media.id}`, {
        method: 'DELETE',
      });
    }

    toast.add({
      title: 'Success',
      description: `${selectedMedia.value.length} file(s) deleted successfully`,
      color: 'success',
    });

    selectedMedia.value = [];
    refresh();
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to delete files',
      color: 'error',
    });
  }
};

// Helper functions
const formatFileSize = (bytes: number) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
};

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return 'i-lucide-image';
  if (mimeType.startsWith('video/')) return 'i-lucide-video';
  if (mimeType.startsWith('audio/')) return 'i-lucide-music';
  if (mimeType.includes('pdf')) return 'i-lucide-file-text';
  return 'i-lucide-file';
};

// Set breadcrumbs
const setBreadcrumbs = inject('setBreadcrumbs', () => {});
setBreadcrumbs([{ label: 'Dashboard', to: '/admin' }, { label: 'Media Library' }]);
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
          Media Library
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Manage your images, videos, and other media files
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <UButton
          v-if="selectedMedia.length"
          @click="deleteSelected"
          color="red"
          variant="outline"
          size="sm"
          icon="i-lucide-trash"
        >
          Delete ({{ selectedMedia.length }})
        </UButton>
        <input
          ref="fileInputRef"
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx"
          @change="handleFileUpload"
          class="hidden"
        />
        <UButton
          @click="handleUploadClick"
          :loading="isUploading"
          icon="i-lucide-upload"
          size="sm"
        >
          Upload Files
        </UButton>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <UInput
          v-model="searchQuery"
          placeholder="Search media..."
          icon="i-lucide-search"
          class="w-64"
        />
        <USelectMenu
          v-model="selectedType"
          :options="typeOptions"
          class="w-40"
        />
      </div>

      <div class="flex items-center space-x-3">
        <UCheckbox
          :checked="
            selectedMedia.length === filteredMedia.length &&
            filteredMedia.length > 0
          "
          :indeterminate="
            selectedMedia.length > 0 &&
            selectedMedia.length < filteredMedia.length
          "
          @change="selectAll"
          label="Select all"
        />
        <span class="text-sm text-gray-500">
          {{ filteredMedia.length }} files
        </span>
      </div>
    </div>

    <!-- Media Grid -->
    <div
      v-if="mediaLoading"
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
    >
      <div v-for="i in 12" :key="i" class="animate-pulse">
        <div
          class="bg-gray-300 dark:bg-gray-600 rounded-lg aspect-square"
        ></div>
      </div>
    </div>
    <div
      v-else
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
    >
      <div
        v-for="media in filteredMedia"
        :key="media.id"
        class="group relative bg-white dark:bg-gray-900 border-2 rounded-lg overflow-hidden hover:shadow-md transition-all cursor-pointer"
        :class="
          isSelected(media)
            ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800'
            : 'border-gray-200 dark:border-gray-700'
        "
        @click="toggleSelection(media)"
      >
        <!-- Selection checkbox -->
        <div class="absolute top-2 left-2 z-10">
          <UCheckbox
            :checked="isSelected(media)"
            @click.stop="toggleSelection(media)"
          />
        </div>

        <!-- Media preview -->
        <div
          class="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
        >
          <NuxtImg
            v-if="media.mimeType.startsWith('image/')"
            :src="media.url"
            :alt="media.altText || media.filename"
            class="w-full h-full object-cover"
            loading="lazy"
          />
          <UIcon
            v-else
            :name="getFileIcon(media.mimeType)"
            class="w-12 h-12 text-gray-400"
          />
        </div>

        <!-- Media info -->
        <div class="p-3">
          <h3
            class="text-sm font-medium text-gray-900 dark:text-white truncate"
          >
            {{ media.filename }}
          </h3>
          <div
            class="mt-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"
          >
            <span>{{ formatFileSize(media.size) }}</span>
            <span>{{ formatDate(media.createdAt) }}</span>
          </div>
          <div
            v-if="media.width && media.height"
            class="mt-1 text-xs text-gray-500 dark:text-gray-400"
          >
            {{ media.width }} × {{ media.height }}
          </div>
        </div>

        <!-- Hover overlay -->
        <div
          class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100"
        >
          <div class="flex space-x-2">
            <UButton
              size="xs"
              color="neutral"
              variant="solid"
              icon="i-lucide-eye"
              @click.stop="viewMedia(media)"
            />
            <UButton
              size="xs"
              color="primary"
              variant="solid"
              icon="i-lucide-download"
              @click.stop="() => {}"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="!filteredMedia.length && !mediaLoading"
      class="text-center py-12"
    >
      <UIcon name="i-lucide-image" class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        {{ searchQuery ? "No files found" : "No media files" }}
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{
          searchQuery
            ? "Try adjusting your search."
            : "Get started by uploading some files."
        }}
      </p>
      <div v-if="!searchQuery" class="mt-6">
        <UButton @click="handleUploadClick" icon="i-lucide-upload">
          Upload your first file
        </UButton>
      </div>
    </div>

    <!-- Upload progress indicator -->
    <div
      v-if="isUploading"
      class="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg"
    >
      <div class="flex items-center space-x-3">
        <UIcon name="i-lucide-upload" class="w-5 h-5 animate-pulse" />
        <span class="text-sm font-medium">Uploading files...</span>
      </div>
    </div>
  </div>
</template>

