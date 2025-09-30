<script setup lang="ts">
import { MutationType } from 'pinia';
import type { ApiResponse, Post } from '~~/shared/types';

definePageMeta({ layout: 'editor', middleware: ['admin'] });
const editorStore = useEditorStore();
const blog = useBlogEditor();
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
    editorStore.saveContent('DRAFT');
  }, 30000);

  // Clean up on unmount
  onBeforeUnmount(() => {
    clearInterval(autoSaveInterval);
    blog.destroyEditor();
    editorStore.$reset();
  });
});

// Watch editor content and analyze SEO when content changes
editorStore.$subscribe((mutation, state) => {
  if (mutation.type === MutationType.direct) {
    analyzeSeo(state.contentText);
  }
});
</script>

<template>
  <div v-if="postLoading" class="flex items-center justify-center h-screen">
    <div class="animate-pulse text-center">
      <div
        class="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-lg mx-auto mb-4"
      ></div>
      <p class="text-gray-600 dark:text-gray-400">Loading post...</p>
    </div>
  </div>

  <div
    v-else
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
