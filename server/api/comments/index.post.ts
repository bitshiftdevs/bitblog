import { CreateCommentSchema } from "~~/shared/schemas";
import { requireAuth } from "~~/server/utils/auth";
import prisma from "~~/server/db";

export default defineEventHandler(async (event) => {
  try {
    // Validate request body
    const validatedData = await readValidatedBody(
      event,
      CreateCommentSchema.parse,
    );

    // Check if user is authenticated (for user comments) or if guest info is provided
    let authorId: string | undefined;
    let guestName: string | undefined;
    let guestEmail: string | undefined;

    try {
      const user = await requireAuth(event);
      authorId = user.id;
    } catch {
      // Not authenticated, check for guest info
      if (!validatedData.guestName || !validatedData.guestEmail) {
        throw createError({
          statusCode: 400,
          statusMessage:
            "Guest name and email are required for non-authenticated users",
        });
      }
      guestName = validatedData.guestName;
      guestEmail = validatedData.guestEmail;
    }

    // Verify the post exists and comments are enabled
    const post = await prisma.post.findUnique({
      where: { id: validatedData.postId },
      select: { id: true, commentEnabled: true, title: true },
    });

    if (!post) {
      throw createError({
        statusCode: 404,
        statusMessage: "Post not found",
      });
    }

    if (!post.commentEnabled) {
      throw createError({
        statusCode: 400,
        statusMessage: "Comments are disabled for this post",
      });
    }

    // If replying to a comment, verify the parent exists
    if (validatedData.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: validatedData.parentId },
        select: { id: true, postId: true },
      });

      if (!parentComment) {
        throw createError({
          statusCode: 404,
          statusMessage: "Parent comment not found",
        });
      }

      if (parentComment.postId !== validatedData.postId) {
        throw createError({
          statusCode: 400,
          statusMessage: "Parent comment is not from the same post",
        });
      }
    }

    // Basic content sanitization (remove script tags and other dangerous content)
    const sanitizedContent = validatedData.content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "");

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content: sanitizedContent,
        postId: validatedData.postId,
        parentId: validatedData.parentId,
        authorId,
        guestName,
        guestEmail,
        status: "pending", // All comments start as pending for moderation
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return {
      success: true,
      data: comment,
      message: "Comment submitted successfully and is awaiting moderation",
    };
  } catch (error: any) {
    console.error("Comment creation error:", error);

    if (error.name === "ZodError") {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid comment data",
        data: {
          message: "Validation failed",
          errors: error.errors,
        },
      });
    }

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Failed to create comment",
    });
  }
});

