import { z } from "zod";
import { createAuditLog } from "~~/server/utils/database";
import { verifyJWT } from "~~/server/utils/auth";
import { UpdateSiteSettingsSchema } from "~~/shared/schemas";
import prisma from "~~/server/db";

export default defineEventHandler(async (event) => {
  try {
    // Verify authentication and permissions
    const user = await verifyJWT(event);
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    // Check permissions
    const hasPermission =
      user.permissions?.includes("settings.write") ||
      user.permissions?.includes("admin");

    if (!hasPermission) {
      throw createError({
        statusCode: 403,
        statusMessage: "Insufficient permissions",
      });
    }

    const body = await readBody(event);
    const settings = UpdateSiteSettingsSchema.parse(body);

    const clientIP = getClientIP(event) || "unknown";
    const userAgent = getHeader(event, "user-agent") || "unknown";

    // Update settings
    const updatedSettings = [];

    for (const [key, value] of Object.entries(settings)) {
      if (value !== undefined) {
        const setting = await prisma.siteSettings.upsert({
          where: { key },
          update: {
            value,
            updatedById: user.sub,
          },
          create: {
            key,
            value,
            updatedById: user.sub,
          },
        });

        updatedSettings.push(setting);

        // Log the change
        await createAuditLog({
          entity: "site_settings",
          entityId: setting.id,
          action: "update",
          details: { key, previousValue: null, newValue: value },
          userId: user.sub,
          ipAddress: clientIP,
          userAgent,
        });
      }
    }

    return {
      success: true,
      data: updatedSettings.map((setting) => ({
        key: setting.key,
        value: setting.value,
        updatedAt: setting.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error updating site settings:", error);

    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid settings data",
        data: error.errors,
      });
    }

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update site settings",
    });
  }
});
