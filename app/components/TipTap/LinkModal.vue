<script setup lang="ts">
import { useEditorStore } from '@/stores/editorStore'
import { Editor } from '@tiptap/vue-3'

const { editor } = defineProps<{ editor: Editor }>()
const editorStore = useEditorStore()

function insertLink() {
  if (editorStore.linkUrl) {
    // If text is selected, update the link on that text
    if (editor.state.selection.content().size > 0) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: editorStore.linkUrl }).run()
    }
    // If no text is selected but linkText is provided, insert new text with link
    else if (editorStore.linkText) {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${editorStore.linkUrl}">${editorStore.linkText}</a>`)
        .run()
    }
  }

  editorStore.resetModal()
}
</script>

<!-- <!-- Link Modal -->
<template>
  <Teleport to="body">
    <div v-if="editorStore.showLinkModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Insert Link</h3>
        <div class="form-control w-full mt-4">
          <label for="" class="label">
            <span class="label-text">URL</span>
          </label>
          <input type="text" v-model="editorStore.linkUrl" placeholder="https://example.com"
            class="input input-bordered w-full" />
        </div>
        <div class="form-control w-full mt-2">
          <label for="" class="label">
            <span class="label-text">Text</span>
          </label>
          <input type="text" v-model="editorStore.linkText" placeholder="Link text"
            class="input input-bordered w-full" />
        </div>
        <div class="modal-action">
          <button class="btn" @click="editorStore.resetModal">Cancel</button>
          <button class="btn btn-primary" @click="insertLink">Insert</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
