import { requireAuth } from '~~/server/utils/auth';
import { UpdateMediaSchema } from '~~/shared/schemas';
import prisma from '~~/server/db';

export default defineEventHandler(async (event) => {
  // Require authentication
  await requireAuth(event);

  try {
    const id = getRouterParam(event, 'id');
    const body = await readBody(event);

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Media ID is required'
      });
    }

    // Validate request body
    const { altText, caption } = UpdateMediaSchema.parse(body);

    // Check if media exists
    const existingMedia = await prisma.media.findUnique({
      where: { id }
    });

    if (!existingMedia) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Media not found'
      });
    }

    // Update media metadata
    const updatedMedia = await prisma.media.update({
      where: { id },
      data: {
        altText,
        caption
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      }
    });

    return {
      success: true,
      data: {
        ...updatedMedia,
        createdAt: updatedMedia.createdAt.toISOString(),
        updatedAt: updatedMedia.updatedAt.toISOString()
      },
      message: 'Media updated successfully'
    };
  } catch (error: any) {
    console.error('Media update error:', error);

    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request data',
        data: {
          message: 'Validation failed',
          errors: error.errors
        }
      });
    }

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to update media'
    });
  }
});