<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';
import type { Content, Editor } from '@tiptap/vue-3';
import { computed, watch } from 'vue';
import { getTemplate, templates } from '~/utils/templates';

const editorStore = useEditorStore();
// const blog = useBlogEditor();
const { editor } = defineProps<{ editor: Editor }>();

const blockItems: DropdownMenuItem[] = [
  { label: 'Table', onSelect: () => insertTable() },
  { label: 'Divider', onSelect: () => insertDivider() },
  { label: 'Blockquote', onSelect: () => insertBlockquote() },
  { label: 'Code Block', onSelect: () => insertCodeBlock() },
  { label: 'Spacer', onSelect: () => insertSpacer() },
  { label: 'Button', onSelect: () => insertButton() },
  { label: 'Accordion', onSelect: () => insertAccordion() },
  { label: 'Tabs', onSelect: () => insertTabs() },
];

const colorItems: any = [];

watch(
  () => editorStore.content,
  (content) => {
    editor.commands.setContent(content);
  },
  { once: true },
);

function insertTemplate(type: string) {
  editor.commands.insertContent(getTemplate(type));
}

const textColors = [
  '#000000',
  '#434343',
  '#666666',
  '#999999',
  '#b7b7b7',
  '#cccccc',
  '#d9d9d9',
  '#efefef',
  '#f3f3f3',
  '#ffffff',
  '#980000',
  '#ff0000',
  '#ff9900',
  '#ffff00',
  '#00ff00',
  '#00ffff',
  '#4a86e8',
  '#0000ff',
  '#9900ff',
  '#ff00ff',
];

const currentHeading = computed(() => {
  if (editor.isActive('heading', { level: 1 })) return 1;
  if (editor.isActive('heading', { level: 2 })) return 2;
  if (editor.isActive('heading', { level: 3 })) return 3;
  if (editor.isActive('heading', { level: 4 })) return 4;
  if (editor.isActive('heading', { level: 5 })) return 5;
  if (editor.isActive('heading', { level: 6 })) return 6;
  return null;
});

// const setLink = () => {
//   const previousUrl = editor.getAttributes('link').href
//   const url = window.prompt('URL', previousUrl)
//
//   // cancelled
//   if (url === null) {
//     return
//   }
//
//   // empty
//   if (url === '') {
//     editor.chain().focus().extendMarkRange('link').unsetLink().run()
//     return
//   }
//
//   // add http:// if it doesn't exist
//   const fullUrl = url.match(/^https?:\/\//) ? url : `https://${url}`
//
//   // update link
//   editor.chain().focus().extendMarkRange('link').setLink({ href: fullUrl }).run()
// }

// const addImage = () => {
//   const url = window.prompt('Image URL')
//
//   if (url) {
//     editor.chain().focus().setImage({ src: url }).run()
//   }
// }

// const addVideo = () => {
//   const url = window.prompt('YouTube Video URL')
//
//   if (url) {
//     editor.chain().focus().setYoutubeVideo({ src: url }).run()
//   }
// }

const insertTable = () => {
  // editor
  //   .chain()
  //   .focus()
  //   .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
  //   .run();
};

const insertDivider = () => {
  editor.chain().focus().setHorizontalRule().run();
};

const insertBlockquote = () => {
  editor.chain().focus().toggleBlockquote().run();
};

const insertCodeBlock = () => {
  editor.chain().focus().toggleCodeBlock().run();
};

const insertSpacer = () => {
  // Custom spacer logic would go here
  editor.chain().focus().insertContent('<div class="spacer my-8"></div>').run();
};

const insertButton = () => {
  // Custom button insertion logic
  editor
    .chain()
    .focus()
    .insertContent('<a class="btn btn-primary">Button Text</a>')
    .run();
};

const insertAccordion = () => {
  // Custom accordion insertion logic
  editor
    .chain()
    .focus()
    .insertContent(
      `
    <div class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
      <input type="checkbox" />
      <div class="collapse-icon text-xl font-medium">
        Click to open/close
      </div>
      <div class="collapse-content">
        <p>Content goes here</p>
      </div>
    </div>
  `,
    )
    .run();
};

