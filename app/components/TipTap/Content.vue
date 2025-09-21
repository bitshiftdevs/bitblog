<script setup lang="ts">
import { EditorContent } from '@tiptap/vue-3';

const editorStore = useEditorStore();

const blog = useBlogEditor();
</script>

<template>
  <div class="editor-container" v-if="blog.editor.value">
    <div class="px-4 py-3">
      <input
        v-model="editorStore.title"
        class="w-full text-3xl font-bold outline-none input input-xl"
        placeholder="Add Title"
      />
    </div>

    <TipTapMenuBar :editor="blog.editor.value" />
    <TipTapTOC
      :editor="blog.editor.value!"
      title="Table Of Content"
      :levels="[1, 2, 3]"
      update-event="update:toc"
      :active-offset="100"
    />

    <div class="px-6 py-4 min-h-[500px]">
      <!-- <TipTapBubbleMenu :editor="blog.editor.value" /> -->
      <ClientOnly
        ><EditorContent :editor="blog.editor.value" class="prose max-w-none" />
      </ClientOnly>
    </div>
    <!-- <LinkModal :editor /> -->
    <!-- <ImageModal :editor /> -->
    <!-- <YoutubeModal :editor /> -->
  </div>
</template>

<style></style>
