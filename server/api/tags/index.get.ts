// apps/api/server/api/tags/index.get.ts
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
      orderBy = { posts: { _count: sortOrder } };
    }

    // Get total count
    const total = await prisma.tag.count();

    // Get tags
    const tags = await prisma.tag.findMany({
      include: {
        ...(includePostCount && {
          _count: {
            select: {
              posts: {
                where: {
                  post: {
                    status: "PUBLISHED",
                    visibility: "PUBLIC",
                  },
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

    // Transform tags for response
    const transformedTags = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
      color: tag.color,
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
      ...(includePostCount && { _count: tag._count }),
    }));

    const result = createPaginationResult(transformedTags, total, {
      page,
      limit,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error fetching tags:", error);

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
