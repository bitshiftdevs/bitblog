<script setup lang="ts">
const youtubeUrl = ref<string>('');

const editorStore = useEditorStore();
const blog = useBlogEditor();

function insertYoutube() {
  if (youtubeUrl.value) {
    blog.editor.value?.chain().focus().setYoutubeVideo({ src: youtubeUrl.value }).run();

    // Reset form
    youtubeUrl.value = '';
    editorStore.resetModal();
    emit('close', true);
  }
}

const emit = defineEmits<{
  close: [boolean];
}>();
</script>

<template>
  <UModal title="Insert YouTube Video">
    <template #body>
      <div class="space-y-4">
        <UFormGroup label="YouTube URL" required>
          <UInput
            v-model="youtubeUrl"
            placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            type="url"
          />
        </UFormGroup>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton variant="ghost" @click="emit('close', true)"> Cancel </UButton>
        <UButton @click="insertYoutube" :disabled="!youtubeUrl">
          Insert Video
        </UButton>
      </div>
    </template>
  </UModal>
</template>
