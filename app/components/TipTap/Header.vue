<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui';

const editorStore = useEditorStore();
const seoStore = useSeoStore();
const auth = useAuth();
const toast = useToast();

// Define emits
const emit = defineEmits(['status-change', 'change-view', 'open-modal']);

// Save handlers with notifications
const handleSave = async (status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
  const result = await editorStore.saveContent(status);

  if (result.success) {
    toast.add({
      title: 'Success',
      description: result.msg,
      color: 'success',
    });
  } else {
    toast.add({
      title: 'Error',
      description: result.msg,
      color: 'error',
    });
  }
};

const userMenuItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: auth.user?.name || 'User',
      slot: 'account',
      disabled: true,
    },
  ],
  [
    {
      label: 'View Site',
      icon: 'i-lucide-square-arrow-up-right',
      to: '/',
      target: '_blank',
    },
    {
      label: 'Profile Settings',
      icon: 'i-lucide-user',
      to: '/profile',
    },
  ],
  [
    {
      label: 'Help & Support',
      icon: 'i-lucide-badge-question-mark',
      to: '/admin/help',
    },
    {
      label: 'Keyboard Shortcuts',
      icon: 'i-lucide-terminal',
      onSelect: () => {
        // Show keyboard shortcuts modal
      },
    },
  ],
  [
    {
      label: 'Sign Out',
      icon: 'i-lucide-log-out',
      onSelect: async () => {
        await auth.logout();
        await navigateTo('/auth');
      },
    },
  ],
]);
const items = computed<NavigationMenuItem[][]>(() => [
  [
    { label: editorStore.title || 'Untitled' },
    {
      badge: {
        label: editorStore.isDirty ? 'Unsaved' : 'saved',
        variant: 'outline',
        color: editorStore.isDirty ? 'warning' : 'success',
      },
    },
  ],
  [
    {
      label: 'Editor',
      icon: 'i-lucide-pencil-line',
      active: editorStore.view === 'editor',
      onSelect: () => editorStore.setView('editor'),
    },
    {
      label: 'Preview',
      icon: 'i-lucide-view',
      active: editorStore.view === 'preview',
      onSelect: () => editorStore.setView('preview'),
    },
    {
      label: 'Code',
      icon: 'i-lucide-code-xml',
      active: editorStore.view === 'code',
      onSelect: () => editorStore.setView('code'),
    },
  ],
  [
    {
      badge: {
        label: `SEO: ${seoStore.score}`,
        icon: 'i-lucide-heart-pulse',
        variant: 'outline',
        size: 'md',
        color: getStatusColor(seoStore.score),
      },
    },
    {
      label: 'Save',
      icon: 'i-lucide-save',
      children: [
        {
          label: 'Save Draft',
          icon: 'i-lucide-save',
          onSelect: () => handleSave('DRAFT'),
        },
        {
          label: 'Save Version',
          icon: 'i-lucide-save',
          onSelect: () => handleSave('ARCHIVED'),
        },
        {
          label: 'Save & Publish',
          icon: 'i-lucide-save',
          onSelect: () => handleSave('PUBLISHED'),
        },
      ],
      class: 'cursor-pointer',
    },
    {
      label: 'Templates',
      icon: 'i-lucide-backpack',
    },
  ],
]);
</script>

<template>
  <UHeader>
    <template #title>
      <NuxtImg src="/favicon.ico" class="h-6 w-auto" format="webp" />
    </template>
    <UNavigationMenu :items="items" highlight class="flex-1" />
    <template #right>
      <UDropdownMenu
        v-if="auth.isAuthenticated"
        :items="userMenuItems"
        :popper="{ placement: 'bottom-end' }"
      >
        <UButton variant="ghost" class="flex items-center space-x-2">
          <UAvatar
            :src="auth.user?.avatarUrl"
            :alt="auth.user?.name"
            size="sm"
          />
          <span class="hidden md:block text-sm font-medium">{{
            auth.user?.name
          }}</span>
          <UIcon name="i-lucide-chevron-down" class="h-4 w-4" />
        </UButton> </UDropdownMenu
    ></template>
  </UHeader>
</template>
