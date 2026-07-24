import { Feed } from "feed";
import prisma from "~~/server/db";

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const siteUrl = config.public.siteUrl || "https://localhost:3000";

    const siteName = "BitShift";
    const siteDescription =
      "Blog Platform for BitShift for sharing amazing stories and insights.";

    // Create feed
    const feed = new Feed({
      title: siteName,
      description: siteDescription,
      id: siteUrl,
      link: siteUrl,
      language: "en",
      copyright: `All rights reserved ${new Date().getFullYear()}, ${siteName}`,
      updated: new Date(),
      generator: "BitShift JSON Feed Generator",
      feedLinks: {
        rss2: `${siteUrl}/api/rss.xml`,
        json: `${siteUrl}/api/feed.json`,
      },
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
    setHeader(event, "cache-control", "s-maxage=600, stale-while-revalidate");
    return feed.json1();
  } catch (error) {
    console.error("Error generating JSON feed:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to generate JSON feed",
    });
  }
});
