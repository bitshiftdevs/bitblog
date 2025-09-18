<script setup lang="ts">
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
  <UDashboardSidebar
    class="w-80 bg-base border-l border-gray-500 overflow-y-auto h-full flex flex-col"
  >
    <div class="p-4 border-b border-gray-500">
      <h2 class="text-xl font-bold">SEO</h2>
    </div>

    <div class="flex-1 overflow-y-auto">
      <div class="p-4">
        <!-- SEO Score -->
        <UFormField label="SEO Score">
          <UProgress
            v-model="seoStore.seoScore"
            status
            :color="getStatusColor(seoStore.seoScore)"
          />
        </UFormField>

        <!-- Readability Score -->
        <UFormField label="Readability">
          <UProgress
            v-model="seoStore.readabilityScore"
            status
            :color="getStatusColor(seoStore.readabilityScore)"
          />
        </UFormField>

        <UFormField label="Focus Keywork">
          <UInput
            type="text"
            v-model="focusKeyword"
            @input="updateFocusKeyword"
            placeholder="Enter focus keyword"
          />
        </UFormField>

        <UFormField :label="`Meta Title: ${seoStore.analysis.titleLength}/60`">
          <UInput
            type="text"
            v-model="focusKeyword"
            @input="updateFocusKeyword"
            placeholder="Enter focus keyword"
          />
        </UFormField>

        <!-- SEO Preview -->
        <UFormField label="Google Preview">
          <div class="mb-6 p-3 border border-gray-500 rounded-md">
            <div class="google-preview">
              <div class="text-blue-600 text-lg truncate">
                {{ editorStore.title || "Title Example" }}
              </div>
              <div class="text-green-700 text-wrap text-sm">
                {{ previewUrl }}
              </div>
              <div class="text-gray-400 text-sm line-clamp-2">
                {{
                  editorStore.excerpt ||
                  "This is an example of how your page might appear in Google search results." +
                    "Write a compelling meta description to improve click - through rates."
                }}
              </div>
            </div>
          </div>
        </UFormField>

        <!-- SEO Analysis -->
        <UFormField label="SEO Analysis" class="mb-6">
          <div v-if="seoStore.analysis.improvements.length > 0">
            <UAlert
              v-for="(improvement, index) in seoStore.analysis.improvements"
              :key="index"
              icon="i-lucide-badge-x"
              color="error"
              variant="subtle"
              class="mt-1"
              :description="improvement"
            />
          </div>
          <UAlert
            v-else
            color="success"
            variant="subtle"
            title="Great job!"
            icon="i-lucide-check-check"
            description="No SEO improvements needed"
          />
        </UFormField>
      </div>
    </div>
  </UDashboardSidebar>
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
