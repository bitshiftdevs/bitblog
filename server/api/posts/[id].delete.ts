import prisma from "~~/server/db";

export default defineEventHandler(async (event) => {
  // Require authentication
  const user = await requireAdmin(event);

  try {
    const postId = getRouterParam(event, "id");

    if (!postId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Post ID is required",
      });
    }

    // Check if post exists and user has permission to delete
    const existingPost = await prisma.post.delete({
      where: { id: postId },
      select: { id: true },
    });

    if (!existingPost) {
      throw createError({
        statusCode: 404,
        statusMessage: "Post not found",
      });
    }

    return {
      success: true,
      message: "Post deleted successfully",
    };
  } catch (error: any) {
    console.error("Post deletion error:", error);

    // Handle Prisma errors
    if (error.code === "P2025") {
      throw createError({
        statusCode: 404,
        statusMessage: "Post not found",
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete post",
    });
  }
});

