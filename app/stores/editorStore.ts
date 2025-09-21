import { defineStore } from 'pinia';
import type {
  EditorView,
  EditorState,
  PostResponse,
  PostStatus,
} from '~~/shared/types';
import { Modal } from '~~/shared/types';

export const useEditorStore = defineStore('editor', {
  state: (): EditorState => {
    const auth = useAuthStore();
    return {
      title: '',
      id: '',
      authorId: auth.user?.id,
      author: auth.user ?? undefined,
      content: '',
      contentText: '',
      wordCount: 0,
      excerpt: '',
      visibility: 'PUBLIC',
      slug: '',
      coAuthors: [],
      featuredImage: '',
      categories: [],
      tags: [],
      status: 'DRAFT',
      publishedAt: new Date(),
      lastSaved: null,
      viewCount: 0,
      commentCount: 0,
      isDirty: false,
      history: [],
      linkUrl: '',
      linkText: '',
      view: 'editor',
      showImageModal: false,
      showLinkModal: false,
      showYoutubeModal: false,
      isFeatured: false,
    };
  },
  getters: {
    getStatus: (state) => {
      return state.status;
    },
    getWordCount: (state) => {
      if (!state.content) return 0;
      // Remove HTML tags and count words
      const text = state.content.replace(/<\/?[^>]+(>|$)/g, ' ');
      return text.split(/\s+/).filter((word: string) => word.length > 0).length;
    },
    readingTime: (state) => {
      // Average reading speed: 200 words per minute
      const minutes = Math.ceil(state.wordCount / 200);
      return minutes;
    },
    getSlug: (state) => {
      return state.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    },
    getPost: (state) => {
      // FIX: return proper post
      return {
        title: state.title,
        excerpt: state.excerpt,
        content: state.content,
        categories: state.categories,
        author: state.author,
        tags: state.tags,
        slug: state.slug,
        publishedAt: state.publishedAt,
        featuredImage: state.featuredImage,
        readTime: Math.ceil(state.wordCount / 200),
        updatedAt: new Date(),
        status: state.status,
        authorId: 'authj',
        commentCount: state.commentCount,
      } as unknown as PostResponse;
    },
  },
  actions: {
    setView(view: EditorView) {
      this.view = view;
    },
    setTitle() {
      // this.title = title
      this.isDirty = true;
      this.slug = this.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    },

    setContent(content: JSON, text: string) {
      this.content = content;
      this.contentText = text;
      this.isDirty = true;
    },
    setFeaturedImage(url: string) {
      this.featuredImage = url;
      this.isDirty = true;
    },
    setStatus(status: PostStatus) {
      this.status = status;
      this.isDirty = true;
    },
    setPublishDate(date: Date) {
      this.publishedAt = date;
      this.isDirty = true;
    },
    async saveContent(status: PostStatus, authorId?: string) {
      // Create a snapshot for history
      if (this.content) {
        this.history.push({
          content: this.content,
          timestamp: new Date().toISOString(),
        });

        // Keep only the last 10 versions
        if (this.history.length > 10) {
          this.history.shift();
        }
      }

      this.lastSaved = new Date().toISOString();
      this.isDirty = false;

      try {
        let msg = 'saved to local storage';
        if (authorId) {
          // msg = await savePostOrUpdate({
          //   ...this.getPost,
          //   status: status,
          //   authorId: authorId,
          // });
        }

        return {
          success: true,
          msg,
          timestamp: this.lastSaved,
        };
      } catch (e: any) {
        return {
          success: false,
          msg: e.message,
          timestamp: this.lastSaved,
        };
      }
    },
    async loadPost(slug: string) {
      // const edit = (await getPostBySlug(slug))!;
      let edit: any;
      this.slug = edit.slug;
      this.title = edit.title;
      this.content = edit.content;
      this.publishedAt = edit.publishedAt;
      this.commentCount = edit.commentCount;
      this.status = edit.status;
      this.excerpt = edit.excerpt;
      this.tags = edit.tags || [];
      this.categories = edit.categories;
      this.featuredImage = edit.featuredImage;
    },
    restoreVersion(index: number) {
      if (index >= 0 && index < this.history.length) {
        // this.content = this.history[index].content;
        return true;
      }
      return false;
    },
    openModal(modal: Modal) {
      switch (modal) {
        case Modal.link:
          this.showLinkModal = true;
          break;
        case Modal.image:
          this.showImageModal = true;
          break;
        case Modal.imageFeatured:
          this.showImageModal = true;
          this.isFeatured = true;
          break;
        case Modal.youtube:
          this.showYoutubeModal = true;
          break;
      }
    },
    resetModal() {
      this.showYoutubeModal = false;
      this.showLinkModal = false;
      this.showImageModal = false;
      this.linkUrl = '';
      this.linkText = '';
      this.isFeatured = false;
    },
    resetEditor() {
      this.title = '';
      this.content = '';
      this.excerpt = '';
      this.slug = '';
      this.featuredImage = '';
      this.categories = [];
      this.tags = [];
      this.status = 'DRAFT';
      this.publishedAt = new Date();
      this.lastSaved = null;
      this.history = [];
      this.isDirty = false;
      this.resetModal();
    },
  },
});
