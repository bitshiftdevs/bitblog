<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import CategoryModal from '~/components/Admin/CategoryModal.vue';
import type { ActionItem } from '~/components/AdminDataTable.vue';
import type { Category } from '~~/shared/types';
import { confirmAction } from '~/composables/useConfirmModal';

definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
});

const toast = useToast();
const overlay = useOverlay();
const modal = overlay.create(CategoryModal);

const {
  data: categoriesData,
  refresh,
  pending: categoriesLoading,
} = useLazyFetch('/api/categories', { key: 'admin-categories-list' });

const categories = computed<Category[]>(() => categoriesData.value?.data?.items || []);

const searchQuery = ref('');
const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value;
  const q = searchQuery.value.toLowerCase();
  return categories.value.filter(
    (c) => c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q),
  );
});

const createCategory = async () => {
  const instance = modal.open({
    title: 'Create Category',
    categories: categories.value,
    onSubmit: async (data) => {
      try {
        await $fetch('/api/categories', {
          method: 'POST',
          body: {
            name: data.name,
            slug: data.name?.toLowerCase().replace(/\s+/g, '-'),
            description: data.description || undefined,
            parentId: data.parentId || undefined,
          },
        });
        toast.add({ title: 'Success', description: 'Category created successfully', color: 'success' });
        refresh();
      } catch (error: any) {
        toast.add({ title: 'Error', description: error.data?.message || 'Failed to create category', color: 'error' });
      }
    },
  });
  await instance.result;
};

const editCategory = async (category: Category) => {
  const instance = modal.open({
    categories: categories.value,
    category,
    title: 'Edit Category',
    onSubmit: async (data) => {
      try {
        await $fetch(`/api/categories/${category.id}`, {
          method: 'PUT',
          body: {
            name: data.name,
            description: data.description || undefined,
            parentId: data.parentId || undefined,
          },
        });
        toast.add({ title: 'Success', description: 'Category updated successfully', color: 'success' });
        refresh();
      } catch (error: any) {
        toast.add({ title: 'Error', description: error.data?.message || 'Failed to update category', color: 'error' });
      }
    },
  });
  await instance.result;
};

const deleteCategory = (category: Category) => {
  confirmAction({
    title: 'Delete Category',
    question: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
    confirmLabel: 'Delete',
    confirmColor: 'error',
    onConfirm: async () => {
      try {
        await $fetch(`/api/categories/${category.id}`, { method: 'DELETE' });
        toast.add({ title: 'Success', description: 'Category deleted successfully', color: 'success' });
        refresh();
      } catch (error: any) {
        toast.add({ title: 'Error', description: error.data?.message || 'Failed to delete category', color: 'error' });
      }
    },
  });
};

const columns: TableColumn<Category>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) =>
      h('div', undefined, [
        h('div', { class: 'text-sm font-medium text-highlighted' }, row.original.name),
        row.original.parent
          ? h('div', { class: 'text-xs text-muted' }, `Parent: ${row.original.parent.name}`)
          : null,
      ]),
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) =>
      h('div', { class: 'text-sm text-muted max-w-xs truncate' }, row.original.description || 'No description'),
  },
  {
    accessorKey: 'posts',
    header: 'Posts',
    cell: ({ row }) => h('span', { class: 'text-sm text-muted' }, String(row.original._count?.posts || 0)),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => h('span', { class: 'text-sm text-muted' }, formatDate(row.original.createdAt)),
  },
];

const actions: ActionItem<Category>[] = [
  { label: 'Edit', icon: 'i-lucide-edit', onClick: (c) => editCategory(c) },
  { label: 'Delete', icon: 'i-lucide-trash', color: 'error', onClick: (c) => deleteCategory(c) },
];

const setBreadcrumbs = inject('setBreadcrumbs', () => {});
setBreadcrumbs([{ label: 'Dashboard', to: '/admin' }, { label: 'Categories' }]);
</script>

<template>
  <UContainer class="py-8">
    <AdminDataTable
      :data="filteredCategories"
      :columns="columns"
      :actions="actions"
      :loading="categoriesLoading"
      title="Categories"
      description="Organize your content with categories"
      :row-click="editCategory"
      :show-selection="false"
      :show-filter="false"
      :empty-state="{
        icon: 'i-lucide-folder',
        title: 'No categories',
        description: 'Get started by creating a new category.',
        actions: [{ label: 'New Category', icon: 'i-lucide-plus', onClick: createCategory } as any],
      }"
    >
      <UButton @click="createCategory" icon="i-lucide-plus" size="lg" label="New Category" />

      <template #filters>
        <UInput
          v-model="searchQuery"
          placeholder="Search categories..."
          icon="i-lucide-search"
          class="max-w-xs"
        />
      </template>
    </AdminDataTable>
  </UContainer>
</template>
