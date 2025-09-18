<script setup lang="ts">
import { useEditorStore } from '@/stores/editorStore'
import type { Editor } from '@tiptap/core'
import { ref } from 'vue'

let { editor } = defineProps<{ editor: Editor }>()
let youtubeUrl = ref<string | undefined>(undefined)

const editorStore = useEditorStore()

function insertYoutube() {
  if (youtubeUrl.value) {
    editor.chain().focus().setYoutubeVideo({ src: youtubeUrl.value }).run()

    // Reset form
    youtubeUrl.value = ''
    editorStore.resetModal()
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="editorStore.showYoutubeModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Insert YouTube Video</h3>
        <div class="form-control w-full mt-4">
          <label for="" class="label">
            <span class="label-text">YouTube URL</span>
          </label>
          <input type="text" :value="{ youtubeUrl }" placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            class="input input-bordered w-full" />
        </div>
        <div class="modal-action">
          <button class="btn" @click="editorStore.resetModal">Cancel</button>
          <button class="btn btn-primary" @click="insertYoutube">Insert</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
