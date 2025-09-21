import prisma from "~~/server/db";
import { ApiResponse, PostResponse } from "~~/shared/types";

export default defineEventHandler(
  async (event): Promise<ApiResponse<PostResponse>> => {
    try {
      const slug = getRouterParam(event, "id");
      const post = await prisma.post.update({
        where: {
          slug,
          AND: [{ status: "PUBLISHED" }],
        },
        data: { viewCount: { increment: 1 } },
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
            select: { id: true, name: true, color: true, description: true },
          },
          categories: { select: { id: true, name: true, description: true } },
          comments: {
            where: {
              status: "APPROVED",
              parentId: null, // Only top-level comments
            },
            include: {
              author: { select: { id: true, name: true, avatarUrl: true } },
              replies: {
                where: { status: "APPROVED" },
                include: {
                  author: { select: { id: true, name: true, avatarUrl: true } },
                },
                orderBy: { createdAt: "asc" },
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

      const relatedPosts = await prisma.post.findMany({
        where: {
          AND: [
            { id: { not: post.id } },
            { status: "PUBLISHED" },
            { visibility: "PUBLIC" },
            {
              OR: [
                { tags: { some: { id: { in: post.tags.map((t) => t.id) } } } },
                {
                  categories: {
                    some: { id: { in: post.categories.map((c) => c.id) } },
                  },
                },
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

      return {
        success: true,
        data: { ...post, relatedPosts } as unknown as PostResponse,
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
  },
);
