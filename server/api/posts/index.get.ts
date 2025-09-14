// apps/api/server/api/posts/index.get.ts
import { z } from "zod";
import {
  prisma,
  createPaginationOptions,
  createPaginationResult,
  createSearchFilter,
} from "~/../lib/utils/database";
import { PostFiltersSchema, PaginationSchema } from "~/../lib/schemas";

const QuerySchema = PostFiltersSchema.merge(PaginationSchema).extend({
  includeDrafts: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  try {
    const query = await getValidatedQuery(event, QuerySchema.parse);
    const {
      status,
      visibility,
      authorId,
      tagId,
      categoryId,
      search,
      fromDate,
      toDate,
      includeDrafts,
      ...paginationOptions
    } = query;

    const { page, limit, sortBy, sortOrder } =
      createPaginationOptions(paginationOptions);

    // Build where clause
    const where: any = {};

    // Status filter - only published posts for public API unless includeDrafts is true
    if (status) {
      where.status = status;
    } else if (!includeDrafts) {
      where.status = "PUBLISHED";
    }

    // Visibility filter
    if (visibility) {
      where.visibility = visibility;
    } else {
      where.visibility = "PUBLIC"; // Only public posts by default
    }

    // Author filter
    if (authorId) {
      where.authorId = authorId;
    }

    // Tag filter
    if (tagId) {
      where.tags = {
        some: {
          tagId,
        },
      };
    }

    // Category filter
    if (categoryId) {
      where.categories = {
        some: {
          categoryId,
        },
      };
    }

    // Date range filter
    if (fromDate || toDate) {
      where.publishedAt = {};
      if (fromDate) where.publishedAt.gte = new Date(fromDate);
      if (toDate) where.publishedAt.lte = new Date(toDate);
    }

    // Search filter
    if (search) {
      const searchFilter = createSearchFilter(search, [
        "title",
        "excerpt",
        "content",
      ]);
      where.OR = searchFilter.OR;
    }

    // Create order by
    let orderBy: any = { [sortBy]: sortOrder };

    // Handle special sort cases
    if (sortBy === "author") {
      orderBy = { author: { name: sortOrder } };
    }

    // Get total count
    const total = await prisma.post.count({ where });

    // Get posts
    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              },
            },
          },
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: {
              where: {
                status: "APPROVED",
              },
            },
          },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    // Transform posts for response
    const transformedPosts = posts.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      status: post.status,
      visibility: post.visibility,
      featuredImage: post.featuredImage,
      readingTime: post.readingTime,
      viewCount: post.viewCount,
      publishedAt: post.publishedAt?.toISOString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      author: post.author,
      tags: post.tags,
      categories: post.categories,
      _count: post._count,
    }));

    const result = createPaginationResult(transformedPosts, total, {
      page,
      limit,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error fetching posts:", error);

    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid query parameters",
        data: error.errors,
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});
