import {
  uploadToR2,
  generateMediaKey,
  validateFileType,
  validateFileSize,
  getFileTypeFromMime,
} from "~~/server/utils/r2";
import prisma from "~~/server/db";

export default defineEventHandler(async (event) => {
  // Require authentication
  const user = await requireAdmin(event);

  try {
    const form = await readMultipartFormData(event);

    if (!form || form.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "No files uploaded",
      });
    }

    const results = [];

    for (const formItem of form) {
      if (formItem.name === "file" && formItem.filename && formItem.data) {
        const mimeType = formItem.type || "application/octet-stream";
        const fileSize = formItem.data.length;
        const fileType = getFileTypeFromMime(mimeType);

        // Validate file type
        if (!validateFileType(mimeType)) {
          throw createError({
            statusCode: 400,
            statusMessage: `Invalid file type: ${mimeType}. Only images, videos, audio, and documents are allowed.`,
          });
        }

        // Validate file size
        if (!validateFileSize(fileSize, fileType)) {
          throw createError({
            statusCode: 400,
            statusMessage: `File too large for type ${fileType}. Please check the size limits.`,
          });
        }

        // Generate unique key for R2
        const key = generateMediaKey(formItem.filename, user.id);

        try {
          const url = await uploadToR2(
            key,
            Buffer.from(formItem.data),
            mimeType,
          );

          // Extract image dimensions if it's an image
          let width: number | undefined;
          let height: number | undefined;

          if (fileType === "image") {
            // TODO: Extract image dimensions using sharp or similar library
            // For now, we'll leave them undefined
          }

          // Save media record to database
          const mediaRecord = await prisma.media.create({
            data: {
              key,
              url,
              filename: formItem.filename,
              mimeType,
              size: fileSize,
              altText: formItem.filename.replace(/\.[^/.]+$/, ""), // Remove file extension for alt text
            },
          });

          results.push({
            ...mediaRecord,
            createdAt: mediaRecord.createdAt.toISOString(),
            updatedAt: mediaRecord.updatedAt.toISOString(),
          });
        } catch (uploadError: any) {
          console.error("R2 upload error:", uploadError);
          throw createError({
            statusCode: 500,
            statusMessage: "Failed to upload file to storage",
          });
        }
      }
    }

    if (results.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "No valid files found",
      });
    }

    return {
      success: true,
      data: results.length === 1 ? results[0] : results,
      message: `${results.length} file(s) uploaded successfully`,
    };
  } catch (error: any) {
    console.error("Media upload error:", error);

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Failed to upload media",
    });
  }
});
