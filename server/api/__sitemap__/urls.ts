import prisma from "~~/server/db";

export default defineEventHandler(async () => {
  // Fetch all published posts
  const posts = await prisma.post.findMany({
    where: { status: "published", visibility: "public" },
    select: { slug: true, updatedAt: true },
  });

  // Fetch all categories
  const categories = await prisma.category.findMany({
    select: { id: true, updatedAt: true },
  });

  // Fetch all tags
  const tags = await prisma.tag.findMany({
    select: { id: true, updatedAt: true },
  });

  // Fetch all active authors with at least one post
  const authors = await prisma.user.findMany({
    where: { isActive: true, authoredPosts: { some: { status: "published" } } },
    select: { id: true, updatedAt: true },
  });

  return [
    ...posts.map((post) => ({
      loc: `/posts/${post.slug}`,
      lastmod: post.updatedAt.toISOString(),
    })),
    ...categories.map((category) => ({
      loc: `/categories/${category.id}`,
      lastmod: category.updatedAt.toISOString(),
    })),
    ...tags.map((tag) => ({
      loc: `/tags/${tag.id}`,
      lastmod: tag.updatedAt.toISOString(),
    })),
    ...authors.map((author) => ({
      loc: `/authors/${author.id}`,
      lastmod: author.updatedAt.toISOString(),
    })),
  ];
});
