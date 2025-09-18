<template>
  <div>
    <Head>
      <title>{{ pageTitle }} - Admin</title>
    </Head>

    <AdminLayout>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">
              {{ pageTitle }}
            </h1>
            <p class="text-gray-600">
              {{
                isNewPost
                  ? "Write and publish your new blog post"
                  : "Edit your existing blog post"
              }}
            </p>
          </div>
          <div class="flex items-center space-x-3">
            <!-- View Published Post (if published) -->
            <NuxtLink
              v-if="editorStore.status === 'published'"
              :to="`/posts/${route.params.slug}`"
              target="_blank"
              class="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                class="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              View Post
            </NuxtLink>

            <!-- Back to Posts -->
            <NuxtLink
              to="/admin/posts"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                class="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Posts
            </NuxtLink>
          </div>
        </div>
      </template>

      <div class="h-full">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="text-center">
            <svg
              class="animate-spin w-8 h-8 text-blue-600 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p class="text-gray-600">{{ loadingMessage }}</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="flex items-center justify-center h-64">
          <div class="text-center">
            <svg
              class="w-12 h-12 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.312 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h3 class="text-lg font-medium text-red-800 mb-2">
              Error Loading Post
            </h3>
            <p class="text-red-600 mb-4">{{ error }}</p>
            <button
              @click="loadPost"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Try Again
            </button>
          </div>
        </div>

        <!-- Editor -->
        <BlogEditor v-else />
      </div>
    </AdminLayout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEditorStore } from '~/stores/editorStore';

// Define the page as requiring authentication
definePageMeta({
  middleware: 'auth',
  layout: false,
});

const route = useRoute();
const router = useRouter();
const editorStore = useEditorStore();

// Component state
const loading = ref(true);
const error = ref('');
const loadingMessage = ref('Loading post...');

// Computed properties
const slug = computed(() => route.params.slug as string);
const isNewPost = computed(() => slug.value === 'new');

const pageTitle = computed(() => {
  if (isNewPost.value) return 'New Post';
  if (editorStore.title) return `Edit: ${editorStore.title}`;
  return 'Edit Post';
});

// Methods
const loadPost = async () => {
  if (isNewPost.value) {
    // Handle new post creation
    loadingMessage.value = 'Setting up new post...';
    try {
      editorStore.createNewPost();
      loading.value = false;
    } catch (err) {
      error.value = 'Failed to initialize new post';
      loading.value = false;
    }
    return;
  }

  // Handle existing post loading
  loadingMessage.value = `Loading post "${slug.value}"...`;
  try {
    await editorStore.loadPost(slug.value);

    // Check if post exists (in a real app, the loadPost would throw an error if not found)
    if (!editorStore.title && !editorStore.content) {
      error.value = `Post "${slug.value}" not found`;
      loading.value = false;
      return;
    }

    loading.value = false;
    error.value = '';
  } catch (err) {
    console.error('Failed to load post:', err);
    error.value = err instanceof Error ? err.message : 'Failed to load post';
    loading.value = false;
  }
};

// Lifecycle
onMounted(async () => {
  // await loadPost();
  // editorStore.enableAutoSave();
});

onBeforeUnmount(() => {
  // editorStore.disableAutoSave();
});

// Route guards
onBeforeRouteUpdate(async (to, from) => {
  // Handle route changes (e.g., switching between posts)
  const newSlug = to.params.slug as string;
  if (newSlug !== slug.value) {
    if (editorStore.isDirty) {
      const answer = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?',
      );
      if (!answer) {
        return false;
      }
    }

    loading.value = true;
    error.value = '';
    await loadPost();
  }
});

onBeforeRouteLeave((to, from, next) => {
  if (editorStore.isDirty) {
    const answer = window.confirm(
      'You have unsaved changes. Are you sure you want to leave?',
    );
    if (answer) {
      next();
    } else {
      next(false);
    }
  } else {
    next();
  }
});

// Watch for successful saves to update the URL if creating a new post
watch(
  () => editorStore.slug,
  (newSlug) => {
    if (isNewPost.value && newSlug && editorStore.status !== 'draft') {
      // Redirect to the edit URL after first save
      router.replace(`/admin/post/${newSlug}`);
    }
  },
);
</script>
