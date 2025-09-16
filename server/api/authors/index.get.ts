// apps/api/server/api/authors/index.get.ts
import { z } from "zod";
import {
  createPaginationOptions,
  createPaginationResult,
} from "~~/lib/utils/database";
import { PaginationSchema } from "~~/lib/schemas";
import prisma from "~~/server/db";

const QuerySchema = PaginationSchema.extend({
  includePostCount: z.boolean().optional().default(true),
});

export default defineEventHandler(async (event) => {
  try {
    const query = await getValidatedQuery(event, QuerySchema.parse);
    const { includePostCount, ...paginationOptions } = query;
    const { page, limit, sortBy, sortOrder } =
      createPaginationOptions(paginationOptions);

    // Build order by
    let orderBy: any = { [sortBy]: sortOrder };
    if (sortBy === "posts") {
      orderBy = { authoredPosts: { _count: sortOrder } };
    }

    // Only get active users who have published posts
    const where = {
      isActive: true,
      authoredPosts: {
        some: {
          status: "PUBLISHED",
          visibility: "PUBLIC",
        },
      },
    };

    // Get total count
    const total = await prisma.user.count({ where });

    // Get authors
    const authors = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        ...(includePostCount && {
          _count: {
            select: {
              authoredPosts: {
                where: {
                  status: "PUBLISHED",
                  visibility: "PUBLIC",
                },
              },
            },
          },
        }),
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    // Transform authors for response
    const transformedAuthors = authors.map((author) => ({
      id: author.id,
      name: author.name,
      email: author.email,
      avatarUrl: author.avatarUrl,
      bio: author.bio,
      createdAt: author.createdAt.toISOString(),
      updatedAt: author.updatedAt.toISOString(),
      ...(includePostCount && { _count: author._count }),
    }));

    const result = createPaginationResult(transformedAuthors, total, {
      page,
      limit,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error fetching authors:", error);

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
