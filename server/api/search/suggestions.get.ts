// apps/api/server/api/search/suggestions.get.ts
import { z } from "zod";
import prisma from "~~/server/db";

const QuerySchema = z.object({
  q: z.string().min(1),
  limit: z.coerce.number().int().min(1).max(10).default(5),
});

export default defineEventHandler(async (event) => {
  try {
    const { q, limit } = await getValidatedQuery(event, QuerySchema.parse);

    // Get tag suggestions
    const tags = await prisma.tag.findMany({
      where: {
        name: {
          contains: q,
          mode: "insensitive",
        },
      },
      select: {
        name: true,
      },
      take: limit,
    });

    // Get category suggestions
    const categories = await prisma.category.findMany({
      where: {
        name: {
          contains: q,
          mode: "insensitive",
        },
      },
      select: {
        name: true,
      },
      take: limit,
    });

    // Combine suggestions
    const suggestions = [
      ...tags.map((tag) => tag.name),
      ...categories.map((category) => category.name),
    ].slice(0, limit);

    return {
      success: true,
      data: suggestions,
    };
  } catch (error) {
    console.error("Suggestions error:", error);

    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid query parameters",
        data: error.errors,
      });
    }

    return {
      success: true,
      data: [],
    };
  }
});
