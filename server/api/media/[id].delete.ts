import { deleteFromR2 } from "~~/server/utils/r2";
import prisma from "~~/server/db";

export default defineEventHandler(async (event) => {
  // Require authentication
  await requireAdmin(event);

  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Media ID is required",
      });
    }

    // Get media record to check ownership and get the key for R2 deletion
    const media = await prisma.media.delete({
      where: { id },
      select: { key: true },
    });

    if (!media) {
      throw createError({
        statusCode: 404,
        statusMessage: "Media not found",
      });
    }

    try {
      // Delete from R2 storage
      await deleteFromR2(media.key);
    } catch (r2Error) {
      console.error("R2 deletion error:", r2Error);
      // Continue with database deletion even if R2 deletion fails
      // This prevents orphaned database records
    }

    return {
      success: true,
      message: "Media deleted successfully",
    };
  } catch (error: any) {
    console.error("Media deletion error:", error);

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Failed to delete media",
    });
  }
});

