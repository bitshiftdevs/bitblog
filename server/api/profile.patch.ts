import { UpdateProfileSchema } from '~~/shared/schemas';
import { requireAuth } from '~~/server/utils/auth';
import prisma from '~~/server/db';

export default defineEventHandler(async (event) => {
  // Require authentication
  const session = await requireAuth(event);

  try {
    // Parse and validate request body
    const body = await readBody(event);
    const validatedData = UpdateProfileSchema.parse(body);

    // Update user profile in database
    const updatedUser = await prisma.user.update({
      where: {
        id: session.id
      },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.bio !== undefined && { bio: validatedData.bio || null }),
        ...(validatedData.avatarUrl !== undefined && { avatarUrl: validatedData.avatarUrl || null }),
        updatedAt: new Date()
      },
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
        updatedAt: true
      }
    });

    return {
      success: true,
      data: {
        ...updatedUser,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString()
      }
    };
  } catch (error: any) {
    console.error('Profile update error:', error);

    // Handle validation errors
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid profile data',
        data: {
          message: 'Validation failed',
          errors: error.errors
        }
      });
    }

    // Handle Prisma errors
    if (error.code === 'P2025') {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update profile'
    });
  }
});