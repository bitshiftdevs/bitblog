// apps/api/server/api/admin/dashboard.get.ts
import prisma from "~~/server/db";
import { DashboardResponse } from "~~/shared/types";

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
    const [users, posts, comments, recentPosts, pendingComments] =
      await prisma.$transaction(async (txn) => {
        const users = await txn.user.groupBy({ by: "isActive", _count: true });
        const posts = await txn.post.groupBy({ by: "status", _count: true });

        const comments = await txn.comment.groupBy({
          by: "status",
          _count: true,
        });
        const recentPosts = await txn.post.findMany({
          select: {
            id: true,
            title: true,
            status: true,
            updatedAt: true,
            author: { select: { name: true } },
          },
          orderBy: { updatedAt: "desc" },
          take: 5,
        });
        const pendingComments = await txn.comment.findMany({
          where: { status: "pending" },
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: { select: { name: true } },
            guestName: true,
            post: { select: { title: true, slug: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        });
        return [users, posts, comments, recentPosts, pendingComments];
      });

    const data: DashboardResponse = {
      posts: { total: 0, published: 0, draft: 0, scheduled: 0 },
      users: { total: 0, active: 0 },
      comments: { total: 0, pending: 0, approved: 0 },
      media: { total: 0, totalSize: 0 },
      recentPosts,
      pendingComments,
    };
    posts.forEach((post) => {
      data.posts[post.status] = post._count;
      data.posts.total += post._count;
    });
    comments.forEach((comment) => {
      data.comments[comment.status] = comment._count;
    });
    console.dir(users, { depth: null });
    users.forEach((user) => {
      if (user.isActive) {
        data.users["active"] = user._count;
      }
      data.users.total += user._count;
    });

    return {
      success: true,
      data,
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
