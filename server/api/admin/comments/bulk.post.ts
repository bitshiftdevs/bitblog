import { z } from 'zod';
import { requireAdmin } from '~~/server/utils/auth';
import prisma from '~~/server/db';

// Schema for bulk operations
const BulkCommentActionSchema = z.object({
  commentIds: z.array(z.string().uuid()).min(1, 'At least one comment ID is required'),
  action: z.enum(['approve', 'reject', 'spam', 'delete']),
  filters: z.object({
    status: z.string().optional(),
    postId: z.string().optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional()
  }).optional()
});

export default defineEventHandler(async (event) => {
  try {
    // Require admin authentication
    await requireAdmin(event);

    const body = await readBody(event);
    const { commentIds, action, filters } = BulkCommentActionSchema.parse(body);

    // Verify comments exist and get current stats
    const existingComments = await prisma.comment.findMany({
      where: {
        id: { in: commentIds }
      },
      select: {
        id: true,
        status: true,
        _count: {
          select: {
            replies: true
          }
        }
      }
    });

    if (existingComments.length !== commentIds.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Some comments were not found'
      });
    }

    let result: any = {
      success: true,
      processed: 0,
      message: ''
    };

    switch (action) {
      case 'approve':
        const approveResult = await prisma.comment.updateMany({
          where: {
            id: { in: commentIds },
            status: { not: 'approved' }
          },
          data: {
            status: 'approved'
          }
        });
        result.processed = approveResult.count;
        result.message = `${approveResult.count} comments approved successfully`;
        break;

      case 'reject':
        const rejectResult = await prisma.comment.updateMany({
          where: {
            id: { in: commentIds },
            status: { not: 'REJECTED' }
          },
          data: {
            status: 'REJECTED'
          }
        });
        result.processed = rejectResult.count;
        result.message = `${rejectResult.count} comments rejected successfully`;
        break;

      case 'spam':
        const spamResult = await prisma.comment.updateMany({
          where: {
            id: { in: commentIds },
            status: { not: 'SPAM' }
          },
          data: {
            status: 'SPAM'
          }
        });
        result.processed = spamResult.count;
        result.message = `${spamResult.count} comments marked as spam successfully`;
        break;

      case 'delete':
        // For bulk delete, we need to handle this carefully due to cascading
        const deleteResult = await prisma.comment.deleteMany({
          where: {
            id: { in: commentIds }
          }
        });
        result.processed = deleteResult.count;
        result.message = `${deleteResult.count} comments deleted successfully`;
        break;

      default:
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid action specified'
        });
    }

    // If filters were provided, apply them to more comments
    if (filters && Object.keys(filters).length > 0) {
      const filterWhere: any = {};

      if (filters.status && filters.status !== 'all') {
        filterWhere.status = filters.status.toUpperCase();
      }

      if (filters.postId && filters.postId !== 'all') {
        filterWhere.postId = filters.postId;
      }

      if (filters.fromDate || filters.toDate) {
        filterWhere.createdAt = {};
        if (filters.fromDate) {
          filterWhere.createdAt.gte = new Date(filters.fromDate);
        }
        if (filters.toDate) {
          filterWhere.createdAt.lte = new Date(filters.toDate);
        }
      }

      // Apply action to filtered comments if any filters are provided
      if (Object.keys(filterWhere).length > 0) {
        let additionalResult: any;

        switch (action) {
          case 'approve':
            additionalResult = await prisma.comment.updateMany({
              where: {
                ...filterWhere,
                status: { not: 'approved' }
              },
              data: { status: 'approved' }
            });
            break;

          case 'reject':
            additionalResult = await prisma.comment.updateMany({
              where: {
                ...filterWhere,
                status: { not: 'REJECTED' }
              },
              data: { status: 'REJECTED' }
            });
            break;

          case 'spam':
            additionalResult = await prisma.comment.updateMany({
              where: {
                ...filterWhere,
                status: { not: 'SPAM' }
              },
              data: { status: 'SPAM' }
            });
            break;

          case 'delete':
            additionalResult = await prisma.comment.deleteMany({
              where: filterWhere
            });
            break;
        }

        if (additionalResult) {
          result.processed += additionalResult.count;
          result.message = `${result.processed} comments ${action}d successfully (including filtered results)`;
        }
      }
    }

    return result;

  } catch (error: any) {
    console.error('Bulk comment action error:', error);

    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request data',
        data: {
          message: 'Validation failed',
          errors: error.errors
        }
      });
    }

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to perform bulk action'
    });
  }
});