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
      label: `SEO: ${seoStore.seoScore}`,
      icon: 'i-lucide-heart-pulse',
      class: 'secondary',
    },
    {
      label: 'Save',
      icon: 'i-lucide-save',
    },
  ],
];
</script>

<template>
  <UDashboardToolbar>
    <UNavigationMenu :items="items" highlight class="flex-1" />
  </UDashboardToolbar>
</template>
