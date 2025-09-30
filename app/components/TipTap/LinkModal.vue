<script setup lang="ts">
import { Editor } from '@tiptap/vue-3';

const { editor } = defineProps<{ editor: Editor }>();

const linkUrl = ref<string>('');
const linkText = ref<string>('');

function insertLink() {
  if (linkUrl) {
    // If text is selected, update the link on that text
    if (editor.state.selection.content().size > 0) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.value }).run();
    }
    // If no text is selected but linkText is provided, insert new text with link
    else if (linkText) {
      editor.chain().focus().insertContent(`<a href="${linkUrl.value}">${linkText.value}</a>`).run();
    }
  }

  emit('close', true);
}

const emit = defineEmits<{
  close: [boolean];
}>();
</script>

<template>
  <UModal title="Insert Link">
    <template #body>
      <div class="space-y-4">
        <UFormField label="URL" required>
          <UInput
            v-model="linkUrl"
            placeholder="https://example.com"
            type="url"
          />
        </UFormField>

        <UFormField label="Text" hint="Leave empty to use the URL as text">
          <UInput v-model="linkText" placeholder="Link text" />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton variant="ghost" @click="emit('close', true)"> Cancel </UButton>
        <UButton @click="insertLink" :disabled="!linkUrl">
          Insert Link
        </UButton>
      </div>
    </template>
  </UModal>
</template>
