import prisma from "~~/server/db";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  try {
    const id = getRouterParam(event, "id");

    // Check tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: { select: { posts: true } },
      },
    });

    if (!existingTag) {
      throw createError({
        statusCode: 404,
        statusMessage: "Tag not found",
      });
    }

    // Delete the tag (Prisma will disconnect from posts automatically via implicit many-to-many)
    await prisma.tag.delete({
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

    console.error("Error deleting tag:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete tag",
    });
  }
});
