import { requireAuth } from '~~/server/utils/auth';
import prisma from '~~/server/db';

export default defineEventHandler(async (event) => {
  try {
    const commentId = getRouterParam(event, 'id');

    if (!commentId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Comment ID is required'
      });
    }

    // Require authentication
    const user = await requireAuth(event);

    // Get the existing comment
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        _count: {
          select: {
            replies: true
          }
        }
      }
    });

    if (!existingComment) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Comment not found'
      });
    }

    // Check permissions
    const isOwner = existingComment.authorId === user.id;
    const isAdmin = user.isAdmin;

    if (!isOwner && !isAdmin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only delete your own comments'
      });
    }

    // If user is not admin, they can only delete within a time limit and if no replies
    if (!isAdmin) {
      const commentAge = Date.now() - new Date(existingComment.createdAt).getTime();
      const deleteTimeLimit = 30 * 60 * 1000; // 30 minutes

      if (commentAge > deleteTimeLimit) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Comments can only be deleted within 30 minutes of posting'
        });
      }

      if (existingComment._count.replies > 0) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Cannot delete comments that have replies'
        });
      }
    }

    // Delete the comment (this will cascade delete replies if user is admin)
    await prisma.comment.delete({
      where: { id: commentId }
    });

    return {
      success: true,
      message: 'Comment deleted successfully'
    };

  } catch (error: any) {
    console.error('Comment deletion error:', error);

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to delete comment'
    });
  }
});