import { CreatePostSchema } from '~~/shared/schemas';
import { requireAuth } from '~~/server/utils/auth';
import prisma from '~~/server/db';

export default defineEventHandler(async (event) => {
  // Require authentication
  const session = await requireAuth(event);

  try {
    // Parse request body
    const body = await readBody(event);

    // Handle new categories and tags creation
    const newCategoryIds = [];
    const newTagIds = [];

    if (body.newCategoryNames && body.newCategoryNames.length > 0) {
      for (const categoryName of body.newCategoryNames) {
        const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        try {
          await prisma.category.create({
            data: {
              id: categoryId,
              name: categoryName
            }
          });
          newCategoryIds.push(categoryId);
        } catch (error: any) {
          // Category might already exist, try to find it
          if (error.code === 'P2002') {
            const existing = await prisma.category.findUnique({ where: { id: categoryId } });
            if (existing) newCategoryIds.push(categoryId);
          }
        }
      }
    }

    if (body.newTagNames && body.newTagNames.length > 0) {
      for (const tagName of body.newTagNames) {
        const tagId = tagName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        try {
          await prisma.tag.create({
            data: {
              id: tagId,
              name: tagName
            }
          });
          newTagIds.push(tagId);
        } catch (error: any) {
          // Tag might already exist, try to find it
          if (error.code === 'P2002') {
            const existing = await prisma.tag.findUnique({ where: { id: tagId } });
            if (existing) newTagIds.push(tagId);
          }
        }
      }
    }

    // Combine existing and new IDs
    const allCategoryIds = [...(body.categoryIds || []), ...newCategoryIds];
    const allTagIds = [...(body.tagIds || []), ...newTagIds];

    // Create updated body with all IDs
    const updatedBody = {
      ...body,
      categoryIds: allCategoryIds,
      tagIds: allTagIds
    };

    const validatedData = CreatePostSchema.parse(updatedBody);

    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug: validatedData.slug }
    });

    if (existingPost) {
      throw createError({
        statusCode: 400,
        statusMessage: 'A post with this slug already exists'
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
        authorId: session.id,
        scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : null,
        publishedAt: validatedData.status === 'PUBLISHED' ? new Date() : null,
        // Connect co-authors if provided
        ...(validatedData.coAuthorIds && validatedData.coAuthorIds.length > 0 && {
          coAuthors: {
            connect: validatedData.coAuthorIds.map(id => ({ id }))
          }
        }),
        // Connect categories if provided
        ...(validatedData.categoryIds && validatedData.categoryIds.length > 0 && {
          categories: {
            connect: validatedData.categoryIds.map(id => ({ id }))
          }
        }),
        // Connect tags if provided
        ...(validatedData.tagIds && validatedData.tagIds.length > 0 && {
          tags: {
            connect: validatedData.tagIds.map(id => ({ id }))
          }
        })
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        coAuthors: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        categories: true,
        tags: true
      }
    });

    return {
      success: true,
      data: {
        ...newPost,
        createdAt: newPost.createdAt.toISOString(),
        updatedAt: newPost.updatedAt.toISOString(),
        publishedAt: newPost.publishedAt?.toISOString(),
        scheduledAt: newPost.scheduledAt?.toISOString()
      }
    };
  } catch (error: any) {
    console.error('Post creation error:', error);

    // Handle validation errors
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid post data',
        data: {
          message: 'Validation failed',
          errors: error.errors
        }
      });
    }

    // Handle Prisma errors
    if (error.code === 'P2002') {
      throw createError({
        statusCode: 400,
        statusMessage: 'A post with this slug already exists'
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create post'
    });
  }
});