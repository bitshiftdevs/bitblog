import { ListParamsSchema } from "~~/shared/schemas";
import prisma from "~~/server/db";

export default defineEventHandler(async (event) => {
  try {
    const postId = getRouterParam(event, "id");
    const query = getQuery(event);

    if (!postId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Post ID is required",
      });
    }

    // Parse query parameters
    const { page, limit } = ListParamsSchema.parse(query);
    const includeAll = query.includeAll === "true"; // For admin preview

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, commentEnabled: true },
    });

    if (!post) {
      throw createError({
        statusCode: 404,
        statusMessage: "Post not found",
      });
    }

    // Build where clause based on whether we want all comments or just approved ones
    const whereClause: any = {
      postId,
      parentId: null, // Only top-level comments, replies are included via nested include
    };

    if (!includeAll) {
      whereClause.status = "approved";
    }

    // Get total count for pagination
    const total = await prisma.comment.count({
      where: {
        postId,
        ...(includeAll ? {} : { status: "approved" }),
      },
    });

    // Get comments with replies
    const comments = await prisma.comment.findMany({
      where: whereClause,
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        replies: {
          where: includeAll ? {} : { status: "approved" },
          include: {
            author: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: {
            replies: { where: includeAll ? {} : { status: "approved" } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        items: comments,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    };
  } catch (error: any) {
    console.error("Comments fetch error:", error);

    if (error.name === "ZodError") {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid query parameters",
        data: {
          message: "Validation failed",
          errors: error.errors,
        },
      });
    }

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Failed to fetch comments",
    });
  }
});

