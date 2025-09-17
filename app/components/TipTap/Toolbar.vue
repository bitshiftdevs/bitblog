<!-- <script lang="ts"> -->
<!-- 	import type { Editor } from '@tiptap/core'; -->
<!-- 	import type { Level } from '@tiptap/extension-heading'; -->
<!-- 	import { BubbleMenu } from 'svelte-tiptap'; -->
<!---->
<!-- 	let { editor }: { editor: Editor } = $props(); -->
<!---->
<!-- 	// Toolbar actions -->
<!-- 	function toggleBold() { -->
<!-- 		editor.chain().focus().toggleBold().run(); -->
<!-- 	} -->
<!---->
<!-- 	function toggleItalic() { -->
<!-- 		editor.chain().focus().toggleItalic().run(); -->
<!-- 	} -->
<!---->
<!-- 	function toggleUnderline() { -->
<!-- 		editor.chain().focus().toggleMark('underline').run(); -->
<!-- 	} -->
<!---->
<!-- 	function toggleHeading(level: Level) { -->
<!-- 		editor.chain().focus().toggleHeading({ level }).run(); -->
<!-- 	} -->
<!---->
<!-- 	function toggleBulletList() { -->
<!-- 		editor.chain().focus().toggleBulletList().run(); -->
<!-- 	} -->
<!---->
<!-- 	function toggleOrderedList() { -->
<!-- 		editor.chain().focus().toggleOrderedList().run(); -->
<!-- 	} -->
<!---->
<!-- 	function setTextAlign(align: 'left' | 'right' | 'justify' | 'center') { -->
<!-- 		editor.chain().focus().setTextAlign(align).run(); -->
<!-- 	} -->
<!-- </script> -->
<!---->
<!-- <BubbleMenu {editor}> -->
<!-- 	<div class="bg-base-200 p-2 rounded-t-lg flex flex-wrap gap-2"> -->
<!-- 		<div class="btn-group"> -->
<!-- 			<button -->
<!-- 				aria-label="bold" -->
<!-- 				class="btn btn-sm" -->
<!-- 				onclick={toggleBold} -->
<!-- 				class:btn-primary={editor?.isActive('bold')} -->
<!-- 				title="Bold" -->
<!-- 			> -->
<!-- 				<svg -->
<!-- 					xmlns="http://www.w3.org/2000/svg" -->
<!-- 					width="16" -->
<!-- 					height="16" -->
<!-- 					viewBox="0 0 24 24" -->
<!-- 					fill="none" -->
<!-- 					stroke="currentColor" -->
<!-- 					stroke-width="2" -->
<!-- 					stroke-linecap="round" -->
<!-- 					stroke-linejoin="round" -->
<!-- 					><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path -->
<!-- 						d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" -->
<!-- 					></path></svg -->
<!-- 				> -->
<!-- 			</button> -->
<!-- 			<button -->
<!-- 				aria-label="bold" -->
<!-- 				class="btn btn-sm" -->
<!-- 				onclick={toggleItalic} -->
<!-- 				class:btn-primary={editor?.isActive('italic')} -->
<!-- 				title="Italic" -->
<!-- 			> -->
<!-- 				<svg -->
<!-- 					xmlns="http://www.w3.org/2000/svg" -->
<!-- 					width="16" -->
<!-- 					height="16" -->
<!-- 					viewBox="0 0 24 24" -->
<!-- 					fill="none" -->
<!-- 					stroke="currentColor" -->
<!-- 					stroke-width="2" -->
<!-- 					stroke-linecap="round" -->
<!-- 					stroke-linejoin="round" -->
<!-- 					><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20" -->
<!-- 					></line><line x1="15" y1="4" x2="9" y2="20"></line></svg -->
<!-- 				> -->
<!-- 			</button> -->
<!-- 			<button -->
<!-- 				aria-label="bold" -->
<!-- 				class="btn btn-sm" -->
<!-- 				onclick={toggleUnderline} -->
<!-- 				class:btn-primary={editor?.isActive('underline')} -->
<!-- 				title="Underline" -->
<!-- 			> -->
<!-- 				<svg -->
<!-- 					xmlns="http://www.w3.org/2000/svg" -->
<!-- 					width="16" -->
<!-- 					height="16" -->
<!-- 					viewBox="0 0 24 24" -->
<!-- 					fill="none" -->
<!-- 					stroke="currentColor" -->
<!-- 					stroke-width="2" -->
<!-- 					stroke-linecap="round" -->
<!-- 					stroke-linejoin="round" -->
<!-- 					><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path><line -->
<!-- 						x1="4" -->
<!-- 						y1="21" -->
<!-- 						x2="20" -->
<!-- 						y2="21" -->
<!-- 					></line></svg -->
<!-- 				> -->
<!-- 			</button> -->
<!-- 		</div> -->
<!---->
<!-- 		<div class="btn-group"> -->
<!-- 			<button -->
<!-- 				class="btn btn-sm" -->
<!-- 				onclick={() => toggleHeading(1)} -->
<!-- 				class:btn-primary={editor?.isActive('heading', { level: 1 })} -->
<!-- 				title="Heading 1" -->
<!-- 			> -->
<!-- 				H1 -->
<!-- 			</button> -->
<!-- 			<button -->
<!-- 				class="btn btn-sm" -->
<!-- 				onclick={() => toggleHeading(2)} -->
<!-- 				class:btn-primary={editor?.isActive('heading', { level: 2 })} -->
<!-- 				title="Heading 2" -->
<!-- 			> -->
<!-- 				H2 -->
<!-- 			</button> -->
<!-- 			<button -->
<!-- 				class="btn btn-sm" -->
<!-- 				onclick={() => toggleHeading(3)} -->
<!-- 				class:btn-primary={editor?.isActive('heading', { level: 3 })} -->
<!-- 				title="Heading 3" -->
<!-- 			> -->
<!-- 				H3 -->
<!-- 			</button> -->
<!-- 		</div> -->
<!---->
<!-- 		<div class="btn-group"> -->
<!-- 			<button -->
<!-- 				aria-label="bold" -->
<!-- 				class="btn btn-sm" -->
<!-- 				onclick={toggleBulletList} -->
<!-- 				class:btn-primary={editor?.isActive('bulletList')} -->
<!-- 				title="Bullet List" -->
<!-- 			> -->
<!-- 				<svg -->
<!-- 					xmlns="http://www.w3.org/2000/svg" -->
<!-- 					width="16" -->
<!-- 					height="16" -->
<!-- 					viewBox="0 0 24 24" -->
<!-- 					fill="none" -->
<!-- 					stroke="currentColor" -->
<!-- 					stroke-width="2" -->
<!-- 					stroke-linecap="round" -->
<!-- 					stroke-linejoin="round" -->
<!-- 					><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12" -->
<!-- 					></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6" -->
<!-- 					></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line -->
<!-- 						x1="3" -->
<!-- 						y1="18" -->
<!-- 						x2="3.01" -->
<!-- 						y2="18" -->
<!-- 					></line></svg -->
<!-- 				> -->
<!-- 			</button> -->
<!-- 			<button -->
<!-- 				aria-label="bold" -->
<!-- 				class="btn btn-sm" -->
<!-- 				onclick={toggleOrderedList} -->
<!-- 				class:btn-primary={editor?.isActive('orderedList')} -->
<!-- 				title="Ordered List" -->
<!-- 			> -->
<!-- 				<svg -->
<!-- 					xmlns="http://www.w3.org/2000/svg" -->
<!-- 					width="16" -->
<!-- 					height="16" -->
<!-- 					viewBox="0 0 24 24" -->
<!-- 					fill="none" -->
<!-- 					stroke="currentColor" -->
<!-- 					stroke-width="2" -->
<!-- 					stroke-linecap="round" -->
<!-- 					stroke-linejoin="round" -->
<!-- 					><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12" -->
<!-- 					></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path -->
<!-- 						d="M4 10h2" -->
<!-- 					></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg -->
<!-- 				> -->
<!-- 			</button> -->
<!-- 		</div> -->
<!---->
<!-- 		<div class="btn-group"> -->
<!-- 			<button -->
<!-- 				aria-label="bold" -->
<!-- 				class="btn btn-sm" -->
<!-- 				onclick={() => setTextAlign('left')} -->
<!-- 				class:btn-primary={editor?.isActive({ textAlign: 'left' })} -->
<!-- 				title="Align Left" -->
<!-- 			> -->
<!-- 				<svg -->
<!-- 					xmlns="http://www.w3.org/2000/svg" -->
<!-- 					width="16" -->
<!-- 					height="16" -->
<!-- 					viewBox="0 0 24 24" -->
<!-- 					fill="none" -->
<!-- 					stroke="currentColor" -->
<!-- 					stroke-width="2" -->
<!-- 					stroke-linecap="round" -->
<!-- 					stroke-linejoin="round" -->
<!-- 					><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6" -->
<!-- 					></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18" -->
<!-- 					></line></svg -->
<!-- 				> -->
<!-- 			</button> -->
<!-- 			<button -->
<!-- 				aria-label="bold" -->
<!-- 				class="btn btn-sm" -->
<!-- 				onclick={() => setTextAlign('center')} -->
<!-- 				class:btn-primary={editor?.isActive({ textAlign: 'center' })} -->
<!-- 				title="Align Center" -->
<!-- 			> -->
<!-- 				<svg -->
<!-- 					xmlns="http://www.w3.org/2000/svg" -->
<!-- 					width="16" -->
<!-- 					height="16" -->
<!-- 					viewBox="0 0 24 24" -->
<!-- 					fill="none" -->
<!-- 					stroke="currentColor" -->
<!-- 					stroke-width="2" -->
<!-- 					stroke-linecap="round" -->
<!-- 					stroke-linejoin="round" -->
<!-- 					><line x1="18" y1="10" x2="6" y2="10"></line><line x1="21" y1="6" x2="3" y2="6" -->
<!-- 					></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="18" y1="18" x2="6" y2="18" -->
<!-- 					></line></svg -->
<!-- 				> -->
<!-- 			</button> -->
<!-- 			<button -->
<!-- 				aria-label="bold" -->
<!-- 				class="btn btn-sm" -->
<!-- 				onclick={() => setTextAlign('right')} -->
<!-- 				class:btn-primary={editor?.isActive({ textAlign: 'right' })} -->
<!-- 				title="Align Right" -->
<!-- 			> -->
<!-- 				<svg -->
<!-- 					xmlns="http://www.w3.org/2000/svg" -->
<!-- 					width="16" -->
<!-- 					height="16" -->
<!-- 					viewBox="0 0 24 24" -->
<!-- 					fill="none" -->
<!-- 					stroke="currentColor" -->
<!-- 					stroke-width="2" -->
<!-- 					stroke-linecap="round" -->
<!-- 					stroke-linejoin="round" -->
<!-- 					><line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="6" x2="3" y2="6" -->
<!-- 					></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18" -->
<!-- 					></line></svg -->
<!-- 				> -->
<!-- 			</button> -->
<!-- 		</div> -->
<!-- 	</div> -->
<!-- </BubbleMenu> -->
