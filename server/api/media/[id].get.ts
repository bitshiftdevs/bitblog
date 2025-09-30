import { requireAuth } from "~~/server/utils/auth";
import prisma from "~~/server/db";

export default defineEventHandler(async (event) => {
  // Require authentication
  await requireAuth(event);

  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Media ID is required",
      });
    }

    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw createError({
        statusCode: 404,
        statusMessage: "Media not found",
      });
    }

    return {
      success: true,
      data: media,
    };
  } catch (error: any) {
    console.error("Media fetch error:", error);

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Failed to fetch media",
    });
  }
});