const insertTabs = () => {
  // Custom tabs insertion logic
  editor
    .chain()
    .focus()
    .insertContent(
      `
    <div class="tabs">
      <a class="tab tab-lifted tab-active">Tab 1</a>
      <a class="tab tab-lifted">Tab 2</a>
      <a class="tab tab-lifted">Tab 3</a>
    </div>
    <div class="p-4 bg-base-100 rounded-lg">Tab content here</div>
  `,
    )
    .run();
};
</script>
<template>
  <UContainer class="flex border rounded-2xl">
    <!-- Basic Text Formatting -->
    <div class="flex space-x-1">
      <UButton
        :variant="editor.isActive('bold') ? 'solid' : 'soft'"
        @click="editor.chain().focus().toggleBold().run()"
        icon="i-lucide-bold"
      />
      <UButton
        :variant="editor.isActive('italic') ? 'solid' : 'soft'"
        @click="editor.chain().focus().toggleItalic().run()"
        icon="i-lucide-italic"
      />
      <UButton
        :variant="editor.isActive('underline') ? 'solid' : 'soft'"
        @click="editor.chain().focus().toggleUnderline().run()"
        icon="i-lucide-underline"
      />
      <UButton
        :variant="editor.isActive('strike') ? 'solid' : 'soft'"
        @click="editor.chain().focus().toggleStrike().run()"
        icon="i-lucide-strikethrough"
      />
    </div>

    <!-- Text Alignment -->
    <div class="flex space-x-1">
      <UButton
        :variant="editor.isActive({ textAlign: 'left' }) ? 'solid' : 'soft'"
        @click="editor.chain().focus().setTextAlign('left').run()"
        icon="i-lucide-align-left"
      />
      <UButton
        :variant="editor.isActive({ textAlign: 'center' }) ? 'solid' : 'soft'"
        @click="editor.chain().focus().setTextAlign('center').run()"
        icon="i-lucide-text-align-center"
      />
      <UButton
        :variant="editor.isActive({ textAlign: 'right' }) ? 'solid' : 'soft'"
        @click="editor.chain().focus().setTextAlign('right').run()"
        icon="i-lucide-align-right"
      />
      <UButton
        :variant="editor.isActive({ textAlign: 'justify' }) ? 'solid' : 'soft'"
        @click="editor.chain().focus().setTextAlign('justify').run()"
        icon="i-lucide-text-align-justify"
      />
    </div>

    <div class="divider divider-horizontal mx-1"></div>

    <!-- Heading Levels -->
    <UDropdownMenu>
      <label tabindex="0" class="btn btn-sm">
        <span v-if="currentHeading">H{{ currentHeading }}</span>
        <span v-else>Paragraph</span>
      </label>
    </UDropdownMenu>

    <div class="divider divider-horizontal mx-1"></div>

    <!-- Lists -->
    <div class="flex space-x-1">
      <UButton
        :variant="editor.isActive('bulletList') ? 'solid' : 'soft'"
        @click="editor.chain().focus().toggleBulletList().run()"
        icon="i-lucide-list"
      />
      <UButton
        :variant="editor.isActive('orderedList') ? 'solid' : 'soft'"
        @click="editor.chain().focus().toggleOrderedList().run()"
        icon="i-lucide-list-ordered"
      />
    </div>

    <div class="divider divider-horizontal mx-1"></div>

    <!-- Links and Media -->
    <!-- <div class="flex space-x-1"> -->
    <!--   <UButton class="btn btn-sm" :class="{ 'btn-primary': editor.isActive('link') }" @click="setLink" icon="Add Link"> -->
    <!--     <i class="fas fa-link"></i> -->
    <!--   </button> -->
    <!--   <UButton class="btn btn-sm" @click="addImage" icon="Add Image"> -->
    <!--     <i class="fas fa-image"></i> -->
    <!--   </button> -->
    <!--   <UButton class="btn btn-sm" @click="addVideo" icon="Add Video"> -->
    <!--     <i class="fas fa-video"></i> -->
    <!--   </button> -->
    <!-- </div> -->
    <!---->
    <!-- <div class="divider divider-horizontal mx-1"></div> -->

    <!-- Advanced Features -->
    <UDropdownMenu :items="blockItems">
      <label tabindex="0" class="btn btn-sm"> Insert Block </label>
    </UDropdownMenu>

    <!-- Color Picker -->
    <UDropdownMenu :items="colorItems">
      <UIcon name="i-lucide-paint-bucket" />
    </UDropdownMenu>

    <!-- Undo/Redo -->
    <div class="flex space-x-1 ml-auto">
      <UButton
        :variant="editor.can().undo() ? 'solid' : 'soft'"
        @click="editor.chain().focus().undo().run()"
        :disabled="!editor.can().undo()"
        icon="i-lucide-undo-dot"
      />
      <UButton
        :variant="editor.can().redo() ? 'solid' : 'soft'"
        @click="editor.chain().focus().redo().run()"
        :disabled="!editor.can().redo()"
        icon="i-lucide-redo-dot"
      />
    </div>
  </UContainer>
</template>
