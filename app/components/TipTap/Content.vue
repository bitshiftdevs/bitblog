<script setup lang="ts">
import type { JSONContent } from '@tiptap/vue-3';
import EditorLinkPopover from './EditorLinkPopover.vue';
import { ImageUpload } from './extensions/EditorImageUploadExtension';
import { CodeBlockShiki } from 'tiptap-extension-code-block-shiki';
import Emoji from '@tiptap/extension-emoji';
import { bubbleToolbarItems, imageToolbarItems } from './extensions/bubbleToolbarItems';
import { fixedToolbarItems } from './extensions/fixedToolbarItems';
import { handleItems } from './extensions/handleItems';
import { emojiItems, mentionItems, suggestionItems } from './extensions/suggestionItems';
import { CalloutExtension } from './extensions/callout';
import { customHandlers } from './extensions/customHandlers';

const editorStore = useEditorStore();
const selectedNode = ref<{ node: JSONContent; pos: number }>();

const extensions = [
  Emoji,
  // TextAlign.configure({ types: ['heading', 'paragraph'] }),
  ImageUpload,
  CodeBlockShiki.configure({
    defaultTheme: 'material-theme',
    themes: {
      light: 'material-theme-lighter',
      dark: 'material-theme-palenight',
    },
  }),
  CalloutExtension,
  // CardExtension,
  // CodeGroupExtension,
  // CodePreviewExtension,
  // CodeCollapseExtension,
  // CodeTreeExtension,
  // CollapsibleExtension,
  // // AccordionExtension,
  // // AccordionItemExtension,
  // // TabsExtension,
  // // TabsItemExtension,
  // BadgeExtension,
  // StepsExtension,
  // // FieldGroupExtension,
  // // FieldExtension,
  // IconExtension,
  // KbdExtension,
];
</script>

<template>
  <div class="editor-container">
    <div class="px-4 py-3 border-b dark:border-gray-800">
      <input
        v-model="editorStore.title"
        class="w-full text-3xl font-bold outline-none bg-transparent"
        placeholder="Add Title"
      />
    </div>

    <div class="px-6 py-4 min-h-[500px]">
      <UEditor
        v-slot="{ editor, handlers }"
        v-model="editorStore.content"
        content-type="markdown"
        :extensions
        :handlers="customHandlers"
        placeholder="Write, type '/' for commands..."
        :ui="{ base: 'p-8 sm:px-16 py-13.5' }"
        class="w-full"
      >
        <UEditorToolbar
          :editor="editor"
          :items="fixedToolbarItems"
          class="border-b border-muted sticky top-0 inset-x-0 px-8 sm:px-16 py-2 z-50 bg-default overflow-x-auto"
        >
          <template #link>
            <EditorLinkPopover :editor="editor" auto-open />
          </template>
        </UEditorToolbar>

        <UEditorToolbar
          :editor="editor"
          :items="bubbleToolbarItems"
          layout="bubble"
          :should-show="
            ({ editor, view, state }) => {
              if (editor.isActive('imageUpload') || editor.isActive('image')) {
                return false;
              }
              const { selection } = state;
              return view.hasFocus() && !selection.empty;
            }
          "
        >
          <template #link>
            <EditorLinkPopover :editor="editor" />
          </template>
        </UEditorToolbar>

        <UEditorToolbar
          :editor="editor"
          :items="imageToolbarItems(editor)"
          layout="bubble"
          :should-show="
            ({ editor, view }) => {
              return editor.isActive('image') && view.hasFocus();
            }
          "
        />

        <UEditorSuggestionMenu :editor="editor" :items="suggestionItems" />

        <UEditorMentionMenu :editor="editor" :items="mentionItems" />

        <UEditorEmojiMenu :editor="editor" :items="emojiItems" />

        <UEditorDragHandle
          v-slot="{ ui, onClick }"
          :editor="editor"
          @node-change="selectedNode = $event"
        >
          <UButton
            icon="i-lucide-plus"
            color="neutral"
            variant="ghost"
            size="sm"
            :class="ui.handle()"
            @click="
              (e) => {
                e.stopPropagation();

                const selected = onClick();
                handlers.suggestion
                  ?.execute(editor, { pos: selected?.pos })
                  .run();
              }
            "
          />

          <UDropdownMenu
            v-slot="{ open }"
            :modal="false"
            :items="handleItems(editor, selectedNode)"
            :content="{ side: 'left' }"
            :ui="{ content: 'w-48', label: 'text-xs' }"
            @update:open="
              editor.chain().setMeta('lockDragHandle', $event).run()
            "
          >
            <UButton
              color="neutral"
              variant="ghost"
              active-variant="soft"
              size="sm"
              icon="i-lucide-grip-vertical"
              :active="open"
              :class="ui.handle()"
            />
          </UDropdownMenu>
        </UEditorDragHandle>
      </UEditor>
    </div>
  </div>
</template>

<style>
.editor-container {
  min-height: 400px;
}
/* .ProseMirror { */
/*   outline: none !important; */
/* } */
html.dark .tiptap .shiki,
html.dark .tiptap .shiki span {
  color: var(--shiki-dark) !important;
  background-color: var(--ui-bg-muted) !important;
}
</style>
