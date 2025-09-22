import type { AnyExtension, Extensions } from '@tiptap/core';

const lowlight = createLowlight(commonLanguages);
export const tiptapExtenstions: Extensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3, 4, 5, 6],
    },
    codeBlock: false,
  }),
  MentionExtension,
  CodeBlockLowlight.configure({ lowlight }),
  SlashCommands,
  // Callout,
  TOC.configure({
    levels: [1, 2, 3],
    updateEvent: 'update:toc',
  }),
  // BubbleMenu.configure({
  //   element: document.querySelector('#bubblemenu') as any,
  //   shouldShow: ({ editor, view, state, oldState, from, to }) => {
  //     return editor.isActive('myMark')
  //   },
  // }),
  TipTapImage.configure({
    allowBase64: true,
    inline: true,
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  Placeholder.configure({
    placeholder: 'Start writing your amazing blog post...',
  }),
  Color,
  // Highlight,
  // Table.configure({
  //   resizable: true,
  // }),
  // TableRow,
  // TableCell,
  // TableHeader,
  Youtube.configure({
    width: 640,
    height: 480,
    controls: true,
  }),
  TaskList,
  TaskItem,
  CharacterCount,
  // Dropcursor,
  Focus.configure({
    className: 'has-focus',
    mode: 'all',
  }),
  Shortcode,
  Widget,
];
export function useBlogEditor() {
  const editorStore = useEditorStore();
  const editor = useEditor({
    extensions: tiptapExtenstions,
    content: editorStore.content || '',
    autofocus: 'end',
    editable: true,
    injectCSS: true,
    onUpdate: ({ editor }) => {
      editorStore.setContent(editor.getJSON(), editor.getText());
    },
  });

  const destroyEditor = () => {
    if (editor.value) {
      editor.value.destroy();
      editor.value = undefined;
    }
  };

  const insertTemplate = (template: string) => {
    if (editor.value) {
      editor.value.commands.insertContent(template);
    }
  };

  const insertShortcode = (name: string, attributes = {}) => {
    if (editor.value) {
      editor.value.commands.insertContent({
        type: 'shortcode',
        attrs: {
          name,
          attributes,
        },
      });
    }
  };

  const insertWidget = (type: string, data = {}) => {
    if (editor.value) {
      editor.value.commands.insertContent({
        type: 'widget',
        attrs: {
          type,
          data,
        },
      });
    }
  };

  return {
    editor,
    destroyEditor,
    insertTemplate,
    insertShortcode,
    insertWidget,
  };
}
