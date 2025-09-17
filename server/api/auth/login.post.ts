// server/api/auth/login.post.ts
import { z } from "zod";
import * as argon2 from "argon2";
import { SignJWT } from "jose";
import { LoginSchema } from "~~/lib/schemas";
import prisma from "~~/server/db";
import { createAuditLog } from "~~/lib/utils/database";
import { randomUUID } from "node:crypto";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { email, password, rememberMe } = LoginSchema.parse(body);

    const config = useRuntimeConfig();
    const userAgent = getHeader(event, "user-agent") || "unknown";

    // Find user by email
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || !user.passwordHash) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid email or password",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      throw createError({
        statusCode: 403,
        statusMessage: "Account is deactivated. Please contact support.",
      });
    }

    // Verify password
    const isValidPassword = await argon2.verify(user.passwordHash, password);

    if (!isValidPassword) {
      // Log failed login attempt
      await createAuditLog({
        entity: "user",
        entityId: user.id,
        action: "login_failed",
        details: { reason: "invalid_password" },
        userId: user.id,
        userAgent,
      });

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

    // Collect user permissions
    const permissions = user.roles.reduce((perms: string[], userRole) => {
      const rolePerms = userRole.role.permissions as Record<string, string[]>;
      Object.values(rolePerms).forEach((permArray) => {
        perms.push(...permArray);
      });
      return [...new Set(perms)]; // Remove duplicates
    }, []);

    // Create JWT token
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      permissions,
      iat: Math.floor(Date.now() / 1000),
    };

    console.log(config.jwtSecret);
    const jwtSecret = new TextEncoder().encode(config.jwtSecret);
    const expiresIn = rememberMe ? "30d" : "24h";
    const expirationTime = rememberMe ? "30d" : "24h";

    const token = await new SignJWT(tokenPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(expirationTime)
      .sign(jwtSecret);
    console.log("done generating");

    // Create refresh token if remember me is enabled
    let refreshToken = null;
    if (rememberMe) {
      const refreshTokenPayload = {
        sub: user.id,
        type: "refresh",
        iat: Math.floor(Date.now() / 1000),
      };

      const refreshJwtSecret = new TextEncoder().encode(
        config.jwtRefreshSecret,
      );
      refreshToken = await new SignJWT(refreshTokenPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(refreshJwtSecret);
    }

    // Create session record
    const sessionToken = randomUUID();
    const expiresAt = new Date();
    expiresAt.setTime(
      expiresAt.getTime() +
        (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000),
    );

    await prisma.session.create({
      data: {
        id: sessionToken,
        userId: user.id,
        token: sessionToken,
        expiresAt,
        userAgent,
      },
    });

    // Update user last seen
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastSeenAt: new Date(),
      },
    });

    // Log successful login
    await createAuditLog({
      entity: "user",
      entityId: user.id,
      action: "login",
      details: { rememberMe },
      userId: user.id,
      userAgent,
    });

    // Transform user data for response
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      isActive: user.isActive,
      twoFactorEnabled: user.twoFactorEnabled,
      emailVerified: user.emailVerified,
      lastSeenAt: user.lastSeenAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      roles: user.roles.map((ur) => ({
        id: ur.id,
        userId: ur.userId,
        roleId: ur.roleId,
        role: {
          id: ur.role.id,
          name: ur.role.name,
          description: ur.role.description,
          permissions: ur.role.permissions,
        },
      })),
      permissions,
    };

    return {
      success: true,
      data: {
        user: userData,
        token,
        refreshToken,
        expiresAt: expiresAt.toISOString(),
        sessionId: sessionToken,
      },
    };
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
