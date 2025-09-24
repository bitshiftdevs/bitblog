import { requireAuth } from "~~/server/utils/auth";
import prisma from "~~/server/db";

export default defineEventHandler(async (event) => {
  // Require authentication
  const auth = await requireAuth(event);

  try {
    // Fetch user profile from database
    const user = await prisma.user.findUnique({
      where: { id: auth.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        isAdmin: true,
        isActive: true,
        emailVerified: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found",
      });
    }

    return {
      success: true,
      data: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Profile fetch error:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch profile",
    });
  }
});

