import { Node } from '@tiptap/vue-3';

export * from '@tiptap/extension-paragraph';
export * from '@tiptap/extension-heading';
export * from '@tiptap/extension-document';
export * from '@tiptap/extension-text';
export * from '@tiptap/extension-bullet-list';
export { OrderedList } from '@tiptap/extension-ordered-list';
export * from '@tiptap/extension-code-block';
export * from '@tiptap/extension-list-item';
export * from '@tiptap/extension-horizontal-rule';
export * from '@tiptap/extension-typography';
export * from '@tiptap/starter-kit';
export * from '@tiptap/extension-underline';
export * from '@tiptap/extension-link';
export { Image } from '@tiptap/extension-image';
export * from '@tiptap/extension-text-align';
export * from '@tiptap/extension-placeholder';
export * from '@tiptap/extension-code-block-lowlight';
export * from '@tiptap/extension-color';
export * from '@tiptap/extension-text-style';
export { Highlight } from '@tiptap/extension-highlight';
export * from '@tiptap/extension-youtube';
export * from '@tiptap/extension-task-list';
export { TaskItem } from '@tiptap/extension-task-item';
export * from '@tiptap/extension-character-count';
export * from './SlashCommands';

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
