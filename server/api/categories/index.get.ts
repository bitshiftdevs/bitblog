// apps/api/server/api/categories/index.get.ts
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
    const total = await prisma.category.count();

    // Get categories
    const categories = await prisma.category.findMany({
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
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

    // Transform categories for response
    const transformedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
      parent: category.parent,
      children: category.children,
      ...(includePostCount && { _count: category._count }),
    }));

    const result = createPaginationResult(transformedCategories, total, {
      page,
      limit,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error fetching categories:", error);

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
