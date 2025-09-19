<script setup lang="ts">
import { MutationType } from 'pinia';
import type { EditorView } from '~~/shared/types';

definePageMeta({ layout: 'editor' });
const editorStore = useEditorStore();
const blog = useBlogEditor();
const { analyzeSeo } = useSeo();

const view = ref<EditorView>('editor');

onMounted(() => {
  // Auto-save every 30 seconds
  const autoSaveInterval = setInterval(() => {
    editorStore.saveContent('DRAFT');
  }, 30000);

  // Clean up on unmount
  onBeforeUnmount(() => {
    clearInterval(autoSaveInterval);
    blog.destroyEditor();
  });
});

function changeView(newView: EditorView) {
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
  <div class="flex flex-col" :class="view !== 'preview' && 'h-screen'">
    <!-- <TipTapPostView v-if="view === 'preview'" :post="editorStore.getPost" /> -->
    <div v-if="view === 'preview'" class="flex-1 overflow-auto p-6">
      <div class="max-w-4xl mx-auto bg-base-200 shadow-md rounded-lg p-6">
        <!-- <TipTapPostView :post="editorStore.getPost" /> -->
      </div>
    </div>
    <div v-else class="flex-1 flex overflow-hidden">
      <TipTapSidebar />
      <section class="flex-1 overflow-auto p-6">
        <div class="max-w-4xl mx-auto bg-base-200 shadow-md rounded-lg">
          <TipTapContent v-if="view === 'editor'" />
          <pre
            v-else-if="view === 'code'"
          ><code>{{ editorStore.content }}</code></pre>
        </div>
      </section>
      <TipTapSeoPanel />
    </div>
  </div>
</template>
