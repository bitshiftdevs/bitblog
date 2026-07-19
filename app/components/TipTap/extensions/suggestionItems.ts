import type { EditorEmojiMenuItem, EditorMentionMenuItem, EditorSuggestionMenuItem } from '@nuxt/ui';
import { gitHubEmojis } from '@tiptap/extension-emoji';
import type { customHandlers } from './customHandlers';

export const suggestionItems = [
  [
    {
      type: 'label',
      label: 'Style',
    },
    {
      kind: 'paragraph',
      label: 'Paragraph',
      icon: 'i-lucide-type',
    },
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
      kind: 'bulletList',
      label: 'Bullet List',
      icon: 'i-lucide-list',
    },
    {
      kind: 'orderedList',
      label: 'Numbered List',
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
  [
    {
      type: 'label',
      label: 'Insert',
    },
    {
      kind: 'mention',
      label: 'Mention',
      icon: 'i-lucide-at-sign',
    },
    {
      kind: 'emoji',
      label: 'Emoji',
      icon: 'i-lucide-smile-plus',
    },
    {
      kind: 'imageUpload',
      label: 'Image',
      icon: 'i-lucide-image',
    },
    {
      kind: 'horizontalRule',
      label: 'Horizontal Rule',
      icon: 'i-lucide-separator-horizontal',
    },

    {
      kind: 'callout',
      label: 'Callout',
      icon: 'i-lucide-info',
    },
  ],
] satisfies EditorSuggestionMenuItem<typeof customHandlers>[][];

export const mentionItems: EditorMentionMenuItem[] = [
  {
    label: 'benjamincanac',
    avatar: {
      src: 'https://avatars.githubusercontent.com/u/739984?v=4',
      loading: 'lazy' as const,
    },
  },
  {
    label: 'HugoRCD',
    avatar: {
      src: 'https://avatars.githubusercontent.com/u/71938701?v=4',
      loading: 'lazy' as const,
    },
  },
  {
    label: 'romhml',
    avatar: {
      src: 'https://avatars.githubusercontent.com/u/25613751?v=4',
      loading: 'lazy' as const,
    },
  },
  {
    label: 'sandros94',
    avatar: {
      src: 'https://avatars.githubusercontent.com/u/13056429?v=4',
      loading: 'lazy' as const,
    },
  },
  {
    label: 'hywax',
    avatar: {
      src: 'https://avatars.githubusercontent.com/u/149865959?v=4',
      loading: 'lazy' as const,
    },
  },
  {
    label: 'J-Michalek',
    avatar: {
      src: 'https://avatars.githubusercontent.com/u/71264422?v=4',
      loading: 'lazy' as const,
    },
  },
  {
    label: 'genu',
    avatar: {
      src: 'https://avatars.githubusercontent.com/u/928780?v=4',
      loading: 'lazy' as const,
    },
  },
];

export const emojiItems: EditorEmojiMenuItem[] = gitHubEmojis.filter(
  (emoji) => !emoji.name.startsWith('regional_indicator_'),
);
