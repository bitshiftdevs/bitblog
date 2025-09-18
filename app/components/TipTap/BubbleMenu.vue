<script setup lang="ts">
import { ref } from 'vue'
import { BubbleMenu } from '@tiptap/vue-3'
const { editor } = defineProps<{ editor: any }>()

const showColorPicker = ref(false)

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

const setLink = () => {
  const previousUrl = editor.getAttributes('link').href
  const url = window.prompt('URL', previousUrl)

  // cancelled
  if (url === null) {
    return
  }

  // empty
  if (url === '') {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }

  // add http:// if it doesn't exist
  const fullUrl = url.match(/^https?:\/\//) ? url : `https://${url}`

  // update link
  editor.chain().focus().extendMarkRange('link').setLink({ href: fullUrl }).run()
}

const toggleColorPicker = () => {
  showColorPicker.value = !showColorPicker.value
}

const setTextColor = (color: any) => {
  editor.chain().focus().setColor(color).run()
  showColorPicker.value = false
}
</script>

<template>
  <bubble-menu :editor="editor" :tippy-options="{ duration: 100 }">
    <div class="flex items-center bg-white shadow-lg rounded-lg border border-gray-200 p-1">
      <!-- Basic Text Formatting -->
      <button class="p-1 rounded hover:bg-gray-100" :class="{ 'bg-primary text-white': editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()" title="Bold">
        <i class="fas fa-bold text-sm"></i>
      </button>

      <button class="p-1 rounded hover:bg-gray-100" :class="{ 'bg-primary text-white': editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()" title="Italic">
        <i class="fas fa-italic text-sm"></i>
      </button>

      <button class="p-1 rounded hover:bg-gray-100" :class="{ 'bg-primary text-white': editor.isActive('underline') }"
        @click="editor.chain().focus().toggleUnderline().run()" title="Underline">
        <i class="fas fa-underline text-sm"></i>
      </button>

      <!-- Link -->
      <button class="p-1 rounded hover:bg-gray-100" :class="{ 'bg-primary text-white': editor.isActive('link') }"
        @click="setLink" title="Add Link">
        <i class="fas fa-link text-sm"></i>
      </button>

      <!-- Text Color -->
      <div class="relative">
        <button class="p-1 rounded hover:bg-gray-100" @click="toggleColorPicker" title="Text Color">
          <i class="fas fa-palette text-sm"></i>
        </button>
        <div v-if="showColorPicker" class="absolute top-full left-0 mt-1 p-2 bg-white shadow-lg rounded-lg z-10">
          <div class="grid grid-cols-5 gap-1">
            <button v-for="color in textColors" :key="color" class="w-4 h-4 rounded-full"
              :style="{ backgroundColor: color }" @click="setTextColor(color)"></button>
          </div>
        </div>
      </div>

      <!-- Highlight -->
      <button class="p-1 rounded hover:bg-gray-100" :class="{ 'bg-primary text-white': editor.isActive('highlight') }"
        @click="editor.chain().focus().toggleHighlight().run()" title="Highlight">
        <i class="fas fa-highlighter text-sm"></i>
      </button>

      <!-- Inline Code -->
      <button class="p-1 rounded hover:bg-gray-100" :class="{ 'bg-primary text-white': editor.isActive('code') }"
        @click="editor.chain().focus().toggleCode().run()" title="Inline Code">
        <i class="fas fa-code text-sm"></i>
      </button>

      <!-- Clear Formatting -->
      <button class="p-1 rounded hover:bg-gray-100" @click="editor.chain().focus().unsetAllMarks().run()"
        title="Clear Formatting">
        <i class="fas fa-eraser text-sm"></i>
      </button>
    </div>
  </bubble-menu>
</template>
