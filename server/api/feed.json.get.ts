// apps/api/server/api/feed.json.get.ts
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

    // Create feed
    const feed = new Feed({
      title: general.title || "Blog Platform",
      description: general.description || "A modern multi-admin blog platform",
      id: siteUrl,
      link: siteUrl,
      language: "en",
      updated: new Date(),
      generator: "Blog Platform JSON Feed Generator",
    });

    // Get published posts
    const posts = await prisma.post.findMany({
      where: {
        status: "published",
        visibility: "public",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 50,
    });

    // Add posts to feed
    for (const post of posts) {
      const postUrl = `${siteUrl}/posts/${post.slug}`;

      feed.addItem({
        title: post.title,
        id: postUrl,
        link: postUrl,
        description: post.excerpt || "",
        author: [
          {
            name: post.author.name,
            email: post.author.email,
          },
        ],
        date: new Date(post.publishedAt || post.createdAt),
      });
    }

    // Set content type and return JSON feed
    setHeader(event, "content-type", "application/feed+json");
    return feed.json1();
  } catch (error) {
    console.error("Error generating JSON feed:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to generate JSON feed",
    });
  }
});
