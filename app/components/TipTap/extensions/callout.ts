import { Node, mergeAttributes } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import CalloutNode from '../nodes/CalloutNode.vue';

export interface CalloutOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (tag?: string) => ReturnType;
    };
  }
}

export const CalloutExtension = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      type: {
        default: 'note',
        parseHTML: (el) => el.getAttribute('data-callout-type') ?? 'note',
        renderHTML: (attrs) => ({ 'data-callout-type': attrs.type }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-callout]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-callout': '' }), 0];
  },

  addNodeView() {
    return VueNodeViewRenderer(CalloutNode);
  },

  // Markdown serialization (for tiptap-extension-markdown)
  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          state.write(`::${node.attrs.type}\n`);
          state.renderContent(node);
          state.ensureNewLine();
          state.write('::');
          state.closeBlock(node);
        },
        parse: {
          setup(markdownit: any) {
            // Parse ::note ... :: blocks
            markdownit.block.ruler.before(
              'fence',
              'callout',
              (state: any, startLine: number, endLine: number, silent: boolean) => {
                const start = state.bMarks[startLine] + state.tShift[startLine];
                const max = state.eMarks[startLine];
                const line = state.src.slice(start, max);
                const match = line.match(/^::(note|tip|warning|caution)$/);
                if (!match) return false;
                if (silent) return true;

                const type = match[1];
                let nextLine = startLine + 1;
                while (nextLine < endLine) {
                  const lineStart = state.bMarks[nextLine] + state.tShift[nextLine];
                  const lineEnd = state.eMarks[nextLine];
                  if (state.src.slice(lineStart, lineEnd).trim() === '::') break;
                  nextLine++;
                }

                state.line = nextLine + 1;
                const token = state.push('callout_open', 'div', 1);
                token.attrSet('data-callout', '');
                token.attrSet('data-callout-type', type);
                token.map = [startLine, state.line];
                token.markup = match[0];

                state.md.block.tokenize(state, startLine + 1, nextLine);
                state.push('callout_close', 'div', -1);
                return true;
              },
            );
          },
          token: 'callout_open',
        },
      },
    };
  },
});
