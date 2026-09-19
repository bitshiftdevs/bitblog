<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { ActionItem } from '~/components/AdminDataTable.vue';
import type { PostSummary } from '~~/shared/types';

definePageMeta({ layout: 'admin' });

const selectedStatus = ref<string | null>(null);
const selectedAuthor = ref<string | null>(null);
const searchQuery = ref('');
const postsLoading = ref(false);
const posts = ref<PostSummary[]>([]);
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
});

const statusOptions = [
  { label: 'All Statuses', value: null },
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'draft' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Archived', value: 'archived' },
];

const authorOptions = computed(() => [
  { label: 'All Authors', value: null },
  ...Array.from(new Set(posts.value.map((p) => p.author.name))).map((name) => ({
    label: name,
    value: name,
  })),
]);

const filteredPosts = computed(() => {
  if (!selectedAuthor.value) return posts.value;
  return posts.value.filter((post) => post.author.name === selectedAuthor.value);
});

const loadPosts = async () => {
  postsLoading.value = true;
  try {
    const query: any = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    };
    if (selectedStatus.value) query.status = selectedStatus.value;
    if (searchQuery.value) query.search = searchQuery.value;

    const response = await $fetch('/api/posts', { query });
    if (response.success) {
      posts.value = response.data.items;
      pagination.value = response.data.pagination;
    }
  } catch (e) {
    console.error('Failed to load posts:', e);
  } finally {
    postsLoading.value = false;
  }
};

onMounted(() => loadPosts());

watch([selectedStatus, searchQuery], () => {
  pagination.value.page = 1;
  loadPosts();
});

const clearFilters = () => {
  selectedStatus.value = null;
  selectedAuthor.value = null;
  searchQuery.value = '';
};

const deletePost = (post: PostSummary) => {
  confirmAction({
    title: 'Delete Post',
    question: `Are you sure you want to delete "${post.title}"? This action cannot be undone.`,
    confirmLabel: 'Delete',
    confirmColor: 'error',
    onConfirm: () => {
      posts.value = posts.value.filter((p) => p.id !== post.id);
    },
  });
};

const toast = useToast();

const updatePostStatus = async (post: PostSummary, status: 'published' | 'draft') => {
  try {
    const response: any = await $fetch(`/api/posts/${post.id}`, {
      method: 'PUT',
      body: { status },
    });
    if (response?.success) {
      const idx = posts.value.findIndex((p) => p.id === post.id);
      if (idx !== -1) {
        posts.value[idx] = { ...posts.value[idx], ...response.data };
      }
      toast.add({
        title: 'Success',
        description: `Post ${status === 'published' ? 'published' : 'moved to draft'}`,
        color: 'success',
      });
    }
  } catch (e: any) {
    toast.add({
      title: 'Error',
      description: e.data?.message || 'Failed to update post',
      color: 'error',
    });
  }
};

const publishPost = (post: PostSummary) => {
  confirmAction({
    title: 'Publish Post',
    question: `Publish "${post.title}" now? It will become visible to everyone.`,
    confirmLabel: 'Publish',
    confirmColor: 'success',
    onConfirm: () => updatePostStatus(post, 'published'),
  });
};

const unpublishPost = (post: PostSummary) => {
  confirmAction({
    title: 'Move to Draft',
    question: `Move "${post.title}" back to draft? It will no longer be visible to readers.`,
    confirmLabel: 'Move to Draft',
    confirmColor: 'warning',
    onConfirm: () => updatePostStatus(post, 'draft'),
  });
};

const UAvatar = resolveComponent('UAvatar');
const UBadge = resolveComponent('UBadge');
const NuxtImg = resolveComponent('NuxtImg');
const UIcon = resolveComponent('UIcon');

