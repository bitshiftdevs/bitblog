<template>
  <div class="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
    <!-- Text formatting -->
    <div class="flex items-center border-r border-gray-200 dark:border-gray-600 pr-2 mr-2">
      <UButton
        variant="ghost"
        size="sm"
        icon="i-heroicons-bold"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()"
        title="Bullet List"
      />
      <UButton
        variant="ghost"
        size="sm"
        icon="i-heroicons-numbered-list"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('orderedList') }"
        @click="editor.chain().focus().toggleOrderedList().run()"
        title="Numbered List"
      />
      <UButton
        variant="ghost"
        size="sm"
        icon="i-heroicons-check-square"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('taskList') }"
        @click="editor.chain().focus().toggleTaskList().run()"
        title="Task List"
      />
      <UButton
        variant="ghost"
        size="sm"
        icon="i-heroicons-chat-bubble-left-right"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('blockquote') }"
        @click="editor.chain().focus().toggleBlockquote().run()"
        title="Quote"
      />
    </div>

    <!-- Media and embeds -->
    <div class="flex items-center border-r border-gray-200 dark:border-gray-600 pr-2 mr-2">
      <UButton
        variant="ghost"
        size="sm"
        icon="i-heroicons-photo"
        @click="openImageDialog"
        title="Insert Image"
      />
      <UButton
        variant="ghost"
        size="sm"
        icon="i-heroicons-link"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('link') }"
        @click="openLinkDialog"
        title="Insert Link"
      />
      <UButton
        variant="ghost"
        size="sm"
        icon="i-heroicons-play"
        @click="openYouTubeDialog"
        title="Insert YouTube Video"
      />
      <UButton
        variant="ghost"
        size="sm"
        icon="i-heroicons-table-cells"
        @click="insertTable"
        title="Insert Table"
      />
    </div>

    <!-- Code -->
    <div class="flex items-center border-r border-gray-200 dark:border-gray-600 pr-2 mr-2">
      <UButton
        variant="ghost"
        size="sm"
        icon="i-heroicons-code-bracket-square"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('codeBlock') }"
        @click="editor.chain().focus().toggleCodeBlock().run()"
        title="Code Block"
      />
    </div>

    <!-- Alignment and formatting -->
    <div class="flex items-center border-r border-gray-200 dark:border-gray-600 pr-2 mr-2">
      <UButton
        variant="ghost"
        size="sm"
        icon="i-heroicons-minus"
        @click="editor.chain().focus().setHorizontalRule().run()"
        title="Horizontal Rule"
      />
      <UButton
        variant="ghost"
        size="sm"
        icon="i-heroicons-arrow-uturn-left"
        :disabled="!editor.can().undo()"
        @click="editor.chain().focus().undo().run()"
        title="Undo (Ctrl+Z)"
      />
      <UButton
        variant="ghost"
        size="sm"
        icon="i-heroicons-arrow-uturn-right"
        :disabled="!editor.can().redo()"
        @click="editor.chain().focus().redo().run()"
        title="Redo (Ctrl+Y)"
      />
    </div>

    <!-- Dialogs -->
    <ImageDialog 
      v-model="imageDialogOpen" 
      @insert="insertImage"
    />
    
    <LinkDialog 
      v-model="linkDialogOpen" 
      :current-url="currentLinkUrl"
      @insert="insertLink"
      @remove="removeLink"
    />

    <YouTubeDialog 
      v-model="youtubeDialogOpen" 
      @insert="insertYouTube"
    />
  </div>
</template>

<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3';

interface Props {
  editor: Editor;
}

const props = defineProps<Props>();

// Dialog states
const imageDialogOpen = ref(false);
const linkDialogOpen = ref(false);
const youtubeDialogOpen = ref(false);

// Current heading display
const currentHeading = computed(() => {
  if (props.editor.isActive('heading', { level: 1 })) return 'H1';
  if (props.editor.isActive('heading', { level: 2 })) return 'H2';
  if (props.editor.isActive('heading', { level: 3 })) return 'H3';
  if (props.editor.isActive('heading', { level: 4 })) return 'H4';
  if (props.editor.isActive('heading', { level: 5 })) return 'H5';
  if (props.editor.isActive('heading', { level: 6 })) return 'H6';
  return 'Paragraph';
});

