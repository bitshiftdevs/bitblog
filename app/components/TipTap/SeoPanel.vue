<script setup lang="ts">
import { ref, computed, watch } from 'vue';
// import Progress from '@/components/Progress.vue';
import { useSeoStore } from '~/stores/seoStore';
import { useEditorStore } from '~/stores/editorStore';

const seoStore = useSeoStore();
const editorStore = useEditorStore();

const focusKeyword = ref(seoStore.focusKeyword);

// Computed properties for styling
const metaTitleLengthClass = computed(() => {
  const length = seoStore.analysis.titleLength;
  if (length === 0) return 'text-gray-500';
  if (length < 30 || length > 60) return 'text-red-500';
  return 'text-green-500';
});

const previewUrl = computed(() => {
  const baseUrl = 'kratosgado.pages.dev/articles/';
  const slug = editorStore.slug || 'sample-post';
  return baseUrl + slug;
});

// Helper functions for styling
const scoreClass = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
};

const updateFocusKeyword = () => {
  seoStore.updateFocusKeyword(focusKeyword.value);
};

// Watch for changes from the store
watch(
  () => editorStore.title,
  (newValue) => {
    seoStore.updateMetaTitle(newValue);
    editorStore.setTitle();
  },
);

watch(
  () => seoStore.focusKeyword,
  (newValue) => {
    focusKeyword.value = newValue;
  },
);
</script>

<template>
  <div
    class="seo-panel w-80 bg-base border-l border-gray-500 overflow-y-auto h-full flex flex-col"
  >
    <div class="p-4 border-b border-gray-500">
      <h2 class="text-xl font-bold">SEO</h2>
    </div>

    <div class="flex-1 overflow-y-auto">
      <div class="p-4">
        <!-- SEO Score -->
        <div class="mb-6">
          <div class="flex justify-between mb-2">
            <span class="font-medium">SEO Score</span>
            <span :class="scoreClass(seoStore.seoScore)"
              >{{ seoStore.seoScore }}/100</span
            >
          </div>
          <!-- <Progress :value="seoStore.seoScore" /> -->
        </div>

        <!-- Readability Score -->
        <div class="mb-6">
          <div class="flex justify-between mb-2">
            <span class="font-medium">Readability</span>
            <span :class="scoreClass(seoStore.readabilityScore)"
              >{{ seoStore.readabilityScore }}/100</span
            >
          </div>
          <!-- <Progress :value="seoStore.readabilityScore" /> -->
        </div>

        <!-- Focus Keyword -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-400 mb-1"
            >Focus Keyword</label
          >
          <input
            type="text"
            v-model="focusKeyword"
            @input="updateFocusKeyword"
            class="input input-info p-2 rounded-md"
            placeholder="Enter focus keyword"
          />
        </div>

        <!-- Meta Title -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-400 mb-1">
            Meta Title
            <span :class="metaTitleLengthClass"
              >{{ seoStore.analysis.titleLength }}/60</span
            >
          </label>
          <input
            type="text"
            v-model="editorStore.title"
            class="input input-info"
            placeholder="Enter meta title"
          />
        </div>

        <!-- SEO Preview -->
        <div class="mb-6 p-3 border border-gray-500 rounded-md">
          <h3 class="text-sm font-medium mb-2">Google Preview</h3>
          <div class="google-preview">
            <div class="text-blue-600 text-lg truncate">
              {{ editorStore.title || "Title Example" }}
            </div>
            <div class="text-green-700 text-sm">{{ previewUrl }}</div>
            <div class="text-gray-400 text-sm line-clamp-2">
              {{
                editorStore.excerpt ||
                "This is an example of how your page might appear in Google search results." +
                  "Write a compelling meta description to improve click - through rates."
              }}
            </div>
          </div>
        </div>

        <!-- SEO Analysis -->
        <div class="mb-6">
          <h3 class="text-sm font-medium mb-2">SEO Analysis</h3>

          <!-- <div v-if="seoStore.analysis.improvements.length > 0"> -->
          <!--   <AlertError v-for="(improvement, index) in seoStore.analysis.improvements" :key="index" :msg="improvement" -->
          <!--     class="alert-soft" /> -->
          <!-- </div> -->
          <!-- <AlertSuccess v-else class="alert-soft" msg="Great job! No SEO improvements needed" /> -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
