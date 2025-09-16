import prisma from "~~/server/db";

export default defineEventHandler(async (event) => {
  try {
    // Get all site settings
    const settings = await prisma.siteSettings.findMany({
      select: {
        id: true,
        key: true,
        value: true,
        updatedAt: true,
      },
    });

    // Transform to key-value object
    const settingsMap = settings.reduce(
      (acc, setting) => {
        acc[setting.key] = {
          value: setting.value,
          updatedAt: setting.updatedAt.toISOString(),
        };
        return acc;
      },
      {} as Record<string, any>,
    );

    return {
      success: true,
      data: settingsMap,
    };
  } catch (error) {
    console.error("Error fetching site settings:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch site settings",
    });
  }
});
