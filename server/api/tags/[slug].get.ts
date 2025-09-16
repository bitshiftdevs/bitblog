// apps/api/server/api/tags/[slug].get.ts
import prisma from "~~/server/db";

export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, "slug");

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: "Slug parameter is required",
      });
    }

    const tag = await prisma.tag.findUnique({
      where: { slug },
      include: {
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
      },
    });

    if (!tag) {
      throw createError({
        statusCode: 404,
        statusMessage: "Tag not found",
      });
    }

    return {
      success: true,
      data: {
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        color: tag.color,
        createdAt: tag.createdAt.toISOString(),
        updatedAt: tag.updatedAt.toISOString(),
        _count: tag._count,
      },
    };
  } catch (error) {
    console.error("Error fetching tag:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});
