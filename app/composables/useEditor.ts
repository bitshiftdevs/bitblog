import { useEditor, type AnyExtension } from '@tiptap/vue-3';
import Focus from '@tiptap/extension-focus';
import { common } from 'lowlight';
const { lowlight } = common;
import {
  StarterKit,
  Image,
  Highlight,
  TaskItem,
  TextAlign,
  Placeholder,
  TextStyle,
  Color,
  Youtube,
  TaskList,
  CharacterCount,
  Shortcode,
  Widget,
} from '~/utils/extensions';
import TOC from '~/utils/TOCExtension';

export function useBlogEditor() {
  const editorStore = useEditorStore();
  let editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }) as AnyExtension,
      // SlashCommands,
      TOC.configure({
        levels: [1, 2, 3],
        updateEvent: 'update:toc',
      }),
      // Underline,
      // BubbleMenu.configure({
      //   element: document.querySelector('#bubblemenu') as any,
      //   shouldShow: ({ editor, view, state, oldState, from, to }) => {
      //     return editor.isActive('myMark')
      //   },
      // }),
      // Link.configure({
      //   openOnClick: false,
      //   linkOnPaste: true,
      //   HTMLAttributes: {
      //     class: 'text-primary underline',
      //   },
      // }),
      Image.configure({
        allowBase64: true,
        inline: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Start writing your amazing blog post...',
      }),
      // CodeBlockLowlight.configure({
      //   lowlight,
      // }),
      TextStyle,
      Color,
      Highlight,
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
    ],
    content: editorStore.content || '',
    autofocus: 'end',
    editable: true,
    injectCSS: true,
    onUpdate: ({ editor }) => {
      editorStore.setContent(editor.getHTML());
    },
    onFocus: ({ editor }) => {
      console.log('Editor focused');
    },
    onBlur: () => {
      console.log('Editor blurred');
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
