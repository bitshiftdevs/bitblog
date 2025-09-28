import Suggestion from '@tiptap/suggestion';
import { Extension, VueRenderer } from '@tiptap/vue-3';
import { useTippy } from 'vue-tippy';
import SuggestionList from '~/components/TipTap/SuggestionList.vue';
import { Modal, type TiptapCommandType } from '~~/shared/types';

export const SlashCommands = Extension.create({
  name: 'slashcommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: TiptapCommandType) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    const editorStore = useEditorStore();
    const editor = this.editor;
    return [
      Suggestion({
        editor,
        char: '/',
        allowSpaces: true,
        items: ({ query }) => {
          const commands: {
            label: string;
            command: ({ editor, range }: TiptapCommandType) => void;
          }[] = [
            {
              label: 'Heading 1',
              command: ({ editor, range }: TiptapCommandType) => {
                editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
              },
            },
            {
              label: 'Heading 2',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
              },
            },
            {
              label: 'Heading 3',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
              },
            },
            {
              label: 'Heading 4',
              command: ({ editor, range }: TiptapCommandType) => {
                editor.chain().focus().deleteRange(range).setHeading({ level: 4 }).run();
              },
            },
            {
              label: 'Heading 5',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setHeading({ level: 5 }).run();
              },
            },
            {
              label: 'Heading 6',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setHeading({ level: 6 }).run();
              },
            },
            {
              label: 'Link',
              command({ editor }) {
                const { from, to } = editor.state.selection;
                editorStore.linkText = editor.state.doc.textBetween(from, to, ' ');
                editorStore.openModal(Modal.link, editor);
              },
            },
            {
              label: 'Youtube',
              command({ editor }) {
                editorStore.openModal(Modal.youtube, editor);
              },
            },
            {
              label: 'Image',
              command({ editor }) {
                editorStore.openModal(Modal.image, editor);
              },
            },

            {
              label: 'Bullet List',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleBulletList().run();
              },
            },
            {
              label: 'Numbered List',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleOrderedList().run();
              },
            },
            {
              label: 'Task List',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleTaskList().run();
              },
            },
            {
              label: 'Code Block',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
              },
            },
            {
              label: 'Blockquote',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleBlockquote().run();
              },
            },
            {
              label: 'Horizontal Rule',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setHorizontalRule().run();
              },
            },
            // {
            //   label: 'Table',
            //   command: ({ editor, range }) => {
            //     editor
            //       .chain()
            //       .focus()
            //       .deleteRange(range)
            //       .insertTable({ rows: 3, cols: 3 })
            //       .run();
            //   },
            // },
            {
              label: 'Mathematics',
              command: ({ editor, range }) => {
                // editor.chain().focus().deleteRange(range).insertMathInline().run()
              },
            },
            {
              label: 'Emoji',
              command: ({ editor, range }) => {
                // editor.chain().focus().deleteRange(range).insertEmoji({ emoji: '😀' }).run()
              },
            },
            {
              label: 'Details',
              command: ({ editor, range }) => {
                // editor.chain().focus().deleteRange(range).insertDetails().run()
              },
            },
          ];

          return commands.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));
        },
        render: () => {
          let component: VueRenderer;
          let popup: ReturnType<typeof useTippy>;

          return {
            onStart: (props) => {
              component = new VueRenderer(SuggestionList, {
                props,
                editor: props.editor,
              });

              popup = useTippy(component.el, {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.el?.getHTML(),
                showOnCreate: true,
                allowHTML: true,
                trigger: 'manual',
                duration: 0,
                onMount: (instance: any) => {
                  // Ensure the popup is on top of the editor
                  instance.popper.style.zIndex = '9999';
                },
              });
            },
            onUpdate(props) {
              updatePopup(popup, component, props);
            },
            onKeyDown(props) {
              if (props.event.key === 'Escape') {
                popup.destroy();
                component.destroy();
                return true;
              }
              const status = component.ref?.onKeyDown(props.event, {
                editor,
                range: props.range,
              }) as boolean;
              updatePopup(popup, component, props);
              return status;
            },
            onExit() {
              popup.destroy();
              component.destroy();
            },
          };
        },
      }),
    ];
  },
});
