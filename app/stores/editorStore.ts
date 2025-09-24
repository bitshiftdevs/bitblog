import { defineStore } from 'pinia';
import type { EditorView, EditorState, PostResponse, PostStatus, Post } from '~~/shared/types';
import { Modal } from '~~/shared/types';

export const useEditorStore = defineStore('editor', {
  state: (): EditorState => {
    const auth = useAuth();
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
      publishedAt: new Date().toISOString(),
      lastSaved: null,
      viewCount: 10,
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
      return {
        id: state.id,
        title: state.title,
        excerpt: state.excerpt,
        content: state.content,
        categories: state.categories,
        author: state.author,
        tags: state.tags,
        slug: state.slug,
        publishedAt: state.publishedAt,
        featuredImage: state.featuredImage,
        readingTime: Math.ceil(state.wordCount / 200),
        updatedAt: new Date().toISOString(),
        status: state.status,
        visibility: state.visibility,
        authorId: state.authorId,
        coAuthors: state.coAuthors,
        viewCount: state.viewCount,
        createdAt: new Date().toISOString(),
        relatedPosts: []
      } as PostResponse;
    },
  },
  actions: {
    setView(view: EditorView) {
      this.view = view;
    },
    setTitle(title: string) {
      this.title = title;
      this.isDirty = true;
      this.slug = this.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    },

    setContent(content: any, text: string) {
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
    async saveContent(status: PostStatus) {
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

      try {
        const postData = {
          title: this.title,
          slug: this.getSlug,
          excerpt: this.excerpt,
          content: this.content,
          status: status,
          visibility: this.visibility,
          featuredImage: this.featuredImage || undefined,
          seoTitle: undefined,
          seoDescription: undefined,
          seoKeywords: undefined,
          coAuthorIds: this.coAuthors.map(author => author.id).filter(id => id),
          // Use existing IDs for existing tags/categories, names for new ones
          tagIds: this.tags.filter(tag => tag.id && !tag.id.includes('-')).map(tag => tag.id),
          categoryIds: this.categories.filter(cat => cat.id && !cat.id.includes('-')).map(cat => cat.id),
          // Send new tag/category names to be created
          newTagNames: this.tags.filter(tag => !tag.id || tag.id.includes('-')).map(tag => tag.name),
          newCategoryNames: this.categories.filter(cat => !cat.id || cat.id.includes('-')).map(cat => cat.name),
          scheduledAt: status === 'SCHEDULED' ? this.publishedAt : undefined
        };

        let response;
        let msg = '';

        if (this.id) {
          // Update existing post
          response = await $fetch(`/api/posts/${this.id}`, {
            method: 'PUT',
            body: postData
          });
          msg = `Post updated as ${status.toLowerCase()}`;
        } else {
          // Create new post
          response = await $fetch('/api/posts', {
            method: 'POST',
            body: postData
          });
          msg = `Post created as ${status.toLowerCase()}`;

          // Update store with new post ID and data
          if (response.success && response.data) {
            this.id = response.data.id;
            this.slug = response.data.slug;
          }
        }

        this.lastSaved = new Date().toISOString();
        this.isDirty = false;

        return {
          success: true,
          msg,
          timestamp: this.lastSaved,
          data: response.data
        };
      } catch (e: any) {
        console.error('Save error:', e);
        this.isDirty = true; // Reset dirty state on error

        return {
          success: false,
          msg: e.data?.message || e.message || 'Failed to save post',
          timestamp: new Date().toISOString(),
        };
      }
    },
    async loadPost(post: Post) {
      this.slug = post.slug;
      this.title = post.title;
      this.content = post.content;
      this.publishedAt = post.publishedAt;
      this.status = post.status;
      this.excerpt = post.excerpt;
      this.tags = post.tags || [];
      this.categories = post.categories;
      this.featuredImage = post.featuredImage;
      this.author = post.author;
      this.authorId = post.authorId;
      this.coAuthors = post.coAuthors;
      this.visibility = post.visibility;
      this.status = post.status;
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
      this.publishedAt = new Date().toISOString();
      this.lastSaved = null;
      this.history = [];
      this.isDirty = false;
      this.resetModal();
    },
  },
});
