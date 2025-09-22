<template>
  <div class="prose prose-lg dark:prose-invert max-w-none" v-html="html" />
</template>

<script setup lang="ts">
import { generateHTML } from '@tiptap/core';

interface Props {
  content: any; // TipTap JSON content
}

const { content } = defineProps<Props>();

const html = generateHTML(content, tiptapExtenstions);
// // Simple renderer for TipTap JSON content
// // In a real app, you might want to use @tiptap/html or implement a more sophisticated renderer
// const renderedContent = computed(() => {
//   if (!props.content) return '';
//
//   if (typeof props.content !== 'object') return props.content;
//
//   try {
//     return renderTipTapContent(props.content);
//   } catch (error) {
//     console.error('Error rendering content:', error);
//     return '<p>Error rendering content</p>';
//   }
// });
//
// function renderTipTapContent(content: any): string {
//   if (!content || !content.content) return '';
//
//   return content.content.map((node: any) => renderNode(node)).join('');
// }
//
// function renderNode(node: any): string {
//   if (!node) return '';
//
//   switch (node.type) {
//     case 'paragraph':
//       return `<p>${renderContent(node.content)}</p>`;
//
//     case 'heading':
//       const level = node.attrs?.level || 1;
//       return `<h${level}>${renderContent(node.content)}</h${level}>`;
//
//     case 'bulletList':
//       return `<ul>${renderContent(node.content)}</ul>`;
//
//     case 'orderedList':
//       return `<ol>${renderContent(node.content)}</ol>`;
//
//     case 'listItem':
//       return `<li>${renderContent(node.content)}</li>`;
//
//     case 'blockquote':
//       return `<blockquote>${renderContent(node.content)}</blockquote>`;
//
//     case 'codeBlock':
//       const language = node.attrs?.language || '';
//       return `<pre><code class="language-${language}">${renderContent(node.content)}</code></pre>`;
//
//     case 'image':
//       const src = node.attrs?.src || '';
//       const alt = node.attrs?.alt || '';
//       const title = node.attrs?.title || '';
//       return `<img src="${src}" alt="${alt}" title="${title}" />`;
//
//     case 'hardBreak':
//       return '<br>';
//
//     case 'horizontalRule':
//       return '<hr>';
//
//     case 'table':
//       return `<table>${renderContent(node.content)}</table>`;
//
//     case 'tableRow':
//       return `<tr>${renderContent(node.content)}</tr>`;
//
//     case 'tableHeader':
//       return `<th>${renderContent(node.content)}</th>`;
//
//     case 'tableCell':
//       return `<td>${renderContent(node.content)}</td>`;
//
//     case 'text':
//       let text = node.text || '';
//
//       // Apply marks (formatting)
//       if (node.marks) {
//         for (const mark of node.marks) {
//           switch (mark.type) {
//             case 'bold':
//               text = `<strong>${text}</strong>`;
//               break;
//             case 'italic':
//               text = `<em>${text}</em>`;
//               break;
//             case 'code':
//               text = `<code>${text}</code>`;
//               break;
//             case 'strike':
//               text = `<s>${text}</s>`;
//               break;
//             case 'link':
//               const href = mark.attrs?.href || '#';
//               const target = mark.attrs?.target || '';
//               text = `<a href="${href}" ${target ? `target="${target}"` : ''}>${text}</a>`;
//               break;
//           }
//         }
//       }
//
//       return text;
//
//     default:
//       // For unknown node types, try to render content if it exists
//       if (node.content) {
//         return renderContent(node.content);
//       }
//       return '';
//   }
// }
//
// function renderContent(content: any[]): string {
//   if (!Array.isArray(content)) return '';
//   return content.map((node) => renderNode(node)).join('');
// }
</script>
