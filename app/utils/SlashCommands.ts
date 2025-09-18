import { Extension } from '@tiptap/vue-3';
import type { TiptapCommandType } from '~~/shared/types';

export const SlashCommands = Extension.create({
  name: 'slashcommands',

  addOptions() {
    return {
      suggestion: {
        // char: '/',
        command: ({ editor, range, props }: TiptapCommandType) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [suggestions(this.editor as any)];
  },
});
