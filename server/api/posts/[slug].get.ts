import prisma from "~~/server/db";

export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, "id");

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: "Slug parameter is required",
      });
    }

    // Get post by slug
    const post = await prisma.post.findUnique({
      where: {
        slug,
        AND: [{ status: "PUBLISHED" }, { visibility: "PUBLIC" }],
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            bio: true,
          },
        },
        coAuthors: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            bio: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
                description: true,
              },
            },
          },
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
              },
            },
          },
        },
        comments: {
          where: {
            status: "APPROVED",
            parentId: null, // Only top-level comments
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
            replies: {
              where: {
                status: "APPROVED",
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
              orderBy: {
                createdAt: "asc",
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            comments: {
              where: {
                status: "APPROVED",
              },
            },
          },
        },
      },
    });

    if (!post) {
      throw createError({
        statusCode: 404,
        statusMessage: "Post not found",
      });
    }

    // Increment view count
    await prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    // Get related posts
    const relatedPosts = await prisma.post.findMany({
      where: {
        AND: [
          { id: { not: post.id } },
          { status: "PUBLISHED" },
          { visibility: "PUBLIC" },
          {
            OR: [
              // Posts with same tags
              {
                tags: {
                  some: {
                    tagId: {
                      in: post.tags.map((t) => t.tag.id),
                    },
                  },
                },
              },
              // Posts with same categories
              {
                categories: {
                  some: {
                    categoryId: {
                      in: post.categories.map((c) => c.category.id),
                    },
                  },
                },
              },
              // Posts by same author
              { authorId: post.authorId },
            ],
          },
        ],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        featuredImage: true,
        viewCount: true,
        readingTime: true,
        publishedAt: true,
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 3,
    });

    // Transform the response
    const transformedPost = {
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      status: post.status,
      visibility: post.visibility,
      featuredImage: post.featuredImage,
      canonicalUrl: post.canonicalUrl,
      readingTime: post.readingTime,
      viewCount: post.viewCount + 1, // Include the increment
      publishedAt: post.publishedAt?.toISOString(),
      scheduledAt: post.scheduledAt?.toISOString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      seoKeywords: post.seoKeywords,
      author: post.author,
      coAuthors: post.coAuthors,
      tags: post.tags,
      categories: post.categories,
      comments: post.comments.map((comment) => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        replies: comment.replies.map((reply) => ({
          ...reply,
          createdAt: reply.createdAt.toISOString(),
          updatedAt: reply.updatedAt.toISOString(),
        })),
      })),
      _count: post._count,
      relatedPosts: relatedPosts.map((relatedPost) => ({
        ...relatedPost,
        publishedAt: relatedPost.publishedAt?.toISOString(),
      })),
    };

    return {
      success: true,
      data: transformedPost,
    };
  } catch (error) {
    console.error("Error fetching post:", error);

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
