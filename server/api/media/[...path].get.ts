import prisma from '~~/server/db';

// File serving endpoint - redirects to R2 URLs or serves from local storage
export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path');

  if (!path) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File path is required'
    });
  }

  try {
    // Look up the media record by key
    const media = await prisma.media.findUnique({
      where: { key: path }
    });

    if (!media) {
      throw createError({
        statusCode: 404,
        statusMessage: 'File not found'
      });
    }

    // Redirect to the actual R2 URL
    // This allows us to serve files through our API while keeping the actual storage URLs private
    return sendRedirect(event, media.url, 302);
  } catch (error: any) {
    console.error('Media serving error:', error);

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to serve media file'
    });
  }
});