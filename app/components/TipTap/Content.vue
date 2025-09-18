<script setup lang="ts">
import { EditorContent } from '@tiptap/vue-3';

const editorStore = useEditorStore();

const blog = useBlogEditor();
</script>

<template>
  <div class="editor-container" v-if="blog.editor">
    <div class="px-4 py-3 border-b border-gray-200">
      <input
        v-model="editorStore.title"
        class="w-full text-3xl font-bold outline-none input input-xl"
        placeholder="Add Title"
      />
    </div>

    <TipTapMenuBar :editor="blog.editor" />
    <TipTapTOC
      :editor="blog.editor.value!"
      title="Table Of Content"
      :levels="[1, 2, 3]"
      update-event="update:toc"
      :active-offset="100"
    />

    <div class="px-6 py-4 min-h-[500px]">
      <EditorBubbleMenu :editor="blog.editor" />
      <EditorContent :editor="blog.editor.value" class="prose max-w-none" />
    </div>
    <!-- <LinkModal :editor /> -->
    <!-- <ImageModal :editor /> -->
    <!-- <YoutubeModal :editor /> -->
  </div>
</template>

<style>
/* Custom TipTap editor styles */
.ProseMirror {
  outline: none;
  min-height: 400px;
}

.ProseMirror p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

/* Add some spacing between blocks */
.ProseMirror > * + * {
  margin-top: 0.75em;
}

/* Placeholder styling */
.ProseMirror p.is-empty::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
</style>
