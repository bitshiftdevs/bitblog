<script setup lang="ts">
import IconBullets from '@/components/icons/IconBullets.vue'
import IconCenterAlign from '@/components/icons/IconCenterAlign.vue'
import IconJustifyAlign from '@/components/icons/IconJustifyAlign.vue'
import IconLeftAlign from '@/components/icons/IconLeftAlign.vue'
import IconNumbered from '@/components/icons/IconNumbered.vue'
import IconPallete from '@/components/icons/IconPallete.vue'
import IconRedo from '@/components/icons/IconRedo.vue'
import IconRightAlign from '@/components/icons/IconRightAlign.vue'
import IconStrikeThrough from '@/components/icons/IconStrikeThrough.vue'
import IconUndo from '@/components/icons/IconUndo.vue'
import { getTemplate, templates } from '@/lib/utils/templates'
import { useEditorStore } from '@/stores/editorStore'
import { computed, watch } from 'vue'

const editorStore = useEditorStore()
// const { editor } = defineProps<{ editor: Editor }>()

const { editor } = defineProps<{ editor: any }>()
watch(
  () => editorStore.content,
  (content) => {
    editor.commands.setContent(content)
  },
  { once: true },
)

function insertTemplate(type: string) {
  editor.commands.insertContent(getTemplate(type))
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
]

const currentHeading = computed(() => {
  if (editor.isActive('heading', { level: 1 })) return 1
  if (editor.isActive('heading', { level: 2 })) return 2
  if (editor.isActive('heading', { level: 3 })) return 3
  if (editor.isActive('heading', { level: 4 })) return 4
  if (editor.isActive('heading', { level: 5 })) return 5
  if (editor.isActive('heading', { level: 6 })) return 6
  return null
})

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
  editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}

const insertDivider = () => {
  editor.chain().focus().setHorizontalRule().run()
}

const insertBlockquote = () => {
  editor.chain().focus().toggleBlockquote().run()
}

const insertCodeBlock = () => {
  editor.chain().focus().toggleCodeBlock().run()
}

const insertSpacer = () => {
  // Custom spacer logic would go here
  editor.chain().focus().insertContent('<div class="spacer my-8"></div>').run()
}

const insertButton = () => {
  // Custom button insertion logic
  editor.chain().focus().insertContent('<a class="btn btn-primary">Button Text</a>').run()
}

