import prisma from "~~/server/db";
import {
  postEditInclude,
  postInclude,
  postRelated,
} from "~~/server/utils/post.select";
import { ApiResponse, PostResponse } from "~~/shared/types";

export default defineEventHandler(
  async (event): Promise<ApiResponse<PostResponse>> => {
    try {
      const slug = getRouterParam(event, "id");
      const { isEditing } = getQuery(event);
      const post = await prisma.post.update({
        where: {
          slug,
          ...(!isEditing && { status: "PUBLISHED" }),
        },
        data: { ...(!isEditing && { viewCount: { increment: 1 } }) },
        include: isEditing ? postEditInclude : postInclude,
      });

      if (!post) {
        throw createError({
          statusCode: 404,
          statusMessage: "Post not found",
        });
      }

      const relatedPosts =
        !isEditing &&
        (await prisma.post.findMany({
          where: {
            AND: [
              { id: { not: post.id } },
              { status: "PUBLISHED" },
              { visibility: "PUBLIC" },
              {
                OR: [
                  {
                    tags: { some: { id: { in: post.tags.map((t) => t.id) } } },
                  },
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
          select: postRelated,
          orderBy: { publishedAt: "desc" },
          take: 3,
        }));

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
