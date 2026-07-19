<script setup lang="ts">
import { MutationType } from 'pinia';
import type { ApiResponse, Post } from '~~/shared/types';

definePageMeta({ layout: 'editor', middleware: ['admin'] });
const editorStore = useEditorStore();
const slug = useRoute().params.slug as string;

const { data, pending: postLoading } = useLazyFetch<ApiResponse<Post>>(`/api/posts/${slug}`, {
  key: `admin-post-${slug}`,
  query: { isEditing: true },
});
const post = computed(() => data.value?.data);

// Load post into editor when data is available
watch(
  () => data.value?.data,
  (newPost) => {
    if (newPost) {
      editorStore.loadPost(newPost);
    }
  },
  { immediate: true },
);

const { analyzeSeo } = useSeo();

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

// Watch editor content and analyze SEO when content changes
editorStore.$subscribe((mutation, state) => {
  if (mutation.type === MutationType.direct) {
    analyzeSeo(state.content ?? '');
  }
});
</script>

<template>
  <div v-if="postLoading" class="flex flex-col items-center justify-center h-screen bg-muted/10">
    <div class="animate-pulse flex flex-col items-center">
      <div class="w-20 h-20 bg-primary/20 rounded-2xl mb-6 shadow-inner flex items-center justify-center">
        <UIcon name="i-lucide-file-edit" class="w-10 h-10 text-primary" />
      </div>
      <p class="text-lg font-medium text-muted">Loading your masterpiece...</p>
    </div>
  </div>

  <div
    v-else
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
