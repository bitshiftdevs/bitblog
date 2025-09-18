<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';
import type { EditorView } from '~~/shared/types';
const editorStore = useEditorStore();
const seoStore = useSeoStore();
const auth = useAuth();

const view = ref<EditorView>('editor');
// Define emits
const emit = defineEmits([
  'toggle-sidebar',
  'status-change',
  'change-view',
  'change-device',
  'open-modal',
]);

const changeView = (newView: EditorView) => {
  view.value = newView;
  emit('change-view', newView);
};

const items: NavigationMenuItem[][] = [
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
      active: view.value === 'editor',
      onSelect() {
        changeView('editor');
      },
    },
    {
      label: 'Preview',
      icon: 'i-lucide-view',
      active: view.value === 'preview',
      onSelect() {
        changeView('editor');
      },
    },
    {
      label: 'Code',
      icon: 'i-lucide-code-xml',
      active: view.value === 'code',
      onSelect() {
        changeView('code');
      },
    },
  ],
  [
    {
      badge: {
        label: `SEO: ${seoStore.seoScore}`,
        icon: 'i-lucide-heart-pulse',
        variant: 'outline',
        size: 'md',
        color: getStatusColor(seoStore.seoScore),
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
];
</script>

<template>
  <UDashboardToolbar>
    <UNavigationMenu :items="items" highlight class="flex-1" />
  </UDashboardToolbar>
</template>
