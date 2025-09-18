<script setup lang="ts">
import type { PostStatus } from '~~/shared/types';

// Get editor state and methods from composable
const editorStore = useEditorStore();
const seoStore = useSeoStore();
const auth = useAuth();

// Local state
const currentView = ref('editor');
const devicePreview = ref('desktop');

// Methods
const toggleSidebar = () => {
  // Emit event to parent to toggle sidebar
  emit('toggle-sidebar');
};

const changeView = (view: any) => {
  currentView.value = view;
  // Emit event to parent
  emit('change-view', view);
};

const setDevicePreview = (device: any) => {
  devicePreview.value = device;
  // Emit event to parent
  emit('change-device', device);
};

const openSeoSettings = () => {
  emit('open-modal', 'seo');
};

const openPostSettings = () => {
  emit('open-modal', 'post-settings');
};

const openFeaturedImage = () => {
  emit('open-modal', 'featured-image');
};

const openCategories = () => {
  emit('open-modal', 'categories');
};

const openPermalink = () => {
  emit('open-modal', 'permalink');
};

const openExcerpt = () => {
  emit('open-modal', 'excerpt');
};

const savePost = async (status: PostStatus) => {
  const { success, msg } = await editorStore.saveContent(
    status,
    auth.user?.value?.id,
  );
  emit('status-change', { success, msg });
};

const showTemplateLibrary = () => {
  emit('open-modal', 'templates');
};

// Define emits
const emit = defineEmits([
  'toggle-sidebar',
  'status-change',
  'change-view',
  'change-device',
  'open-modal',
]);

// Watch for changes
watch(
  () => editorStore.title,
  (newTitle) => {
    // Update document title
    document.title = newTitle ? `${newTitle} - Editor` : 'Blog Editor';
  },
);

// Lifecycle
onMounted(() => {
  // Initial setup
  document.title = editorStore.title
    ? `${editorStore.title} - Editor`
    : 'Blog Editor';
});
</script>
<!-- src/components/editor/EditorTopBar.vue -->
<template>
  <div
    class="editor-top-bar flex items-center justify-between bg-base-100 border-b border-base-300 px-4 py-2 sticky top-0 z-10"
  >
    <!-- Left section: Logo and page title -->
    <div class="flex items-center gap-3">
      <button @click="toggleSidebar" class="btn btn-sm btn-ghost">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <div class="font-bold">{{ editorStore.title || "Untitled Post" }}</div>
      <div class="badge badge-outline">
        {{ editorStore.isDirty ? "Unsaved" : "Saved" }}
      </div>
    </div>

    <!-- Center section: Format/View controls -->
    <div class="flex items-center gap-2">
      <div class="btn-group">
        <button
          class="btn btn-sm"
          :class="{ 'btn-primary': currentView === 'editor' }"
          @click="changeView('editor')"
        >
          Editor
        </button>
        <button
          class="btn btn-sm"
          :class="{ 'btn-primary': currentView === 'preview' }"
          @click="changeView('preview')"
        >
          Preview
        </button>
        <button
          class="btn btn-sm"
          :class="{ 'btn-primary': currentView === 'code' }"
          @click="changeView('code')"
        >
          HTML
        </button>
      </div>

      <div class="divider divider-horizontal mx-1"></div>

      <div class="dropdown dropdown-bottom">
        <label tabindex="0" class="btn btn-sm">
          <span>Device</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 ml-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </label>
        <ul
          tabindex="0"
          class="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-48"
        >
          <li>
            <a @click="setDevicePreview('desktop')">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              Desktop
            </a>
          </li>
          <li>
            <a @click="setDevicePreview('tablet')">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12" y2="18"></line>
              </svg>
              Tablet
            </a>
          </li>
          <li>
            <a @click="setDevicePreview('mobile')">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="7" y="2" width="10" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12" y2="18"></line>
              </svg>
              Mobile
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Right section: Actions -->
    <div class="flex items-center gap-2">
      <button
        @click="openSeoSettings"
        class="btn btn-sm btn-outline gap-1"
        :class="{
          'btn-success': seoStore.seoScore >= 80,
          'btn-warning': seoStore.seoScore >= 50 && seoStore.seoScore < 80,
          'btn-error': seoStore.seoScore < 50,
        }"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 20h9"></path>
          <path
            d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
          ></path>
        </svg>
        SEO
        <div class="badge badge-sm">{{ seoStore.seoScore }}</div>
      </button>

      <div class="dropdown dropdown-end">
        <label tabindex="0" class="btn btn-sm btn-outline">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 20v-6M6 20V10M18 20V4"></path>
          </svg>
          Settings
        </label>
        <ul
          tabindex="0"
          class="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li><a @click="openPostSettings">Post Settings</a></li>
          <li><a @click="openFeaturedImage">Featured Image</a></li>
          <li><a @click="openCategories">Categories & Tags</a></li>
          <li><a @click="openPermalink">Permalink</a></li>
          <li><a @click="openExcerpt">Excerpt</a></li>
        </ul>
      </div>

      <div class="dropdown dropdown-end">
        <label tabindex="0" class="btn btn-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5 5-5-5M12 12.8V2.5"
            ></path>
          </svg>
          Save
        </label>
        <ul
          tabindex="0"
          class="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li><a @click="savePost('DRAFT')">Save as Draft</a></li>
          <li><a @click="savePost('PUBLISHED')">Publish</a></li>
          <li><a @click="savePost('SCHEDULED')">Schedule</a></li>
        </ul>
      </div>

      <button @click="showTemplateLibrary" class="btn btn-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 mr-1"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="3" x2="9" y2="21"></line>
        </svg>
        Templates
      </button>
    </div>
  </div>
</template>

<style scoped>
.editor-top-bar {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>
