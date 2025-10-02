import { ListParamsSchema } from '~~/shared/schemas';
import { requireAdmin } from '~~/server/utils/auth';
import prisma from '~~/server/db';

export default defineEventHandler(async (event) => {
  try {
    // Require admin authentication
    await requireAdmin(event);

    const query = getQuery(event);
    const { page, limit, search, sortBy, sortOrder } = ListParamsSchema.parse(query);

    // Additional filters for comments
    const status = query.status as string;
    const postId = query.postId as string;
    const fromDate = query.fromDate as string;
    const toDate = query.toDate as string;

    // Build where clause
    const where: any = {};

    // Filter by status
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    // Filter by post
    if (postId && postId !== 'all') {
      where.postId = postId;
    }

    // Filter by date range
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) {
        where.createdAt.gte = new Date(fromDate);
      }
      if (toDate) {
        where.createdAt.lte = new Date(toDate);
      }
    }

    // Search functionality
    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { guestName: { contains: search, mode: 'insensitive' } },
        { guestEmail: { contains: search, mode: 'insensitive' } },
        {
          author: {
            name: { contains: search, mode: 'insensitive' }
          }
        }
      ];
    }

    // Build orderBy clause
    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    // Get total count
    const total = await prisma.comment.count({ where });

    // Get comments
    const comments = await prisma.comment.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            email: true
          }
        },
        post: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        },
        _count: {
          select: {
            replies: true
          }
        }
      }
    });

    // Get comment statistics
    const stats = await prisma.comment.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        items: comments.map(comment => ({
          ...comment,
          createdAt: comment.createdAt.toISOString(),
          updatedAt: comment.updatedAt.toISOString()
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        stats: stats.reduce((acc, stat) => {
          acc[stat.status.toLowerCase()] = stat._count.id;
          return acc;
        }, {} as Record<string, number>)
      }
    };

  } catch (error: any) {
    console.error('Admin comments list error:', error);

    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid query parameters',
        data: {
          message: 'Validation failed',
          errors: error.errors
        }
      });
    }

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch comments'
    });
  }
});