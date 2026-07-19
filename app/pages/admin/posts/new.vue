<script setup lang="ts">
import { MutationType } from 'pinia';

definePageMeta({ layout: 'editor', middleware: ['admin'] });
const editorStore = useEditorStore();

onMounted(() => {
  // Auto-save every 30 seconds
  const autoSaveInterval = setInterval(() => {
    editorStore.saveContent('draft');
  }, 30000);
  // Clean up on unmount
  onBeforeUnmount(() => {
    clearInterval(autoSaveInterval);
    editorStore.$reset();
  });
});
</script>

<template>
  <div
    class="flex flex-col bg-muted/10"
    :class="editorStore.view !== 'preview' && 'h-screen'"
  >
    <div v-if="editorStore.view === 'preview'" class="flex-1 overflow-auto p-4 sm:p-8">
      <div class="max-w-5xl mx-auto bg-default shadow-2xl rounded-2xl border border-default/20 overflow-hidden">
        <PostView :post="editorStore.getPost" />
      </div>
    </div>
    <div v-else class="flex-1 flex overflow-hidden">
      <TipTapSidebar class="border-r border-default bg-default shadow-sm z-10" />
      <section class="flex-1 overflow-auto p-4 sm:p-8 relative">
        <div class="max-w-4xl mx-auto bg-default shadow-xl rounded-2xl border border-default/20 p-8 min-h-full transition-all duration-300">
          <TipTapContent v-if="editorStore.view === 'editor'" />
          <pre
            class="prose prose-slate dark:prose-invert"
            v-else-if="editorStore.view === 'code'"
          ><code>{{ editorStore.content }}</code></pre>
        </div>
      </section>
      <TipTapSeoPanel class="border-l border-default bg-default shadow-sm z-10" />
    </div>
  </div>
</template>
