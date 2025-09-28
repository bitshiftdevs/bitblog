<script setup lang="ts">
import TagModal from '~/components/Admin/TagModal.vue';
import type { Tag } from '~~/shared/types';

definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
});

const toast = useToast();
const overlay = useOverlay();
const modal = overlay.create(TagModal);

// Fetch tags (non-blocking)
const {
  data: tagsData,
  refresh,
  pending: tagsLoading,
} = useLazyFetch('/api/tags', {
  key: 'admin-tags-list',
  default: () => ({ success: false, data: { items: [] } }),
});

const tags = computed(() => tagsData.value?.data?.items || []);

// Search functionality
const searchQuery = ref('');
const filteredTags = computed(() => {
  if (!searchQuery.value) return tags.value;
  return tags.value.filter(
    (tag: Tag) =>
      tag.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      tag.description?.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

// Create tag
const createTag = async () => {
  const instance = modal.open({
    title: 'Create Tag',
    tags: (tags.value as unknown as Tag[]) ?? [],
    onSubmit: async (formData) => {
      try {
        await $fetch('/api/admin/tags', {
          method: 'POST',
          body: {
            name: formData.name,
            slug: formData.name?.toLowerCase().replace(/\s+/g, '-'),
            description: formData.description || undefined,
            color: formData.color,
          },
        });

        toast.add({
          title: 'Success',
          description: 'Tag created successfully',
          color: 'success',
        });

        refresh();
      } catch (error: any) {
        toast.add({
          title: 'Error',
          description: error.data?.message || 'Failed to create tag',
          color: 'error',
        });
      }
    },
  });
  await instance.result;
};

// Edit tag
const editTag = async (tag: Tag) => {
  const instance = modal.open({
    title: 'Edit Tag',
    tag,
    tags: (tags.value as unknown as Tag[]) ?? [],
    onSubmit: async (formData) => {
      try {
        await $fetch(`/api/admin/tags/${tag.id}`, {
          method: 'PUT',
          body: {
            name: formData.name,
            description: formData.description || undefined,
            color: formData.color,
          },
        });

        toast.add({
          title: 'Success',
          description: 'Tag updated successfully',
          color: 'success',
        });

        refresh();
      } catch (error: any) {
        toast.add({
          title: 'Error',
          description: error.data?.message || 'Failed to update tag',
          color: 'error',
        });
      }
    },
  });
  await instance.result;
};

// Delete tag
const deleteTag = async (tag: Tag) => {
  const confirmed = confirm(`Are you sure you want to delete "${tag.name}"?`);
  if (!confirmed) return;

  try {
    await $fetch(`/api/admin/tags/${tag.id}`, {
      method: 'DELETE',
    });

    toast.add({
      title: 'Success',
      description: 'Tag deleted successfully',
      color: 'success',
    });

    refresh();
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to delete tag',
      color: 'error',
    });
  }
};

// Predefined colors
const tagColors = [
  '#3B82F6',
  '#EF4444',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
  '#F97316',
  '#6366F1',
];

// Set breadcrumbs
const setBreadcrumbs = inject('setBreadcrumbs', () => {});
setBreadcrumbs([{ label: 'Dashboard', to: '/admin' }, { label: 'Tags' }]);
</script>

<template>
  <UContainer class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
          Tags
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Label and organize your content with tags
        </p>
      </div>
      <UButton @click="createTag" icon="i-lucide-plus" size="sm">
        New Tag
      </UButton>
    </div>

    <!-- Search -->
    <div class="flex items-center space-x-4">
      <UInput
        v-model="searchQuery"
        placeholder="Search tags..."
        icon="i-lucide-search"
        class="max-w-xs"
      />
    </div>

    <!-- Tags Grid -->
    <div
      v-if="tagsLoading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <div v-for="i in 6" :key="i" class="animate-pulse">
        <div class="bg-gray-300 dark:bg-gray-600 rounded-lg h-24"></div>
      </div>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="tag in filteredTags"
        :key="tag.id"
        class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2 mb-2">
              <div
                class="w-3 h-3 rounded-full"
                :style="{ backgroundColor: tag.color || '#3B82F6' }"
              ></div>
              <h3
                class="text-sm font-medium text-gray-900 dark:text-white truncate"
              >
                {{ tag.name }}
              </h3>
            </div>
            <p
              v-if="tag.description"
              class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3"
            >
              {{ tag.description }}
            </p>
            <div
              class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"
            >
              <span>{{ tag._count?.posts || 0 }} posts</span>
              <span>{{ formatDate(tag.createdAt) }}</span>
            </div>
          </div>

          <UDropdownMenu
            :items="[
              [
                {
                  label: 'Edit',
                  icon: 'i-lucide-edit',
                  color: 'info',
                  onSelect: () => editTag(tag),
                },
                {
                  label: 'Delete',
                  icon: 'i-lucide-trash',
                  color: 'error',
                  onSelect: () => deleteTag(tag),
                },
              ],
            ]"
          >
            <UButton
              icon="i-lucide-more-vertical"
              size="sm"
              color="info"
              variant="ghost"
            />
          </UDropdownMenu>
        </div>
      </div>
    </div>

    <div v-if="!filteredTags.length && !tagsLoading" class="text-center py-12">
      <UIcon name="i-lucide-tag" class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        No tags
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Get started by creating a new tag.
      </p>
    </div>
  </UContainer>
</template>
