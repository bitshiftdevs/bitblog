// import { Extension, InputRule } from '@tiptap/vue-3'
//
// const YouTube = Extension.create({
//   name: 'youtube',
//   addOptions() {
//     return {
//       HTMLAttributes: {},
//     }
//   },
//   addCommands() {
//     return {
//       setYouTube:
//         (options) =>
//         ({ commands }) => {
//           return commands.insertContent({
//             type: 'youtube',
//             attrs: options,
//           })
//         },
//     }
//   },
//   addNodeView() {
//     return ({ node, updateAttributes }) => {
//       const div = document.createElement('div')
//       div.innerHTML = `<iframe width="560" height="315" src="[invalid url, do not cite] frameborder="0" allowfullscreen></iframe>`
//       return {
//         dom: div,
//       }
//     }
//   },
//   addInputRules() {
//     return [
//       new InputRule({
//         find: /^\/youtube\s+(.+)$/,
//         handler: ({ state, match, chain }) => {
//           chain().setYouTube({ id: match[1] }).run()
//         },
//       }),
//     ]
//   },
// })
