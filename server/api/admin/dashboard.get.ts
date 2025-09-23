// apps/api/server/api/admin/dashboard.get.ts
import prisma from "~~/server/db";

export default defineEventHandler(async (event) => {
  try {
    // Verify authentication
    const user = await requireAdmin(event);
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    // Get dashboard statistics
    const [
      postsStats,
      commentsStats,
      recentPosts,
      pendingComments,
      recentActivity,
    ] = await Promise.all([
      // Posts statistics
      Promise.all([
        prisma.post.count(),
        prisma.post.count({ where: { status: "PUBLISHED" } }),
        prisma.post.count({ where: { status: "DRAFT" } }),
        prisma.post.count({ where: { status: "SCHEDULED" } }),
      ]).then(([total, published, draft, scheduled]) => ({
        total,
        published,
        draft,
        scheduled,
      })),

      // Comments statistics
      Promise.all([
        prisma.comment.count(),
        prisma.comment.count({ where: { status: "PENDING" } }),
        prisma.comment.count({ where: { status: "APPROVED" } }),
      ]).then(([total, pending, approved]) => ({
        total,
        pending,
        approved,
      })),

      // Recent posts
      prisma.post.findMany({
        select: {
          id: true,
          title: true,
          status: true,
          updatedAt: true,
          author: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 5,
      }),

      // Pending comments
      prisma.comment.findMany({
        where: {
          status: "PENDING",
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          author: {
            select: {
              name: true,
            },
          },
          guestName: true,
          post: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),

      // Recent audit logs
      prisma.auditLog.findMany({
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      }),
    ]);

    return {
      success: true,
      data: {
        stats: {
          posts: postsStats,
          comments: commentsStats,
          users: {
            total: await prisma.user.count(),
            active: await prisma.user.count({ where: { isActive: true } }),
          },
        },
        recentPosts: recentPosts.map((post) => ({
          ...post,
          updatedAt: post.updatedAt.toISOString(),
        })),
        pendingComments: pendingComments.map((comment) => ({
          ...comment,
          createdAt: comment.createdAt.toISOString(),
        })),
        recentActivity: recentActivity.map((log) => ({
          ...log,
          createdAt: log.createdAt.toISOString(),
        })),
      },
    };
  } catch (error) {
    console.error("Dashboard data error:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to load dashboard data",
    });
  }
});
