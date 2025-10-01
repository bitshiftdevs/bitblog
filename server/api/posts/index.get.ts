import { z } from "zod";
import {
  createPaginationOptions,
  createPaginationResult,
  createSearchFilter,
} from "~~/server/utils/database";
import { PostFiltersSchema, PaginationSchema } from "~~/shared/schemas";
import prisma from "~~/server/db";
import { PostWhereInput } from "~~/shared/generated/prisma/models";
import { PostSummary } from "~~/shared/types";

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
    const where: PostWhereInput = {
      ...(status && { status }),
      visibility: visibility ?? "public",
      ...(authorId && { authorId }),
      ...(tagId && { tags: { some: { id: tagId } } }),
      ...(categoryId && { categories: { some: { id: categoryId } } }),
    };

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
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        status: true,
        visibility: true,
        featuredImage: true,
        readingTime: true,
        viewCount: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        tags: { select: { id: true, name: true, color: true } },
        categories: { select: { id: true, name: true } },
        _count: {
          select: { comments: { where: { status: "approved" } } },
        },
      },
      orderBy,
      skip: (page! - 1) * limit!,
      take: limit,
    });

    const result = createPaginationResult(
      posts as unknown as PostSummary[],
      total,
      {
        page,
        limit,
      },
    );

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
