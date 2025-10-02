<script setup lang="ts">
import { MutationType } from 'pinia';

definePageMeta({ layout: 'editor', middleware: ['admin'] });
const editorStore = useEditorStore();
const { analyzeSeo } = useSeo();

onMounted(() => {
  // // Auto-save every 30 seconds
  // const autoSaveInterval = setInterval(() => {
  //   editorStore.saveContent('draft');
  // }, 30000);
  // Clean up on unmount
  // onBeforeUnmount(() => {
  //   clearInterval(autoSaveInterval);
  //   blog.destroyEditor();
  // });
});

// Watch editor content and analyze SEO when content changes
editorStore.$subscribe((mutation, state) => {
  if (mutation.type === MutationType.direct) {
    analyzeSeo(state.contentText);
  }
});
</script>

<template>
  <div
    class="flex flex-col"
    :class="editorStore.view !== 'preview' && 'h-screen'"
  >
    <!-- <TipTapPostView v-if="view === 'preview'" :post="editorStore.getPost" /> -->
    <div v-if="editorStore.view === 'preview'" class="flex-1 overflow-auto p-6">
      <div class="max-w-4xl mx-auto bg-base-200 shadow-md rounded-lg p-6">
        <PostView :post="editorStore.getPost" />
      </div>
    </div>
    <div v-else class="flex-1 flex overflow-hidden">
      <TipTapSidebar />
      <section class="flex-1 overflow-auto p-6">
        <div class="max-w-4xl mx-auto bg-base-200 shadow-md rounded-lg">
          <TipTapContent v-if="editorStore.view === 'editor'" />
          <pre
            class="prose prose-slate dark:prose-invert"
            v-else-if="editorStore.view === 'code'"
          ><code>{{ editorStore.content }}</code></pre>
        </div>
      </section>
      <TipTapSeoPanel />
    </div>
  </div>
</template>
