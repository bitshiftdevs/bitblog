// apps/api/server/api/rss.xml.get.ts
import { Feed } from "feed";
import prisma from "~~/server/db";

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const siteUrl = config.public.siteUrl || "https://localhost:3000";

    // Get site settings
    const siteSettings = await prisma.siteSettings.findMany();
    const settings = siteSettings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      },
      {} as Record<string, any>,
    );

    const general = settings.general || {};
    const seo = settings.seo || {};

    // Create feed
    const feed = new Feed({
      title: general.title || "BitBlog",
      description: general.description || "Blog Platform RSS Feed",
      id: siteUrl,
      link: siteUrl,
      language: "en",
      image: seo.defaultImage ? `${siteUrl}${seo.defaultImage}` : undefined,
      favicon: general.favicon
        ? `${siteUrl}${general.favicon}`
        : `${siteUrl}/favicon.ico`,
      copyright: `All rights reserved ${new Date().getFullYear()}, ${general.title || "BitBlog"}`,
      updated: new Date(),
      generator: "Blog Platform RSS Generator",
      feedLinks: {
        rss2: `${siteUrl}/rss.xml`,
        json: `${siteUrl}/feed.json`,
        atom: `${siteUrl}/atom.xml`,
      },
    });

    // Get published posts
    const posts = await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        visibility: "PUBLIC",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                name: true,
              },
            },
          },
        },
        categories: {
          include: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 50, // Limit to latest 50 posts
    });

    // Add posts to feed
    for (const post of posts) {
      const postUrl = `${siteUrl}/posts/${post.slug}`;

      feed.addItem({
        title: post.title,
        id: postUrl,
        link: postUrl,
        description: post.excerpt || "",
        content: post.excerpt || "",
        author: [
          {
            name: post.author.name,
            email: post.author.email,
          },
        ],
        date: new Date(post.publishedAt || post.createdAt),
        image: post.featuredImage,
        category: [
          ...post.categories.map((pc) => ({ name: pc.category.name })),
          ...post.tags.map((pt) => ({ name: pt.tag.name })),
        ],
      });
    }

    // Set content type and return RSS XML
    setHeader(event, "content-type", "application/rss+xml");
    return feed.rss2();
  } catch (error) {
    console.error("Error generating RSS feed:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to generate RSS feed",
    });
  }
});
