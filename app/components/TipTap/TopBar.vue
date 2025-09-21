<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';

const editorStore = useEditorStore();
const seoStore = useSeoStore();
const auth = useAuth();

// Define emits
const emit = defineEmits(['status-change', 'change-view', 'open-modal']);

const items = computed<NavigationMenuItem[][]>(() => [
  [
    { icon: 'i-lucide-menu', as: 'button', click: 'toggleSidebar' },
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
        { description: 'Save Draft', label: 'Sa' },
        { description: 'Publish' },
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
  <header>
    <UDashboardToolbar>
      <UNavigationMenu :items="items" highlight class="flex-1" />
    </UDashboardToolbar>
  </header>
</template>
