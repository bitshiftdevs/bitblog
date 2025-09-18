import { Node } from '@tiptap/vue-3';

export { Paragraph } from '@tiptap/extension-paragraph';
export { Heading } from '@tiptap/extension-heading';
export { Document } from '@tiptap/extension-document';
export { Text } from '@tiptap/extension-text';
export { BulletList } from '@tiptap/extension-bullet-list';
export { OrderedList } from '@tiptap/extension-ordered-list';
export { CodeBlock } from '@tiptap/extension-code-block';
export { ListItem } from '@tiptap/extension-list-item';
export { HorizontalRule } from '@tiptap/extension-horizontal-rule';
export { Typography } from '@tiptap/extension-typography';
export { StarterKit } from '@tiptap/starter-kit';
export { Underline } from '@tiptap/extension-underline';
export { Link } from '@tiptap/extension-link';
export { Image } from '@tiptap/extension-image';
export { TextAlign } from '@tiptap/extension-text-align';
export { Placeholder } from '@tiptap/extension-placeholder';
export { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
export { Color } from '@tiptap/extension-color';
export { TextStyle } from '@tiptap/extension-text-style';
export { Highlight } from '@tiptap/extension-highlight';
export { Youtube } from '@tiptap/extension-youtube';
export { TaskList } from '@tiptap/extension-task-list';
export { TaskItem } from '@tiptap/extension-task-item';
export { CharacterCount } from '@tiptap/extension-character-count';

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
