<!-- apps/web/pages/admin/posts/new.vue -->
<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
          Create New Post
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Write and publish a new blog post
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <UButton variant="outline" @click="saveDraft" :loading="isSaving">
          Save Draft
        </UButton>
        <UButton @click="publishPost" :loading="isPublishing">
          Publish
        </UButton>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-3 space-y-6">
        <!-- Title -->
        <UCard>
          <UFormField label="Title" required>
            <UInput
              v-model="form.title"
              placeholder="Enter post title..."
              size="lg"
              :disabled="isSaving || isPublishing"
            />
          </UFormField>
        </UCard>

        <!-- Slug -->
        <UCard>
          <UFormField label="URL Slug">
            <UInput
              v-model="form.slug"
              placeholder="post-url-slug"
              :disabled="isSaving || isPublishing"
            />
            <template #hint>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                Preview: /posts/{{ form.slug || "post-url-slug" }}
              </span>
            </template>
          </UFormField>
        </UCard>

        <!-- Excerpt -->
        <UCard>
          <UFormField label="Excerpt">
            <UTextarea
              v-model="form.excerpt"
              placeholder="Brief description of your post..."
              :rows="3"
              :disabled="isSaving || isPublishing"
            />
          </UFormField>
        </UCard>

        <!-- Content Editor -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-medium">Content</h3>
          </template>

          <!-- Simple textarea for now - replace with TipTap editor -->
          <UTextarea
            v-model="form.content"
            placeholder="Write your post content here..."
            :rows="20"
            :disabled="isSaving || isPublishing"
          />

          <template #footer>
            <div
              class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400"
            >
              <span>{{ wordCount }} words</span>
              <span>{{ readingTime }} min read</span>
            </div>
          </template>
        </UCard>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Post Settings -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-medium">Post Settings</h3>
          </template>

          <div class="space-y-4">
            <!-- Status -->
            <UFormField label="Status">
              <USelectMenu
                v-model="form.status"
                :options="statusOptions"
                :disabled="isSaving || isPublishing"
              />
            </UFormField>

            <!-- Visibility -->
            <UFormField label="Visibility">
              <USelectMenu
                v-model="form.visibility"
                :options="visibilityOptions"
                :disabled="isSaving || isPublishing"
              />
            </UFormField>

            <!-- Publish Date -->
            <UFormField v-if="form.status === 'SCHEDULED'" label="Publish Date">
              <UInput
                v-model="form.scheduledAt"
                type="datetime-local"
                :disabled="isSaving || isPublishing"
              />
            </UFormField>
          </div>
        </UCard>

        <!-- Featured Image -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-medium">Featured Image</h3>
          </template>

          <div class="space-y-4">
            <div v-if="form.featuredImage" class="relative">
              <img
                :src="form.featuredImage"
                alt="Featured image"
                class="w-full h-32 object-cover rounded-lg"
              />
              <UButton
                variant="solid"
                color="red"
                size="xs"
                icon="i-heroicons-x-mark"
                class="absolute top-2 right-2"
                @click="form.featuredImage = ''"
              />
            </div>

            <UButton
              variant="outline"
              icon="i-heroicons-photo"
              block
              @click="selectFeaturedImage"
              :disabled="isSaving || isPublishing"
            >
              {{ form.featuredImage ? "Change Image" : "Select Image" }}
            </UButton>
          </div>
        </UCard>

        <!-- Categories -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-medium">Categories</h3>
          </template>

          <div class="space-y-2">
            <UCheckbox
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :model-value="form.categoryIds.includes(category.id)"
              @update:model-value="toggleCategory(category.id, $event)"
              :disabled="isSaving || isPublishing"
            />
          </div>
        </UCard>

        <!-- Tags -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-medium">Tags</h3>
          </template>

          <div class="space-y-4">
            <UInput
              v-model="newTag"
              placeholder="Add a tag..."
              @keyup.enter="addTag"
              :disabled="isSaving || isPublishing"
            />

            <div v-if="form.tags.length" class="flex flex-wrap gap-2">
              <UBadge
                v-for="tag in form.tags"
                :key="tag"
                :label="tag"
                variant="soft"
                class="cursor-pointer"
                @click="removeTag(tag)"
              />
            </div>
          </div>
        </UCard>

        <!-- SEO -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-medium">SEO</h3>
          </template>

          <div class="space-y-4">
            <UFormField label="SEO Title">
              <UInput
                v-model="form.seoTitle"
                placeholder="SEO optimized title..."
                :disabled="isSaving || isPublishing"
              />
            </UFormField>

            <UFormField label="Meta Description">
              <UTextarea
                v-model="form.seoDescription"
                placeholder="Meta description for search engines..."
                :rows="3"
                :disabled="isSaving || isPublishing"
              />
            </UFormField>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
});

