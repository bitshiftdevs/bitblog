import type { DropdownMenuItem } from '@nuxt/ui';
import { mapEditorItems } from '@nuxt/ui/utils/editor';
import type { Editor, JSONContent } from '@tiptap/vue-3';
import { upperFirst } from 'scule'; // TODO: might remove scule
import { customHandlers } from './customHandlers';

export const handleItems = (
  editor: Editor,
  selectedNode?: { node: JSONContent; pos: number },
): DropdownMenuItem[][] => {
  if (!selectedNode?.node?.type) {
    return [];
  }

  return mapEditorItems(
    editor,
    [
      [
        {
          type: 'label',
          label: upperFirst(selectedNode.node.type),
        },
        {
          label: 'Turn into',
          icon: 'i-lucide-repeat-2',
          children: [
            { kind: 'paragraph', label: 'Paragraph', icon: 'i-lucide-type' },
            {
              kind: 'heading',
              level: 1,
              label: 'Heading 1',
              icon: 'i-lucide-heading-1',
            },
            {
              kind: 'heading',
              level: 2,
              label: 'Heading 2',
              icon: 'i-lucide-heading-2',
            },
            {
              kind: 'heading',
              level: 3,
              label: 'Heading 3',
              icon: 'i-lucide-heading-3',
            },
            {
              kind: 'heading',
              level: 4,
              label: 'Heading 4',
              icon: 'i-lucide-heading-4',
            },
            { kind: 'bulletList', label: 'Bullet List', icon: 'i-lucide-list' },
            {
              kind: 'orderedList',
              label: 'Ordered List',
              icon: 'i-lucide-list-ordered',
            },
            {
              kind: 'blockquote',
              label: 'Blockquote',
              icon: 'i-lucide-text-quote',
            },
            {
              kind: 'codeBlock',
              label: 'Code Block',
              icon: 'i-lucide-square-code',
            },
          ],
        },
        {
          kind: 'clearFormatting',
          pos: selectedNode?.pos,
          label: 'Reset formatting',
          icon: 'i-lucide-rotate-ccw',
        },
      ],
      [
        {
          kind: 'duplicate',
          pos: selectedNode?.pos,
          label: 'Duplicate',
          icon: 'i-lucide-copy',
        },
        {
          label: 'Copy to clipboard',
          icon: 'i-lucide-clipboard',
          onSelect: async () => {
            if (!selectedNode) return;

            const pos = selectedNode.pos;
            const node = editor.state.doc.nodeAt(pos);
            if (node) {
              await navigator.clipboard.writeText(node.textContent);
            }
          },
        },
      ],
      [
        {
          kind: 'moveUp',
          pos: selectedNode?.pos,
          label: 'Move up',
          icon: 'i-lucide-arrow-up',
        },
        {
          kind: 'moveDown',
          pos: selectedNode?.pos,
          label: 'Move down',
          icon: 'i-lucide-arrow-down',
        },
      ],
      [
        {
          kind: 'delete',
          pos: selectedNode?.pos,
          label: 'Delete',
          icon: 'i-lucide-trash',
        },
      ],
    ],
    customHandlers,
  ) as DropdownMenuItem[][];
};
