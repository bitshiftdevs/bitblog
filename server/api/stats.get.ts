// apps/api/server/api/stats.get.ts
import prisma from "~~/server/db";

export default defineEventHandler(async (event) => {
  try {
    // Get basic site statistics
    const [
      totalPosts,
      publishedPosts,
      totalAuthors,
      totalCategories,
      totalTags,
      totalViews,
      totalComments,
    ] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({
        where: {
          status: "published",
          visibility: "public",
        },
      }),
      prisma.user.count({
        where: {
          isActive: true,
          authoredPosts: {
            some: {
              status: "published",
            },
          },
        },
      }),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.post.aggregate({
        _sum: {
          viewCount: true,
        },
        where: {
          status: "published",
          visibility: "public",
        },
      }),
      prisma.comment.count({
        where: {
          status: "approved",
        },
      }),
    ]);

    return {
      success: true,
      data: {
        posts: publishedPosts,
        authors: totalAuthors,
        categories: totalCategories,
        tags: totalTags,
        views: totalViews._sum.viewCount || 0,
        comments: totalComments,
      },
    };
  } catch (error) {
    console.error("Error fetching stats:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});
