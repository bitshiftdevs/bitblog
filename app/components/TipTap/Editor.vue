<!-- apps/web/components/Editor/TipTapEditor.vue -->
<template>
  <div
    class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
  >
    <!-- Toolbar -->
    <EditorToolbar
      v-if="editor"
      :editor="editor"
      class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
    />

    <!-- Editor content -->
    <div
      class="prose prose-sm sm:prose lg:prose-lg max-w-none p-4 min-h-[400px] focus-within:outline-none"
      :class="editorClasses"
    >
      <editor-content :editor="editor" />
    </div>

    <!-- Character count -->
    <div
      v-if="showCharacterCount && editor"
      class="border-t border-gray-200 dark:border-gray-700 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 flex justify-between"
    >
      <span>
        {{ editor.storage.characterCount.characters() }} characters,
        {{ editor.storage.characterCount.words() }} words
      </span>
      <span v-if="readingTime"> {{ readingTime }} min read </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Typography from '@tiptap/extension-typography';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Youtube from '@tiptap/extension-youtube';
import { lowlight } from 'lowlight';

interface Props {
  modelValue?: any;
  placeholder?: string;
  editable?: boolean;
  showCharacterCount?: boolean;
  autofocus?: boolean;
  maxCharacters?: number;
}

interface Emits {
  (e: 'update:modelValue', value: any): void;
  (e: 'focus'): void;
  (e: 'blur'): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Start writing...',
  editable: true,
  showCharacterCount: false,
  autofocus: false,
});

const emit = defineEmits<Emits>();

const editor = ref<Editor>();
const isReady = ref(false);

// Editor classes
const editorClasses = computed(() => [
  'prose-gray dark:prose-invert',
  'prose-headings:font-semibold',
  'prose-a:text-primary-600 hover:prose-a:text-primary-700',
  'prose-code:bg-gray-100 dark:prose-code:bg-gray-800',
  'prose-pre:bg-gray-900 dark:prose-pre:bg-gray-800',
  'prose-blockquote:border-l-primary-500',
  {
    'opacity-75 cursor-not-allowed': !props.editable,
  },
]);

// Reading time calculation (approximately 200 words per minute)
const readingTime = computed(() => {
  if (!editor.value) return 0;
  const words = editor.value.storage.characterCount.words();
  return Math.ceil(words / 200);
});

// Initialize editor
onMounted(() => {
  editor.value = new Editor({
    content: props.modelValue,
    editable: props.editable,
    autofocus: props.autofocus,
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
      }),
      Placeholder.configure({
        placeholder: props.placeholder,
      }),
      CharacterCount.configure({
        limit: props.maxCharacters,
      }),
      Typography,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            'text-primary-600 hover:text-primary-700 underline decoration-primary-200 hover:decoration-primary-300',
        },
      }),
      Image.configure({
        inline: false,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'rounded-md',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Youtube.configure({
        controls: false,
        nocookie: true,
        HTMLAttributes: {
          class: 'rounded-lg',
        },
      }),
    ],
    onUpdate: ({ editor }) => {
      emit('update:modelValue', editor.getJSON());
    },
    onFocus: () => {
      emit('focus');
    },
    onBlur: () => {
      emit('blur');
    },
    onReady: () => {
      isReady.value = true;
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
    },
  });
});

// Watch for external content changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (!editor.value) return;

    const currentContent = editor.value.getJSON();
    if (JSON.stringify(currentContent) !== JSON.stringify(newValue)) {
      editor.value.commands.setContent(newValue, false);
    }
  },
  { deep: true },
);

// Watch editable prop
watch(
  () => props.editable,
  (newValue) => {
    if (editor.value) {
      editor.value.setEditable(newValue);
    }
  },
);

// Cleanup
onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy();
  }
});

// Expose editor instance for parent components
defineExpose({
  editor: readonly(editor),
  isReady: readonly(isReady),
  focus: () => editor.value?.commands.focus(),
  blur: () => editor.value?.commands.blur(),
  clear: () => editor.value?.commands.clearContent(),
  getHTML: () => editor.value?.getHTML(),
  getJSON: () => editor.value?.getJSON(),
  getText: () => editor.value?.getText(),
  isEmpty: () => editor.value?.isEmpty,
  setContent: (content: any) => editor.value?.commands.setContent(content),
});
</script>

