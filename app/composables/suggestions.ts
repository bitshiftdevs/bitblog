import Suggestion from '@tiptap/suggestion';
import type { Editor } from '@tiptap/vue-3';

import type { TiptapCommandType } from '~~/shared/types';

// Command suggestion configuration
export const suggestions = (editor: Editor) => {
  const editorStore = useEditorStore();
  Suggestion({
    editor: editor,
    char: '/',
    items: ({ query }) => {
      const commands: {
        title: string;
        command: ({ editor, range }: TiptapCommandType) => void;
      }[] = [
        {
          title: 'Heading 1',
          command: ({ editor, range }: TiptapCommandType) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .setHeading({ level: 1 })
              .run();
          },
        },
        {
          title: 'Heading 2',
          command: ({ editor, range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .setHeading({ level: 2 })
              .run();
          },
        },
        {
          title: 'Heading 3',
          command: ({ editor, range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .setHeading({ level: 3 })
              .run();
          },
        },
        {
          title: 'Heading 4',
          command: ({ editor, range }: TiptapCommandType) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .setHeading({ level: 4 })
              .run();
          },
        },
        {
          title: 'Heading 5',
          command: ({ editor, range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .setHeading({ level: 5 })
              .run();
          },
        },
        {
          title: 'Heading 6',
          command: ({ editor, range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .setHeading({ level: 6 })
              .run();
          },
        },
        {
          title: 'Link',
          command({ editor }) {
            const { from, to } = editor.state.selection;
            editorStore.linkText = editor.state.doc.textBetween(from, to, ' ');
            editorStore.openModal(Modal.link);
          },
        },
        {
          title: 'Youtube',
          command() {
            editorStore.openModal(Modal.youtube);
          },
        },
        {
          title: 'Image',
          command() {
            editorStore.openModal(Modal.image);
          },
        },

        {
          title: 'Bullet List',
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBulletList().run();
          },
        },
        {
          title: 'Numbered List',
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleOrderedList().run();
          },
        },
        {
          title: 'Task List',
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleTaskList().run();
          },
        },
        {
          title: 'Code Block',
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
          },
        },
        {
          title: 'Blockquote',
          command: ({ editor, range }) => {
            (editor.chain().focus().deleteRange(range) as any)
              .toggleBlockquote()
              .run();
          },
        },
        {
          title: 'Horizontal Rule',
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHorizontalRule().run();
          },
        },
        // {
        //   title: 'Table',
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
          title: 'Mathematics',
          command: ({ editor, range }) => {
            // editor.chain().focus().deleteRange(range).insertMathInline().run()
          },
        },
        {
          title: 'Emoji',
          command: ({ editor, range }) => {
            // editor.chain().focus().deleteRange(range).insertEmoji({ emoji: '😀' }).run()
          },
        },
        {
          title: 'Details',
          command: ({ editor, range }) => {
            // editor.chain().focus().deleteRange(range).insertDetails().run()
          },
        },
      ];

      return commands.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()),
      );
    },
    render: () => {
      let popup: HTMLUListElement;
      let items: HTMLLIElement[];
      let selectedIndex = 0;

      const onKeyDown = (event: KeyboardEvent) => {};

      const updateSelection = () => {
        items.forEach((item, index) => {
          const a = item.getElementsByTagName('a');
          if (index === selectedIndex) {
            a[0]?.classList.add('menu-active');
          } else {
            a[0]?.classList.remove('menu-active');
          }
        });
      };

      return {
        onStart: (props) => {
          popup = document.createElement('ul');
          popup.classList.add(
            'absolute',
            'z-50',
            'menu',
            'bg-base-200',
            'rounded-box',
            'w-56',
            'shadow-xl',
            'rounded-md',
          );
          popup.style.minWidth = '180px';

          items = props.items.map((item, index) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.textContent = item.title;
            // button.textContent = item.title;
            li.addEventListener('click', () => {
              item.command({ editor, range: props.range, props: props });
              props.editor.commands.focus();
            });

            if (index === selectedIndex) {
              a.classList.add('menu-active');
              a.focus();
            }

            li.appendChild(a);
            return li;
          });

          items.forEach((item) => popup.appendChild(item));

          document.body.appendChild(popup);

          const { left, bottom } = props.clientRect!()!;
          popup.style.left = `${left}px`;
          popup.style.top = `${bottom}px`;

          document.addEventListener('keydown', onKeyDown);
        },

        onUpdate: (props) => {
          const { left, bottom } = props.clientRect!()!;
          popup.style.left = `${left}px`;
          popup.style.top = `${bottom}px`;

          // Update items
          while (popup.firstChild) {
            popup.removeChild(popup.firstChild);
          }

          items = props.items.map((item, index) => {
            const li = document.createElement('li');
            li.addEventListener('click', () => {
              item.command({ editor, range: props.range, props: {} });
              props.editor.commands.focus();
            });

            const a = document.createElement('a');
            a.textContent = item.title;
            if (index === selectedIndex) {
              a.classList.add('menu-active');
            }
            li.appendChild(a);

            return li;
          });

          items.forEach((item) => popup.appendChild(item));
        },

        onKeyDown: ({ event }) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            return true;
          }
          if (event.key === 'ArrowUp') {
            selectedIndex = (selectedIndex - 1 + items.length) % items.length;
            updateSelection();
            event.preventDefault();
            return true;
          }

          if (event.key === 'ArrowDown') {
            selectedIndex = (selectedIndex + 1) % items.length;
            updateSelection();
            event.preventDefault();
            return true;
          }
          if (event.key === 'Escape') {
            popup.remove();
            document.removeEventListener('keydown', onKeyDown);
            return true;
          }

          if (event.key === 'Tab') {
            items[selectedIndex]?.click();
            event.preventDefault();
            return true;
          }

          return false;
        },

        onExit: () => {
          popup.remove();
          document.removeEventListener('keydown', onKeyDown);
        },
      };
    },
  });
};
