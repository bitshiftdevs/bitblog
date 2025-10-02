import { UpdateCommentSchema } from '~~/shared/schemas';
import { requireAuth } from '~~/server/utils/auth';
import prisma from '~~/server/db';

export default defineEventHandler(async (event) => {
  try {
    const commentId = getRouterParam(event, 'id');
    const body = await readBody(event);

    if (!commentId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Comment ID is required'
      });
    }

    // Validate request body
    const validatedData = UpdateCommentSchema.parse(body);

    // Require authentication
    const user = await requireAuth(event);

    // Get the existing comment
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
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
        statusMessage: 'You can only edit your own comments'
      });
    }

    // If user is not admin, they can only edit content and only within a time limit
    if (!isAdmin) {
      const commentAge = Date.now() - new Date(existingComment.createdAt).getTime();
      const editTimeLimit = 30 * 60 * 1000; // 30 minutes

      if (commentAge > editTimeLimit) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Comments can only be edited within 30 minutes of posting'
        });
      }

      if (validatedData.status) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Only administrators can change comment status'
        });
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (validatedData.content) {
      // Basic content sanitization
      updateData.content = validatedData.content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }

    if (validatedData.status && isAdmin) {
      updateData.status = validatedData.status;
    }

    // Update the comment
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      }
    });

    return {
      success: true,
      data: {
        ...updatedComment,
        createdAt: updatedComment.createdAt.toISOString(),
        updatedAt: updatedComment.updatedAt.toISOString()
      },
      message: 'Comment updated successfully'
    };

  } catch (error: any) {
    console.error('Comment update error:', error);

    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid comment data',
        data: {
          message: 'Validation failed',
          errors: error.errors
        }
      });
    }

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to update comment'
    });
  }
});