import { requireAuth } from '~~/server/utils/auth';
import prisma from '~~/server/db';

export default defineEventHandler(async (event) => {
  // Require authentication
  const session = await requireAuth(event);

  try {
    const form = await readMultipartFormData(event);

    if (!form || form.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No files uploaded'
      });
    }

    const results = [];

    for (const formItem of form) {
      if (formItem.name === 'file' && formItem.filename && formItem.data) {
        // Validate file type and size
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!allowedTypes.includes(formItem.type || '')) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'
          });
        }

        if (formItem.data.length > maxSize) {
          throw createError({
            statusCode: 400,
            statusMessage: 'File too large. Maximum size is 10MB.'
          });
        }

        // For now, we'll create a simple file storage solution
        // In production, this would use Cloudflare R2 or similar
        const fileExtension = formItem.filename.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
        const key = `uploads/${fileName}`;

        // Create a mock URL (in production, this would be the actual R2 URL)
        const url = `/api/media/${key}`;

        // Save media record to database
        const mediaRecord = await prisma.media.create({
          data: {
            key,
            url,
            filename: formItem.filename,
            mimeType: formItem.type || 'application/octet-stream',
            size: formItem.data.length,
            // For images, we could extract dimensions here
            // width: undefined,
            // height: undefined,
            altText: formItem.filename,
            uploadedById: session.id
          }
        });

        // In a real implementation, you would save the file to R2 or local storage here
        // For now, we'll just return the media record

        results.push({
          ...mediaRecord,
          createdAt: mediaRecord.createdAt.toISOString(),
          updatedAt: mediaRecord.updatedAt.toISOString()
        });
      }
    }

    if (results.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No valid files found'
      });
    }

    return {
      success: true,
      data: results.length === 1 ? results[0] : results,
      message: `${results.length} file(s) uploaded successfully`
    };
  } catch (error: any) {
    console.error('Media upload error:', error);

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to upload media'
    });
  }
});