// server/api/auth/login.post.ts
import { z } from "zod";
import * as argon2 from "argon2";
import { LoginSchema } from "~~/shared/schemas";
import prisma from "~~/server/db";

export default defineEventHandler(async (event) => {
  try {
    const { email, password, rememberMe } = await readValidatedBody(
      event,
      LoginSchema.parse,
    );

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      omit: { createdAt: true, updatedAt: true },
    });

    if (!user || !user.passwordHash) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      throw createError({
        statusCode: 403,
        statusMessage: "Account is deactivated. Please contact support.",
      });
    }

    // Verify password
    const isValidPassword = await verifyPassword(user.passwordHash, password);

    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid email or password",
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw createError({
        statusCode: 403,
        statusMessage: "Please verify your email address before logging in.",
      });
    }

    await setUserSession(event, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        isActive: user.isActive,
        twoFactorEnabled: user.twoFactorEnabled,
        emailVerified: user.emailVerified,
        isAdmin: user.isAdmin,
      },
    });
    return {};
  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid request data",
        data: error.errors,
      });
    }

    // Re-throw HTTP errors
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});
