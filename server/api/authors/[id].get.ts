// apps/api/server/api/authors/[id].get.ts
import { prisma } from "~~/lib/utils/database";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID parameter is required",
      });
    }

    const author = await prisma.user.findUnique({
      where: {
        id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
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
      },
    });

    if (!author) {
      throw createError({
        statusCode: 404,
        statusMessage: "Author not found",
      });
    }

    return {
      success: true,
      data: {
        id: author.id,
        name: author.name,
        email: author.email,
        avatarUrl: author.avatarUrl,
        bio: author.bio,
        createdAt: author.createdAt.toISOString(),
        updatedAt: author.updatedAt.toISOString(),
        _count: author._count,
      },
    };
  } catch (error) {
    console.error("Error fetching author:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});
