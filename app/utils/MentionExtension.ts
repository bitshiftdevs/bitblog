import { mergeAttributes, VueRenderer } from '@tiptap/vue-3';
import { useTippy } from 'vue-tippy';
import SuggestionList from '~/components/TipTap/SuggestionList.vue';

export const MentionExtension = Mention.configure({
  HTMLAttributes: { class: 'text-secondary' },
  renderHTML({ options, node }) {
    const v = node.attrs.id;
    return [
      'a',
      mergeAttributes({ href: v.url }, options.HTMLAttributes),
      `${options.suggestion.char}${node.attrs.id.label}`,
    ];
  },
  suggestion: {
    char: '@',
    allowSpaces: false,
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
            interactive: true,
            allowHTML: true,
            trigger: 'manual',
            placement: 'bottom-start',
            duration: 0,
            onMount: (instance) => {
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
          const status = component.ref?.onKeyDown(props.event) as boolean;
          updatePopup(popup, component, props);
          return status;
        },
        onExit() {
          popup.destroy();
          component.destroy();
        },
      };
    },
    items: ({ query }) => {
      const allItems = [
        { label: 'Kratosgado', url: '/admins/kratosgado' },
        { label: 'Prodigygenes', url: '/admins/prodigygenes' },
        { label: 'TClaver', url: '/admins/tclaver' },
        { label: 'Feem', url: '/admins/feem' },
        { label: 'Emma', url: '/admins/emma' },
      ];
      return allItems
        .filter((item) =>
          item.label.toLowerCase().startsWith(query.toLowerCase()),
        )
        .slice(0, 5);
    },
  },
});

export function updatePopup(
  popup: ReturnType<typeof useTippy>,
  component: VueRenderer,
  props: any,
) {
  component.updateProps(props);
  popup.setProps({
    getReferenceClientRect: props.clientRect as () => DOMRect,
    content: component.el?.getHTML(),
  });
}
