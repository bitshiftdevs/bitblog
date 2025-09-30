import { requireAuth } from "~~/server/utils/auth";
import { ListParamsSchema } from "~~/shared/schemas";
import prisma from "~~/server/db";

export default defineEventHandler(async (event) => {
  // Require authentication
  await requireAuth(event);

  try {
    const query = getQuery(event);
    const { page, limit, search, sortBy, sortOrder } =
      ListParamsSchema.parse(query);

    // Build where clause
    const where: any = {};
    if (search) {
      where.OR = [
        { filename: { contains: search, mode: "insensitive" } },
        { altText: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy clause
    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = "desc";
    }

    // Get total count
    const total = await prisma.media.count({ where });

    // Get media items
    const items = await prisma.media.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    };
  } catch (error: any) {
    console.error("Media list error:", error);

    if (error.name === "ZodError") {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid query parameters",
        data: {
          message: "Validation failed",
          errors: error.errors,
        },
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch media",
    });
  }
});