const columns: TableColumn<PostSummary>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) =>
      h('div', { class: 'flex items-center gap-4' }, [
        h(
          'div',
          { class: 'flex-shrink-0 h-12 w-12 rounded-xl overflow-hidden shadow-sm bg-primary/10 flex items-center justify-center' },
          row.original.featuredImage
            ? h(NuxtImg, {
                src: row.original.featuredImage,
                alt: row.original.title,
                class: 'h-full w-full object-cover',
              })
            : h(UIcon, { name: 'i-lucide-image', class: 'h-5 w-5 text-primary/50' }),
        ),
        h('div', undefined, [
          h('div', { class: 'text-sm font-bold text-highlighted' }, row.original.title),
          h(
            'div',
            { class: 'text-xs text-muted max-w-[200px] lg:max-w-xs truncate mt-0.5' },
            row.original.excerpt || 'No excerpt',
          ),
        ]),
      ]),
  },
  {
    accessorKey: 'author',
    header: 'Author',
    cell: ({ row }) =>
      h('div', { class: 'flex items-center gap-2' }, [
        h(UAvatar, {
          src: row.original.author.avatarUrl,
          alt: row.original.author.name,
          size: 'sm',
        }),
        h('span', { class: 'text-sm font-medium text-highlighted' }, row.original.author.name),
      ]),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) =>
      h(UBadge, {
        label: row.original.status,
        color: getStatusColor(row.original.status),
        variant: 'subtle',
        class: 'capitalize font-semibold',
      }),
  },
  {
    accessorKey: 'publishedAt',
    header: 'Published',
    cell: ({ row }) =>
      h(
        'span',
        { class: 'text-sm text-muted' },
        row.original.publishedAt ? formatDate(row.original.publishedAt) : '-',
      ),
  },
  {
    accessorKey: 'viewCount',
    header: 'Views',
    cell: ({ row }) => h('span', { class: 'text-sm text-muted' }, String(row.original.viewCount || 0)),
  },
];

const actions: ActionItem<PostSummary>[] = [
  {
    label: 'View',
    icon: 'i-lucide-external-link',
    onClick: (post) => window.open(`/posts/${post.slug}`, '_blank'),
  },
  {
    label: 'Edit',
    icon: 'i-lucide-edit-3',
    onClick: (post) => navigateTo(`/admin/posts/${post.slug}`),
  },
  {
    label: 'Publish',
    icon: 'i-lucide-send',
    color: 'success',
    onClick: (post) => publishPost(post),
    hidden: (post) => post.status === 'published',
  },
  {
    label: 'Move to Draft',
    icon: 'i-lucide-file-edit',
    onClick: (post) => unpublishPost(post),
    hidden: (post) => post.status !== 'published',
  },
  {
    label: 'Delete',
    icon: 'i-lucide-trash-2',
    color: 'error',
    onClick: (post) => deletePost(post),
  },
];

const setBreadcrumbs = inject('setBreadcrumbs', () => {});
setBreadcrumbs([{ label: 'Dashboard', to: '/admin' }, { label: 'Posts' }]);
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <AdminDataTable
      :data="filteredPosts"
      :columns="columns"
      :loading="postsLoading"
      title="Posts"
      description="Manage and organize your blog content"
      :actions="actions"
      :row-click="(post: PostSummary) => navigateTo(`/admin/posts/${post.slug}`)"
      :show-selection="false"
      :show-filter="false"
      :show-pagination="false"
      :empty-state="{
        icon: 'i-lucide-file-x',
        title: 'No posts found',
        description:
          searchQuery || selectedStatus || selectedAuthor
            ? 'Try adjusting your filters to find what you\'re looking for.'
            : 'Get started by creating your very first post!',
        actions:
          !searchQuery && !selectedStatus && !selectedAuthor
            ? [{ label: 'Create First Post', to: '/admin/posts/new', icon: 'i-lucide-plus' }]
            : [],
      }"
    >
      <UButton
        to="/admin/posts/new"
        icon="i-lucide-plus"
        size="lg"
        label="New Post"
      />

      <template #filters>
        <div class="flex flex-wrap items-center gap-4">
          <USelectMenu
            v-model="selectedStatus"
            :items="statusOptions"
            value-key="value"
            placeholder="All Statuses"
            class="w-full sm:w-48"
            size="lg"
          />

          <USelectMenu
            v-model="selectedAuthor"
            :items="authorOptions"
            value-key="value"
            placeholder="All Authors"
            class="w-full sm:w-48"
            size="lg"
          />

          <UInput
            v-model="searchQuery"
            placeholder="Search posts..."
            icon="i-lucide-search"
            class="flex-1 min-w-[200px]"
            size="lg"
          >
            <template #trailing>
              <UButton
                v-show="searchQuery !== ''"
                color="neutral"
                variant="link"
                icon="i-lucide-x"
                :padded="false"
                @click="searchQuery = ''"
              />
            </template>
          </UInput>

          <UButton
            v-if="selectedStatus || selectedAuthor || searchQuery"
            variant="soft"
            size="lg"
            @click="clearFilters"
          >
            Clear
          </UButton>
        </div>
      </template>
    </AdminDataTable>

    <div
      v-if="pagination.totalPages > 1"
      class="flex justify-center pt-6"
    >
      <UPagination
        v-model:page="pagination.page"
        :items-per-page="pagination.limit"
        :total="pagination.total"
        show-last
        show-first
        @update:page="loadPosts"
      />
    </div>
  </div>
</template>