const router = useRouter();
const toast = useToast();

// Form state
const form = reactive({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  status: 'DRAFT',
  visibility: 'PUBLIC',
  featuredImage: '',
  categoryIds: [] as string[],
  tags: [] as string[],
  seoTitle: '',
  seoDescription: '',
  scheduledAt: '',
});

const newTag = ref('');
const isSaving = ref(false);
const isPublishing = ref(false);

// Options
const statusOptions = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'Archived', value: 'ARCHIVED' },
];

const visibilityOptions = [
  { label: 'Public', value: 'PUBLIC' },
  { label: 'Private', value: 'PRIVATE' },
  { label: 'Unlisted', value: 'UNLISTED' },
];

// Mock categories - replace with API call
const categories = ref([
  { id: '1', name: 'Technology' },
  { id: '2', name: 'Design' },
  { id: '3', name: 'Development' },
  { id: '4', name: 'Business' },
]);

// Computed properties
const wordCount = computed(() => {
  return form.content.split(/\s+/).filter((word) => word.length > 0).length;
});

const readingTime = computed(() => {
  return Math.ceil(wordCount.value / 200); // Assuming 200 words per minute
});

// Watch title to auto-generate slug
watch(
  () => form.title,
  (newTitle) => {
    if (!form.slug) {
      form.slug = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }
  },
);

// Methods
const toggleCategory = (categoryId: string, checked: boolean) => {
  if (checked) {
    form.categoryIds.push(categoryId);
  } else {
    form.categoryIds = form.categoryIds.filter((id) => id !== categoryId);
  }
};

const addTag = () => {
  const tag = newTag.value.trim();
  if (tag && !form.tags.includes(tag)) {
    form.tags.push(tag);
    newTag.value = '';
  }
};

const removeTag = (tag: string) => {
  form.tags = form.tags.filter((t) => t !== tag);
};

const selectFeaturedImage = () => {
  // TODO: Implement media library modal
  // For now, just set a placeholder
  form.featuredImage = 'https://via.placeholder.com/800x400';
};

const saveDraft = async () => {
  isSaving.value = true;

  try {
    // TODO: Implement save draft API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.add({
      title: 'Draft saved',
      description: 'Your post has been saved as a draft.',
      color: 'green',
    });
  } catch (error) {
    toast.add({
      title: 'Save failed',
      description: 'Failed to save the post. Please try again.',
      color: 'red',
    });
  } finally {
    isSaving.value = false;
  }
};

const publishPost = async () => {
  if (!form.title.trim()) {
    toast.add({
      title: 'Title required',
      description: 'Please enter a title for your post.',
      color: 'red',
    });
    return;
  }

  isPublishing.value = true;

  try {
    // TODO: Implement publish API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.add({
      title: 'Post published!',
      description: 'Your post has been published successfully.',
      color: 'green',
    });

    // Redirect to posts list
    router.push('/admin/posts');
  } catch (error) {
    toast.add({
      title: 'Publish failed',
      description: 'Failed to publish the post. Please try again.',
      color: 'red',
    });
  } finally {
    isPublishing.value = false;
  }
};

// Set breadcrumbs
const setBreadcrumbs = inject('setBreadcrumbs', () => {});
setBreadcrumbs([
  { label: 'Dashboard', to: '/admin' },
  { label: 'Posts', to: '/admin/posts' },
  { label: 'New Post' },
]);
</script>
