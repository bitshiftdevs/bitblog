<script setup lang="ts">
const editorStore = useEditorStore();

const previewUrl = computed(() => {
  const baseUrl = 'kratosgado.pages.dev/articles/';
  const slug = editorStore.slug || 'sample-post';
  return baseUrl + slug;
});
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
