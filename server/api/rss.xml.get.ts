import { Feed } from "feed";
import prisma from "~~/server/db";

export default defineEventHandler(async (event) => {
  try {
    const siteUrl = "https://blog.bitshiftdevs.com";

    const siteName = "BitBlog";
    const siteDescription =
      "Blog Platform for BitShift for sharing amazing stories and insights.";

    // Create feed
    const feed = new Feed({
      title: siteName,
      description: siteDescription,
      id: siteUrl,
      link: siteUrl,
      language: "en",
      favicon: `${siteUrl}/favicon.ico`,
      copyright: `All rights reserved ${new Date().getFullYear()}, ${siteName}`,
      updated: new Date(),
      generator: "BitShift RSS Generator",
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
            avatarUrl: true,
          },
        },
        tags: true,
        categories: true,
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
        content: post.excerpt || "",
        author: [
          {
            name: post.author.name,
            email: post.author.email,
          },
        ],
        date: new Date(post.publishedAt || post.createdAt),
        image: post.featuredImage || undefined,
        category: [
          ...post.categories.map((c) => ({ name: c.name })),
          ...post.tags.map((t) => ({ name: t.name })),
        ],
      });
    }

    // Set content type and return RSS XML
    setHeader(event, "content-type", "application/rss+xml");
    setHeader(event, "cache-control", "s-maxage=600, stale-while-revalidate");
    return feed.rss2();
  } catch (error) {
    console.error("Error generating RSS feed:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to generate RSS feed",
    });
  }
});
