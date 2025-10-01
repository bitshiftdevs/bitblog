import { CreatePostSchema } from "~~/shared/schemas";
import prisma from "~~/server/db";

export default defineEventHandler(async (event) => {
  // Require authentication
  const user = await requireAdmin(event);

  try {
    // Parse request body
    const body = await readBody(event);

    console.log(body);
    const validatedData = CreatePostSchema.parse(body);

    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingPost) {
      throw createError({
        statusCode: 400,
        statusMessage: "A post with this slug already exists",
      });
    }

    // Create the post
    const newPost = await prisma.post.create({
      data: {
        title: validatedData.title,
        slug: validatedData.slug,
        excerpt: validatedData.excerpt,
        content: validatedData.content,
        status: validatedData.status,
        visibility: validatedData.visibility,
        featuredImage: validatedData.featuredImage,
        canonicalUrl: validatedData.canonicalUrl,
        seoTitle: validatedData.seoTitle,
        seoDescription: validatedData.seoDescription,
        seoKeywords: validatedData.seoKeywords,
        authorId: user.id,
        scheduledAt: validatedData.scheduledAt
          ? new Date(validatedData.scheduledAt)
          : null,
        publishedAt: validatedData.status === "published" ? new Date() : null,
        // Connect co-authors if provided
        ...(validatedData.coAuthorIds &&
          validatedData.coAuthorIds.length > 0 && {
            coAuthors: {
              connect: validatedData.coAuthorIds.map((id) => ({ id })),
            },
          }),
        // Connect categories if provided
        ...(validatedData.categoryIds &&
          validatedData.categoryIds.length > 0 && {
            categories: {
              connect: validatedData.categoryIds.map((id) => ({ id })),
            },
          }),
        // Connect tags if provided
        ...(validatedData.tagIds &&
          validatedData.tagIds.length > 0 && {
            tags: {
              connect: validatedData.tagIds.map((id) => ({ id })),
            },
          }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        coAuthors: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        categories: true,
        tags: true,
      },
    });

    return {
      success: true,
      data: {
        ...newPost,
        createdAt: newPost.createdAt.toISOString(),
        updatedAt: newPost.updatedAt.toISOString(),
        publishedAt: newPost.publishedAt?.toISOString(),
        scheduledAt: newPost.scheduledAt?.toISOString(),
      },
    };
  } catch (error: any) {
    console.error("Post creation error:", error);

    // Handle validation errors
    if (error.name === "ZodError") {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid post data",
        data: {
          message: "Validation failed",
          errors: error.errors,
        },
      });
    }

    // Handle Prisma errors
    if (error.code === "P2002") {
      throw createError({
        statusCode: 400,
        statusMessage: "A post with this slug already exists",
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create post",
    });
  }
});

