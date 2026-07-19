import type { EditorCustomHandlers } from '@nuxt/ui';
import type { Editor } from '@tiptap/vue-3';

export const customHandlers = {
  imageUpload: {
    canExecute: (editor: Editor) => editor.can().insertContent({ type: 'imageUpload' }),
    execute: (editor: Editor) => editor.chain().focus().insertContent({ type: 'imageUpload' }),
    isActive: (editor: Editor) => editor.isActive('imageUpload'),
    isDisabled: undefined,
  },
  callout: {
    canExecute: (editor: Editor) => editor.can().insertContent({ type: 'callout' }),
    execute: (editor: Editor) =>
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'callout',
          attrs: { type: 'note' },
          content: [{ type: 'paragraph' }],
        }),
    isActive: (editor: Editor) => editor.isActive('callout'),
    isDisabled: undefined,
  },
} satisfies EditorCustomHandlers;
