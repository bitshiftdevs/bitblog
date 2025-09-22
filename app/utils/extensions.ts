import { Node } from '@tiptap/vue-3';

export { Typography } from '@tiptap/extension-typography';
export { Underline } from '@tiptap/extension-underline';
export { Image as TipTapImage } from '@tiptap/extension-image';
export { TextAlign } from '@tiptap/extension-text-align';
export { Placeholder } from '@tiptap/extension-placeholder';
export { Color } from '@tiptap/extension-color';
export { TextStyle } from '@tiptap/extension-text-style';
export { Focus } from '@tiptap/extension-focus';
export { Highlight } from '@tiptap/extension-highlight';
export { Youtube } from '@tiptap/extension-youtube';
export { TaskList } from '@tiptap/extension-task-list';
export { TaskItem } from '@tiptap/extension-task-item';
export { CharacterCount } from '@tiptap/extension-character-count';
export { Mention } from '@tiptap/extension-mention';

import Callout from '@/utils/extensions/callout';
export { Callout };

// Custom extension for shortcodes
export const Shortcode = Node.create({
  name: 'shortcode',
  group: 'inline',
  inline: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      name: {
        default: 'shortcode',
      },
      attributes: {
        default: {},
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-shortcode]',
      },
    ];
  },

  renderHTML({ node }) {
    return [
      'span',
      { 'data-shortcode': node.attrs.name },
      `[${node.attrs.name}]`,
    ];
  },
});

export const Widget = Node.create({
  name: 'widget',
  group: 'block',
  draggable: true,

  addAttributes() {
    return {
      type: {
        default: 'basic',
      },
      data: {
        default: {},
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-widget]',
      },
    ];
  },

  renderHTML({ node }) {
    return [
      'div',
      { 'data-widget': node.attrs.type, class: 'widget-container' },
      'Widget: ' + node.attrs.type,
    ];
  },
});