<style lang="scss">
// TipTap editor styles
.ProseMirror {
  outline: none;

  // Placeholder styles
  p.is-editor-empty:first-child::before {
    color: rgb(var(--color-gray-400));
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }

  // Task list styles
  ul[data-type="taskList"] {
    list-style: none;
    padding: 0;

    li {
      display: flex;
      align-items: flex-start;

      > label {
        flex: 0 0 auto;
        margin-right: 0.5rem;
        user-select: none;

        input[type="checkbox"] {
          cursor: pointer;
        }
      }

      > div {
        flex: 1 1 auto;
      }

      ul,
      ol {
        margin: 0.5rem 0;
      }
    }
  }

  // Table styles
  table {
    border-collapse: collapse;
    margin: 0;
    overflow: hidden;
    table-layout: fixed;
    width: 100%;

    td,
    th {
      border: 2px solid rgb(var(--color-gray-200));
      box-sizing: border-box;
      min-width: 1em;
      padding: 3px 5px;
      position: relative;
      vertical-align: top;

      > * {
        margin-bottom: 0;
      }
    }

    th {
      background-color: rgb(var(--color-gray-50));
      font-weight: bold;
      text-align: left;
    }

    .selectedCell:after {
      background: rgba(var(--color-primary-500), 0.2);
      content: "";
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      pointer-events: none;
      position: absolute;
      z-index: 2;
    }

    .column-resize-handle {
      background-color: rgb(var(--color-primary-500));
      bottom: -2px;
      position: absolute;
      right: -2px;
      top: 0;
      width: 4px;
      pointer-events: none;
    }
  }

  .tableWrapper {
    overflow-x: auto;
  }

  // Code block styles
  pre {
    background: rgb(var(--color-gray-900));
    border-radius: 0.5rem;
    color: rgb(var(--color-white));
    font-family:
      "JetBrains Mono", "SF Mono", Monaco, "Cascadia Code", "Roboto Mono",
      Consolas, "Courier New", monospace;
    padding: 0.75rem 1rem;

    code {
      background: none;
      color: inherit;
      font-size: 0.8rem;
      padding: 0;
    }

    .hljs-comment,
    .hljs-quote {
      color: rgb(var(--color-gray-400));
    }

    .hljs-keyword,
    .hljs-selector-tag,
    .hljs-addition {
      color: rgb(var(--color-green-400));
    }

    .hljs-number,
    .hljs-string,
    .hljs-meta .hljs-meta-string,
    .hljs-literal,
    .hljs-doctag,
    .hljs-regexp {
      color: rgb(var(--color-blue-400));
    }

    .hljs-title,
    .hljs-section,
    .hljs-name,
    .hljs-selector-id,
    .hljs-selector-class {
      color: rgb(var(--color-yellow-400));
    }

    .hljs-attribute,
    .hljs-attr,
    .hljs-variable,
    .hljs-template-variable,
    .hljs-class .hljs-title,
    .hljs-type {
      color: rgb(var(--color-orange-400));
    }

    .hljs-symbol,
    .hljs-bullet,
    .hljs-subst,
    .hljs-meta,
    .hljs-meta .hljs-keyword,
    .hljs-selector-attr,
    .hljs-selector-pseudo,
    .hljs-link {
      color: rgb(var(--color-purple-400));
    }

    .hljs-built_in,
    .hljs-deletion {
      color: rgb(var(--color-red-400));
    }
  }

  // YouTube embed styles
  div[data-youtube-video] {
    cursor: pointer;

    iframe {
      border-radius: 0.5rem;
      pointer-events: none;
    }
  }

  // Dark mode adjustments
  .dark & {
    table {
      td,
      th {
        border-color: rgb(var(--color-gray-600));
      }

      th {
        background-color: rgb(var(--color-gray-800));
      }
    }
  }
}
</style>
