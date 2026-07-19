import prisma from "~~/server/db";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  try {
    const id = getRouterParam(event, "id");

    // Check category exists and has no children
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        children: { select: { id: true } },
        _count: { select: { posts: true } },
      },
    });

    if (!existingCategory) {
      throw createError({
        statusCode: 404,
        statusMessage: "Category not found",
      });
    }

    // Prevent deleting categories with children
    if (existingCategory.children.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage:
          "Cannot delete a category that has child categories. Remove or reassign children first.",
      });
    }

    // Delete the category (Prisma will disconnect from posts automatically via implicit many-to-many)
    await prisma.category.delete({
      where: { id },
    });

    return {
      success: true,
      data: { id },
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    console.error("Error deleting category:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete category",
    });
  }
});