// Heading dropdown items
const headingItems = [
  [
    {
      label: 'Paragraph',
      click: () => props.editor.chain().focus().setParagraph().run(),
      active: !props.editor.isActive('heading'),
    },
  ],
  [
    {
      label: 'Heading 1',
      click: () =>
        props.editor.chain().focus().toggleHeading({ level: 1 }).run(),
      active: props.editor.isActive('heading', { level: 1 }),
    },
    {
      label: 'Heading 2',
      click: () =>
        props.editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: props.editor.isActive('heading', { level: 2 }),
    },
    {
      label: 'Heading 3',
      click: () =>
        props.editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: props.editor.isActive('heading', { level: 3 }),
    },
    {
      label: 'Heading 4',
      click: () =>
        props.editor.chain().focus().toggleHeading({ level: 4 }).run(),
      active: props.editor.isActive('heading', { level: 4 }),
    },
    {
      label: 'Heading 5',
      click: () =>
        props.editor.chain().focus().toggleHeading({ level: 5 }).run(),
      active: props.editor.isActive('heading', { level: 5 }),
    },
    {
      label: 'Heading 6',
      click: () =>
        props.editor.chain().focus().toggleHeading({ level: 6 }).run(),
      active: props.editor.isActive('heading', { level: 6 }),
    },
  ],
];

// Current link URL for editing
const currentLinkUrl = computed(() => {
  if (props.editor.isActive('link')) {
    return props.editor.getAttributes('link').href;
  }
  return '';
});

// Dialog handlers
const openImageDialog = () => {
  imageDialogOpen.value = true;
};

const openLinkDialog = () => {
  linkDialogOpen.value = true;
};

const openYouTubeDialog = () => {
  youtubeDialogOpen.value = true;
};

// Insert handlers
const insertImage = (data: { url: string; alt?: string; title?: string }) => {
  props.editor
    .chain()
    .focus()
    .setImage({
      src: data.url,
      alt: data.alt || '',
      title: data.title || '',
    })
    .run();
};

const insertLink = (data: {
  url: string;
  text?: string;
  openInNewTab?: boolean;
}) => {
  const { url, text, openInNewTab } = data;

  // If text is provided and nothing is selected, insert the text first
  if (text && props.editor.state.selection.empty) {
    props.editor.chain().focus().insertContent(text).run();
    // Select the inserted text
    const { from } = props.editor.state.selection;
    props.editor.commands.setTextSelection({
      from: from - text.length,
      to: from,
    });
  }

  props.editor
    .chain()
    .focus()
    .setLink({
      href: url,
      target: openInNewTab ? '_blank' : null,
      rel: openInNewTab ? 'noopener noreferrer' : null,
    })
    .run();
};

const removeLink = () => {
  props.editor.chain().focus().unsetLink().run();
};

const insertYouTube = (data: {
  url: string;
  width?: number;
  height?: number;
}) => {
  props.editor
    .chain()
    .focus()
    .setYoutubeVideo({
      src: data.url,
      width: data.width || 640,
      height: data.height || 480,
    })
    .run();
};

const insertTable = () => {
  props.editor
    .chain()
    .focus()
    .insertTable({
      rows: 3,
      cols: 3,
      withHeaderRow: true,
    })
    .run();
};

// Keyboard shortcuts
onMounted(() => {
  const handleKeydown = (event: KeyboardEvent) => {
    // Custom shortcuts can be added here if needed
    // Most shortcuts are handled by TipTap extensions automatically
  };

  document.addEventListener('keydown', handleKeydown);

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
  });
});
</script>Bold (Ctrl+B)"
      />
      <UButton
        variant="ghost"
        size="sm"
        icon="i-heroicons-italic"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()"
        title="Italic (Ctrl+I)"
      />
      <UButton
        variant="ghost"
        size="sm"
        icon="i-heroicons-underline"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('underline') }"
        @click="editor.chain().focus().toggleUnderline().run()"
        title="Underline (Ctrl+U)"
      />
      <UButton
        variant="ghost"
        size="sm"
        icon="i-heroicons-strikethrough"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('strike') }"
        @click="editor.chain().focus().toggleStrike().run()"
        title="Strikethrough"
      />
      <UButton
        variant="ghost"
        size="sm"
        icon="i-heroicons-code-bracket"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('code') }"
        @click="editor.chain().focus().toggleCode().run()"
        title="Inline Code"
      />
    </div>

    <!-- Headings -->
    <div class="flex items-center border-r border-gray-200 dark:border-gray-600 pr-2 mr-2">
      <UDropdown 
        :items="headingItems" 
        :popper="{ placement: 'bottom-start' }"
      >
        <UButton 
          variant="ghost" 
          size="sm" 
          :label="currentHeading"
          trailing-icon="i-heroicons-chevron-down-20-solid"
        />
      </UDropdown>
    </div>

    <!-- Paragraph formatting -->
    <div class="flex items-center border-r border-gray-200 dark:border-gray-600 pr-2 mr-2">
      <UButton
        variant="ghost"
        size="sm"
        icon="i-heroicons-list-bullet"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('bulletList') }"
        @click="editor.chain().focus().toggleBulletList().run()"
        title="