const insertAccordion = () => {
  // Custom accordion insertion logic
  editor
    .chain()
    .focus()
    .insertContent(
      `
    <div class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
      <input type="checkbox" />
      <div class="collapse-title text-xl font-medium">
        Click to open/close
      </div>
      <div class="collapse-content">
        <p>Content goes here</p>
      </div>
    </div>
  `,
    )
    .run()
}

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
    .run()
}
</script>
<template>
  <div class="editor-menu-bar border-b border-success bg-neutral-50 p-2 flex flex-wrap gap-1 sticky top-0 z-10">
    <!-- Basic Text Formatting -->
    <div class="flex space-x-1">
      <button class="btn btn-sm" :class="{ 'btn-primary': editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()" title="Bold">
        <i class="fas fa-bold">B</i>
      </button>
      <button class="btn btn-sm" :class="{ 'btn-primary': editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()" title="Italic">
        <i class="fas fa-italic">I</i>
      </button>
      <button class="btn btn-sm" :class="{ 'btn-primary': editor.isActive('underline') }"
        @click="editor.chain().focus().toggleUnderline().run()" title="Underline">
        <i class="fas fa-underline">U</i>
      </button>
      <button class="btn btn-sm p-2" :class="{ 'btn-primary': editor.isActive('strike') }"
        @click="editor.chain().focus().toggleStrike().run()" title="Strike">
        <IconStrikeThrough />
      </button>
    </div>

    <!-- Text Alignment -->
    <div class="flex space-x-1">
      <button class="btn btn-sm p-2" :class="{ 'btn-primary': editor.isActive({ textAlign: 'left' }) }"
        @click="editor.chain().focus().setTextAlign('left').run()" title="Align Left">
        <IconLeftAlign />
      </button>
      <button class="btn btn-sm p-2" :class="{ 'btn-primary': editor.isActive({ textAlign: 'center' }) }"
        @click="editor.chain().focus().setTextAlign('center').run()" title="Align Center">
        <IconCenterAlign />
      </button>
      <button class="btn btn-sm p-2" :class="{ 'btn-primary': editor.isActive({ textAlign: 'right' }) }"
        @click="editor.chain().focus().setTextAlign('right').run()" title="Align Right">
        <IconRightAlign />
      </button>
      <button class="btn btn-sm p-2" :class="{ 'btn-primary': editor.isActive({ textAlign: 'justify' }) }"
        @click="editor.chain().focus().setTextAlign('justify').run()" title="Justify">
        <IconJustifyAlign />
      </button>
    </div>

    <div class="divider divider-horizontal mx-1"></div>

    <!-- Heading Levels -->
    <div class="dropdown dropdown-hover">
      <label tabindex="0" class="btn btn-sm">
        <span v-if="currentHeading">H{{ currentHeading }}</span>
        <span v-else>Paragraph</span>
      </label>
      <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
        <li><a @click="editor.chain().focus().setParagraph().run()">Paragraph</a></li>
        <li><a @click="editor.chain().focus().toggleHeading({ level: 1 }).run()">Heading 1</a></li>
        <li><a @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">Heading 2</a></li>
        <li><a @click="editor.chain().focus().toggleHeading({ level: 3 }).run()">Heading 3</a></li>
        <li><a @click="editor.chain().focus().toggleHeading({ level: 4 }).run()">Heading 4</a></li>
        <li><a @click="editor.chain().focus().toggleHeading({ level: 5 }).run()">Heading 5</a></li>
        <li><a @click="editor.chain().focus().toggleHeading({ level: 6 }).run()">Heading 6</a></li>
      </ul>
    </div>

    <div class="divider divider-horizontal mx-1"></div>

    <!-- Lists -->
    <div class="flex space-x-1">
      <button class="btn btn-sm p-2" :class="{ 'btn-primary': editor.isActive('bulletList') }"
        @click="editor.chain().focus().toggleBulletList().run()" title="Bullet List">
        <IconBullets />
      </button>
      <button class="btn btn-sm p-2" :class="{ 'btn-primary': editor.isActive('orderedList') }"
        @click="editor.chain().focus().toggleOrderedList().run()" title="Numbered List">
        <IconNumbered />
      </button>
    </div>

    <div class="divider divider-horizontal mx-1"></div>

    <!-- Links and Media -->
    <!-- <div class="flex space-x-1"> -->
    <!--   <button class="btn btn-sm" :class="{ 'btn-primary': editor.isActive('link') }" @click="setLink" title="Add Link"> -->
    <!--     <i class="fas fa-link"></i> -->
    <!--   </button> -->
    <!--   <button class="btn btn-sm" @click="addImage" title="Add Image"> -->
    <!--     <i class="fas fa-image"></i> -->
    <!--   </button> -->
    <!--   <button class="btn btn-sm" @click="addVideo" title="Add Video"> -->
    <!--     <i class="fas fa-video"></i> -->
    <!--   </button> -->
    <!-- </div> -->
    <!---->
    <!-- <div class="divider divider-horizontal mx-1"></div> -->

    <!-- Advanced Features -->
    <div class="dropdown dropdown-hover">
      <label tabindex="0" class="btn btn-sm"> Insert Block </label>
      <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
        <li><a @click="insertTable">Table</a></li>
        <li><a @click="insertDivider">Divider</a></li>
        <li><a @click="insertBlockquote">Blockquote</a></li>
        <li><a @click="insertCodeBlock">Code Block</a></li>
        <li><a @click="insertSpacer">Spacer</a></li>
        <li><a @click="insertButton">Button</a></li>
        <li><a @click="insertAccordion">Accordion</a></li>
        <li><a @click="insertTabs">Tabs</a></li>
      </ul>
    </div>

    <!-- Color Picker -->
    <div class="dropdown dropdown-hover">
      <label tabindex="0" class="btn btn-sm">
        <IconPallete />
      </label>
      <div tabindex="0" class="dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-52">
        <div class="grid grid-cols-5 gap-1">
          <button v-for="color in textColors" :key="color" class="w-6 h-6 rounded-full"
            :style="{ backgroundColor: color }" @click="editor.chain().focus().setColor(color).run()"></button>
        </div>
      </div>
    </div>

    <div class="dropdown dropdown-hover">
      <label for="templates" class="btn btn-sm"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="3" x2="9" y2="21"></line>
        </svg>
        Templates</label>

      <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
        <li v-for="t in templates">
          <a @click="insertTemplate(t)">{{ t }}</a>
        </li>
      </ul>
    </div>

    <!-- Undo/Redo -->
    <div class="flex space-x-1 ml-auto">
      <button class="btn btn-sm p-2" @click="editor.chain().focus().undo().run()" :disabled="!editor.can().undo()"
        title="Undo">
        <IconUndo />
      </button>
      <button class="btn btn-sm p-2" @click="editor.chain().focus().redo().run()" :disabled="!editor.can().redo()"
        title="Redo">
        <IconRedo />
      </button>
    </div>
  </div>
</template>
