<script setup lang="ts">
import { MutationType } from 'pinia';
import { useBlogEditor } from '~/components/TipTap/useEditor';
import { useSeo } from '~/components/TipTap/useSeo';
import { useEditorStore } from '~/stores/editorStore';

const editorStore = useEditorStore();
const { destroyEditor } = useBlogEditor();
const { analyzeSeo } = useSeo();
const error = ref<string | undefined>(undefined);
const success = ref<string | undefined>(undefined);

const view = ref<'editor' | 'preview' | 'code'>('editor');

onMounted(() => {
  const slug = useRoute().params.slug as string;
  if (slug !== 'new') {
    editorStore.loadPost(slug);
  }
  // Auto-save every 30 seconds
  const autoSaveInterval = setInterval(() => {
    editorStore.saveContent('DRAFT');
  }, 30000);

  // Clean up on unmount
  onBeforeUnmount(() => {
    clearInterval(autoSaveInterval);
    destroyEditor();
  });
});
function updateStatus({ success: s, msg }: { success: boolean; msg: string }) {
  if (s) success.value = msg;
  else error.value = msg;
  setTimeout(() => {
    success.value = undefined;
    error.value = undefined;
  }, 3000);
}

function changeView(newView: 'editor' | 'preview' | 'code') {
  view.value = newView;
}

// Watch editor content and analyze SEO when content changes
editorStore.$subscribe((mutation, state) => {
  if (mutation.type === MutationType.direct) {
    analyzeSeo(state.content);
  }
});
</script>

<template>
  <div
    class="blog-editor-container flex flex-col"
    :class="view !== 'preview' && 'h-screen'"
  >
    <EditorTopBar @change-view="changeView" @status-change="updateStatus" />
    <Status :success="success" :error="error" />

    <PostView v-if="view === 'preview'" :post="editorStore.getPost" />
    <div v-else class="flex-1 flex overflow-hidden">
      <TipTapEditorSidebar />
      <section class="flex-1 overflow-auto p-6">
        <div class="max-w-4xl mx-auto bg-base-200 shadow-md rounded-lg">
          <EditorContent v-if="view === 'editor'" />
          <pre
            v-else-if="view === 'code'"
          ><code>{{ editorStore.content }}</code></pre>
        </div>
      </section>
      <TipTapSeoPanel />
    </div>
  </div>
</template>
