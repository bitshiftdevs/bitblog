<script setup lang="ts">
// Meta tags
useSeoMeta({
  title: 'Home',
  ogTitle: 'Home',
  description: 'Welcome to our blog platform where great stories are shared',
  ogDescription: 'Welcome to our blog platform where great stories are shared',
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image',
});

// Stores
const auth = useAuth();

// Fetch featured posts
const { data: featuredPostsData, pending } = await useFetch('/api/posts', {
  query: {
    status: 'PUBLISHED',
    limit: 6,
    sortBy: 'viewCount',
    sortOrder: 'desc',
  },
});

const featuredPosts = computed(() => featuredPostsData.value?.data?.items || []);

// Fetch popular categories
const { data: categoriesData, pending: categoriesLoading } = await useFetch('/api/categories', {
  query: {
    limit: 8,
    sortBy: 'posts',
    sortOrder: 'desc',
  },
});

const categories = computed(() => categoriesData.value?.data?.items || []);

// Fetch active authors
const { data: authorsData, pending: authorsLoading } = await useFetch('/api/authors', {
  query: {
    limit: 8,
    sortBy: 'posts',
    sortOrder: 'desc',
  },
});

const authors = computed(() => authorsData.value?.data?.items || []);
</script>
<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section
      class="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 py-20"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1
            class="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Welcome to
            <span class="text-primary dark:text-primary">BitBlog</span>
          </h1>

          <p
            class="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            Discover amazing stories, insights, and knowledge from our community
            of writers.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <UButton
              to="/posts"
              size="lg"
              icon="i-lucide-book-open"
              class="justify-center"
            >
              Explore Posts
            </UButton>

            <UButton
              v-if="!auth.user"
              to="/auth/login"
              variant="outline"
              size="lg"
              icon="i-lucide-user-plus"
              class="justify-center"
            >
              Join Community
            </UButton>
          </div>
        </div>
      </div>
    </section>

    <LogoSeparator />
    <!-- Featured Posts -->
    <section class="py-16 bg-white dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Posts
          </h2>
          <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover our most popular and engaging content
          </p>
        </div>

        <div
          v-if="pending"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <PostCardSkeleton v-for="i in 6" :key="i" />
        </div>

        <div
          v-else-if="featuredPosts?.length"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <PostCard
            v-for="post in featuredPosts"
            :key="post.id"
            :post="post"
            :show-excerpt="true"
          />
        </div>

        <div v-else class="text-center py-12">
          <UIcon
            name="i-lucide-file-text"
            class="h-12 w-12 text-gray-400 mx-auto mb-4"
          />
          <p class="text-gray-500 dark:text-gray-400">
            No featured posts available
          </p>
        </div>

        <div class="text-center mt-12">
          <UButton to="/posts" variant="outline" size="lg">
            View All Posts
            <UIcon name="i-lucide-arrow-right" class="ml-2 h-4 w-4" />
          </UButton>
        </div>
      </div>
    </section>

    <LogoSeparator />
    <!-- Categories Section -->
    <section class="py-16 bg-gray-50 dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Explore Categories
          </h2>
          <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find content that interests you most
          </p>
        </div>

        <div
          v-if="categoriesLoading"
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <div v-for="i in 8" :key="i" class="animate-pulse">
            <div class="bg-white dark:bg-gray-700 rounded-lg p-6 h-32"></div>
          </div>
        </div>

        <div
          v-else-if="categories?.length"
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <CategoryCard
            v-for="category in categories"
            :key="category.id"
            :category="category"
          />
        </div>

        <div class="text-center mt-8">
          <UButton to="/categories" variant="ghost">
            View All Categories
          </UButton>
        </div>
      </div>
    </section>

    <LogoSeparator />
    <!-- Newsletter Signup -->
    <section class="py-16 bg-seconday-600 dark:bg-sky-900">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold text-white mb-4">Stay Updated</h2>
        <p class="text-primary-100 mb-8 text-lg">
          Get the latest posts and updates delivered straight to your inbox
        </p>

        <NewsletterSignup />
      </div>
    </section>

    <LogoSeparator />
    <!-- Recent Authors -->
    <section class="py-16 bg-white dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Meet Our Authors
          </h2>
          <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Talented writers sharing their knowledge and experiences
          </p>
        </div>

        <div
          v-if="authorsLoading"
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
        >
          <div v-for="i in 8" :key="i" class="animate-pulse text-center">
            <div
              class="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"
            ></div>
            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div
              class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mx-auto"
            ></div>
          </div>
        </div>

        <div
          v-else-if="authors?.length"
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
        >
          <AuthorCard
            v-for="author in authors.slice(0, 8)"
            :key="author.id"
            :author="author"
          />
        </div>

        <div class="text-center mt-12">
          <UButton to="/authors" variant="outline"> View All Authors </UButton>
        </div>
      </div>
    </section>
  </div>
</template>
