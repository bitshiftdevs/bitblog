<script setup lang="ts">
import CategoryModal from '~/components/Admin/CategoryModal.vue';
import type { Category } from '~~/shared/types';
import { confirmAction } from '~/composables/useConfirmModal';

definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
});

const toast = useToast();
const overlay = useOverlay();
const modal = overlay.create(CategoryModal);

// Fetch categories (non-blocking)
const {
  data: categoriesData,
  refresh,
  pending: categoriesLoading,
} = useLazyFetch('/api/categories', {
  key: 'admin-categories-list',
});

const categories = computed(() => categoriesData.value?.data?.items || []);

// Search functionality
const searchQuery = ref('');
const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value;
  return categories.value.filter(
    (category: Category) =>
      category.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

// Create category
const createCategory = async () => {
  const instance = modal.open({
    title: 'Create Category',
    categories: (categories.value as unknown as Category[]) ?? [],
    onSubmit: async (data) => {
      try {
        await $fetch('/api/admin/categories', {
          method: 'POST',
          body: {
            name: data.name,
            slug: data.name?.toLowerCase().replace(/\s+/g, '-'),
            description: data.description || undefined,
            parentId: data.parentId || undefined,
          },
        });

        toast.add({
          title: 'Success',
          description: 'Category created successfully',
          color: 'success',
        });

        refresh();
      } catch (error: any) {
        toast.add({
          title: 'Error',
          description: error.data?.message || 'Failed to create category',
          color: 'error',
        });
      }
    },
  });
  await instance.result;
};

// Edit category
const editCategory = async (category: Category) => {
  const instance = modal.open({
    categories: (categories.value as unknown as Category[]) ?? [],
    category,
    title: 'Edit Category',
    onSubmit: async (data) => {
      try {
        await $fetch(`/api/admin/categories/${category.id}`, {
          method: 'PUT',
          body: {
            name: data.name,
            description: data.description || undefined,
            parentId: data.parentId || undefined,
          },
        });

        toast.add({
          title: 'Success',
          description: 'Category updated successfully',
          color: 'success',
        });

        refresh();
      } catch (error: any) {
        toast.add({
          title: 'Error',
          description: error.data?.message || 'Failed to update category',
          color: 'error',
        });
      }
    },
  });
  await instance.result;
};

// Delete category
const deleteCategory = async (category: Category) => {
  confirmAction({
    title: 'Delete Category',
    question: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
    onConfirm: async () => {
      try {
        await $fetch(`/api/admin/categories/${category.id}`, {
          method: 'DELETE',
        });

        toast.add({
          title: 'Success',
          description: 'Category deleted successfully',
          color: 'success',
        });

        refresh();
      } catch (error: any) {
        toast.add({
          title: 'Error',
          description: error.data?.message || 'Failed to delete category',
          color: 'error',
        });
      }
    }
  });
};

// Set breadcrumbs
const setBreadcrumbs = inject('setBreadcrumbs', () => {});
setBreadcrumbs([{ label: 'Dashboard', to: '/admin' }, { label: 'Categories' }]);
</script>

<template>
  <UContainer class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
          Categories
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Organize your content with categories
        </p>
      </div>
      <UButton @click="createCategory" icon="i-lucide-plus" size="sm">
        New Category
      </UButton>
    </div>

    <!-- Search -->
    <div class="flex items-center space-x-4">
      <UInput
        v-model="searchQuery"
        placeholder="Search categories..."
        icon="i-lucide-search"
        class="max-w-xs"
      />
    </div>

    <!-- Categories Table -->
    <UCard>
      <div v-if="categoriesLoading" class="p-8">
        <div class="animate-pulse space-y-4">
          <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
          <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
        </div>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Description
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Posts
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Created
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700"
          >
            <tr
              v-for="category in filteredCategories"
              :key="category.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div>
                    <div
                      class="text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {{ category.name }}
                    </div>
                    <div
                      v-if="category.parent"
                      class="text-xs text-gray-500 dark:text-gray-400"
                    >
                      Parent: {{ category.parent.name }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div
                  class="text-sm text-gray-900 dark:text-white max-w-xs truncate"
                >
                  {{ category.description || "No description" }}
                </div>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
              >
                {{ category._count?.posts || 0 }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
              >
                {{ formatDate(category.createdAt) }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
              >
                <div class="flex items-center justify-end space-x-2">
                  <UButton
                    @click="editCategory(category)"
                    icon="i-lucide-edit"
                    size="2xs"
                    color="accent"
                    variant="ghost"
                  />
                  <UButton
                    @click="deleteCategory(category)"
                    icon="i-lucide-trash"
                    size="2xs"
                    color="error"
                    variant="ghost"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="!filteredCategories.length" class="text-center py-12">
          <UIcon
            name="i-lucide-folder"
            class="mx-auto h-12 w-12 text-gray-400"
          />
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No categories
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating a new category.
          </p>
        </div>
      </div>
    </UCard>
  </UContainer>
</template>
