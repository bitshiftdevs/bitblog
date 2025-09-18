// import { PluginKey, Plugin } from '@tiptap/pm/state';
// import { mergeAttributes, Node } from '@tiptap/core';
// import { NodeSelection } from 'prosemirror-state';
//
// const ResizableImage = Node.create({
// 	name: 'resizableImage',
// 	group: 'block',
// 	draggable: true,
// 	atom: true,
// 	inline: false,
//
// 	addAttributes() {
// 		return {
// 			src: {
// 				default: null
// 			},
// 			alt: {
// 				default: null
// 			},
// 			title: {
// 				default: null
// 			},
// 			width: {
// 				default: '100%'
// 			},
// 			height: {
// 				default: 'auto'
// 			}
// 		};
// 	},
// 	parseHTML() {
// 		return [
// 			{
// 				tag: 'img[src]',
// 				getAttrs: (dom) => ({
// 					src: dom.getAttribute('src'),
// 					alt: dom.getAttribute('alt'),
// 					title: dom.getAttribute('title'),
// 					width: dom.getAttribute('width'),
// 					height: dom.getAttribute('height')
// 				})
// 			}
// 		];
// 	},
//
// 	renderHTML({ HTMLAttributes }) {
// 		return ['img', mergeAttributes(HTMLAttributes, { draggable: true })];
// 	},
//
// 	addCommands() {
// 		return {
// 			setImage:
// 				(options) =>
// 				({ commands }) => {
// 					return commands.insertContent({
// 						type: this.name,
// 						attrs: options
// 					});
// 				}
// 		};
// 	},
//
// 	addProseMirrorPlugins() {
// 		const key = new PluginKey('resizableImage');
//
// 		return [
// 			new Plugin({
// 				key,
// 				props: {
// 					handleDOMEvents: {
// 						mousedown(view, event) {
// 							const target = event.target;
//
// 							if (target instanceof HTMLImageElement && event.target.closest('.ProseMirror')) {
// 								const pos = view.posAtDOM(target, 0);
// 								const node = view.state.doc.nodeAt(pos);
//
// 								if (node) {
// 									const tr = view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos));
// 									view.dispatch(tr);
// 									return true;
// 								}
// 							}
//
// 							return false;
// 						}
// 					},
//
// 					// Add a decoration to show resize handles
// 					decorations(state) {
// 						const { selection } = state;
//
// 						if (
// 							selection instanceof NodeSelection &&
// 							selection.node.type.name === 'resizableImage'
// 						) {
// 							return;
// 						}
//
// 						return null;
// 					}
// 				}
// 			})
// 		];
// 	}
// });
//
// // Create a function to initialize the resizing functionality
// function setupImageResizing(editor) {
// 	// Function to handle image resizing
// 	const handleImageResize = (img) => {
// 		// Create resize handles
// 		const resizer = document.createElement('div');
// 		resizer.className = 'image-resizer';
//
// 		// Create the corner handle
// 		const cornerHandle = document.createElement('div');
// 		cornerHandle.className = 'resize-handle corner-handle';
// 		resizer.appendChild(cornerHandle);
//
// 		// Add resizer to the image
// 		img.parentNode.appendChild(resizer);
//
// 		// Position the resizer over the image
// 		const updateResizerPosition = () => {
// 			const rect = img.getBoundingClientRect();
// 			resizer.style.position = 'absolute';
// 			resizer.style.top = `${img.offsetTop}px`;
// 			resizer.style.left = `${img.offsetLeft}px`;
// 			resizer.style.width = `${img.offsetWidth}px`;
// 			resizer.style.height = `${img.offsetHeight}px`;
// 			resizer.style.pointerEvents = 'none';
// 			cornerHandle.style.pointerEvents = 'all';
// 		};
//
// 		updateResizerPosition();
//
// 		// Variables to store resize state
// 		let startX, startY, startWidth, startHeight;
//
// 		// Helper function to handle mouse move during resize
// 		const onMouseMove = (e) => {
// 			const dx = e.clientX - startX;
// 			const dy = e.clientY - startY;
//
// 			// Maintain aspect ratio by default
// 			const ratio = startWidth / startHeight;
// 			const newWidth = startWidth + dx;
// 			const newHeight = startHeight + dx / ratio;
//
// 			// Update image size
// 			img.style.width = `${newWidth}px`;
// 			img.style.height = `${newHeight}px`;
//
// 			// Update image attributes for persistence
// 			img.setAttribute('width', `${newWidth}px`);
// 			img.setAttribute('height', `${newHeight}px`);
//
// 			// Update resizer position
// 			updateResizerPosition();
// 		};
//
// 		// Function to handle mouse up - removes event listeners
// 		const onMouseUp = () => {
// 			document.removeEventListener('mousemove', onMouseMove);
// 			document.removeEventListener('mouseup', onMouseUp);
//
// 			// Store the dimensions in the node's attributes
// 			const { state, view } = editor;
// 			const { tr } = state;
//
// 			try {
// 				editor.view.state.doc.descendants((node, pos) => {
// 					if (node.type.name === 'resizableImage' && node.attrs.src === img.getAttribute('src')) {
// 						tr.setNodeMarkup(pos, undefined, {
// 							...node.attrs,
// 							width: img.style.width,
// 							height: img.style.height
// 						});
// 						view.dispatch(tr);
// 						return false;
// 					}
// 				});
// 			} catch (error) {
// 				console.error('Error updating image dimensions:', error);
// 			}
// 		};
//
// 		// Event handler for starting resize on corner handle
// 		cornerHandle.addEventListener('mousedown', (e) => {
// 			e.preventDefault();
// 			e.stopPropagation();
//
// 			startX = e.clientX;
// 			startY = e.clientY;
// 			startWidth = img.offsetWidth;
// 			startHeight = img.offsetHeight;
//
// 			document.addEventListener('mousemove', onMouseMove);
// 			document.addEventListener('mouseup', onMouseUp);
// 		});
//
// 		// Return a cleanup function
// 		return () => {
// 			if (resizer.parentNode) {
// 				resizer.parentNode.removeChild(resizer);
// 			}
// 		};
// 	};
//
// 	// Setup a mutation observer to watch for image insertions
// 	const observer = new MutationObserver((mutations) => {
// 		mutations.forEach((mutation) => {
// 			if (mutation.type === 'childList') {
// 				mutation.addedNodes.forEach((node) => {
// 					if (node.nodeName === 'IMG' && !node.hasAttribute('data-resizable')) {
// 						node.setAttribute('data-resizable', 'true');
// 						handleImageResize(node);
// 					} else if (node.nodeType === Node.ELEMENT_NODE) {
// 						node.querySelectorAll('img:not([data-resizable])').forEach((img) => {
// 							img.setAttribute('data-resizable', 'true');
// 							handleImageResize(img);
// 						});
// 					}
// 				});
// 			}
// 		});
// 	});
//
// 	// Start observing the editor content
// 	if (editor.view && editor.view.dom) {
// 		observer.observe(editor.view.dom, {
// 			childList: true,
// 			subtree: true
// 		});
// 	}
//
// 	// Return a cleanup function
// 	return () => {
// 		observer.disconnect();
// 	};
// }
//
// export { ResizableImage, setupImageResizing };
