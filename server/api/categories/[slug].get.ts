// apps/api/server/api/categories/[slug].get.ts
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

    const category = await prisma.category.findUnique({
      where: { slug },
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

    if (!category) {
      throw createError({
        statusCode: 404,
        statusMessage: "Category not found",
      });
    }

    return {
      success: true,
      data: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        parentId: category.parentId,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
        parent: category.parent,
        children: category.children,
        _count: category._count,
      },
    };
  } catch (error) {
    console.error("Error fetching category:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});
