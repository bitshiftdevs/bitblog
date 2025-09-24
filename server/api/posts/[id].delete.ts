import { requireAuth } from '~~/server/utils/auth';
import prisma from '~~/server/db';

export default defineEventHandler(async (event) => {
  // Require authentication
  const session = await requireAuth(event);

  try {
    const postId = getRouterParam(event, 'id');

    if (!postId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Post ID is required'
      });
    }

    // Check if post exists and user has permission to delete
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: true,
        coAuthors: true
      }
    });

    if (!existingPost) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Post not found'
      });
    }

    // Check if user is author, co-author, or admin
    const canDelete = existingPost.authorId === session.id ||
                     existingPost.coAuthors.some(coAuthor => coAuthor.id === session.id) ||
                     session.isAdmin;

    if (!canDelete) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You do not have permission to delete this post'
      });
    }

    // Delete the post (this will cascade delete related records like comments, revisions, etc.)
    await prisma.post.delete({
      where: { id: postId }
    });

    return {
      success: true,
      message: 'Post deleted successfully'
    };
  } catch (error: any) {
    console.error('Post deletion error:', error);

    // Handle Prisma errors
    if (error.code === 'P2025') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Post not found'
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete post'
    });
  }
});