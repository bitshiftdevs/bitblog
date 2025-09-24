import { UpdatePostSchema } from '~~/shared/schemas';
import { requireAuth } from '~~/server/utils/auth';
import prisma from '~~/server/db';

export default defineEventHandler(async (event) => {
  // Require authentication
  const session = await requireAuth(event);

  try {
    const postId = getRouterParam(event, 'id');

    if (!postId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Post ID is required'
      });
    }

    // Parse request body
    const body = await readBody(event);

    // Handle new categories and tags creation (similar to create endpoint)
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
      categoryIds: allCategoryIds.length > 0 ? allCategoryIds : undefined,
      tagIds: allTagIds.length > 0 ? allTagIds : undefined
    };

    const validatedData = UpdatePostSchema.parse({ ...updatedBody, id: postId });

    // Check if post exists and user has permission to edit
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: true,
        coAuthors: true
      }
    });

    if (!existingPost) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Post not found'
      });
    }

    // Check if user is author, co-author, or admin
    const canEdit = existingPost.authorId === session.id ||
                   existingPost.coAuthors.some(coAuthor => coAuthor.id === session.id) ||
                   session.isAdmin;

    if (!canEdit) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You do not have permission to edit this post'
      });
    }

    // Check slug uniqueness if slug is being changed
    if (validatedData.slug && validatedData.slug !== existingPost.slug) {
      const slugExists = await prisma.post.findUnique({
        where: { slug: validatedData.slug }
      });

      if (slugExists) {
        throw createError({
          statusCode: 400,
          statusMessage: 'A post with this slug already exists'
        });
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.slug !== undefined) updateData.slug = validatedData.slug;
    if (validatedData.excerpt !== undefined) updateData.excerpt = validatedData.excerpt;
    if (validatedData.content !== undefined) updateData.content = validatedData.content;
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status;
      // Set publishedAt when publishing for the first time
      if (validatedData.status === 'PUBLISHED' && !existingPost.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    if (validatedData.visibility !== undefined) updateData.visibility = validatedData.visibility;
    if (validatedData.featuredImage !== undefined) updateData.featuredImage = validatedData.featuredImage;
    if (validatedData.canonicalUrl !== undefined) updateData.canonicalUrl = validatedData.canonicalUrl;
    if (validatedData.seoTitle !== undefined) updateData.seoTitle = validatedData.seoTitle;
    if (validatedData.seoDescription !== undefined) updateData.seoDescription = validatedData.seoDescription;
    if (validatedData.seoKeywords !== undefined) updateData.seoKeywords = validatedData.seoKeywords;
    if (validatedData.scheduledAt !== undefined) {
      updateData.scheduledAt = validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : null;
    }

    // Handle co-authors update
    if (validatedData.coAuthorIds !== undefined) {
      updateData.coAuthors = {
        set: validatedData.coAuthorIds.map(id => ({ id }))
      };
    }

    // Handle categories update
    if (validatedData.categoryIds !== undefined) {
      updateData.categories = {
        set: validatedData.categoryIds.map(id => ({ id }))
      };
    }

    // Handle tags update
    if (validatedData.tagIds !== undefined) {
      updateData.tags = {
        set: validatedData.tagIds.map(id => ({ id }))
      };
    }

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: updateData,
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
        ...updatedPost,
        createdAt: updatedPost.createdAt.toISOString(),
        updatedAt: updatedPost.updatedAt.toISOString(),
        publishedAt: updatedPost.publishedAt?.toISOString(),
        scheduledAt: updatedPost.scheduledAt?.toISOString()
      }
    };
  } catch (error: any) {
    console.error('Post update error:', error);

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
    if (error.code === 'P2025') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Post not found'
      });
    }

    if (error.code === 'P2002') {
      throw createError({
        statusCode: 400,
        statusMessage: 'A post with this slug already exists'
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update post'
    });
  }
});