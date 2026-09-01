import { z } from "zod";
import {
  createPaginationOptions,
  createPaginationResult,
} from "~~/server/utils/database";
import { PaginationSchema } from "~~/shared/schemas";
import prisma from "../db";

const QuerySchema = PaginationSchema.extend({
  q: z.string().min(1).max(100),
  type: z.enum(["posts", "all"]).default("posts"),
});

export default defineEventHandler(async (event) => {
  try {
    const query = await getValidatedQuery(event, QuerySchema.parse);
    const { q: searchQuery, type, ...paginationOptions } = query;
    const { page, limit } = createPaginationOptions(paginationOptions);

    let results: any[] = [];
    let total = 0;

    if (type === "posts" || type === "all") {
      // Resolve matching IDs via tsvector full-text search
      const isShortQuery = searchQuery.length < 6;
      let ids: string[] = [];

      if (isShortQuery) {
        // For short queries, tsvector dictionary won't match — use ILIKE fallback
        const pattern = `%${searchQuery}%`;
        const matchingIds = await prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM posts
          WHERE (
            title ILIKE ${pattern}
            OR excerpt ILIKE ${pattern}
            OR content ILIKE ${pattern}
          )
            AND status = 'published'
            AND visibility = 'public'
        `;
        ids = matchingIds.map((r) => r.id);
      } else {
        const tsRows = await prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM posts
          WHERE search_vector @@ plainto_tsquery('english', ${searchQuery})
            AND status = 'published'
            AND visibility = 'public'
        `;

        if (tsRows.length > 0) {
          ids = tsRows.map((r) => r.id);
        } else {
          // tsvector returned nothing — fall back to ILIKE
          const pattern = `%${searchQuery}%`;
          const ilikeRows = await prisma.$queryRaw<{ id: string }[]>`
            SELECT id FROM posts
            WHERE (
              title ILIKE ${pattern}
              OR excerpt ILIKE ${pattern}
              OR content ILIKE ${pattern}
            )
              AND status = 'published'
              AND visibility = 'public'
          `;
          ids = ilikeRows.map((r) => r.id);
        }
      }

      const where: any = {
        id: { in: ids },
        status: "published",
        visibility: "public",
      };

      const [posts, postsTotal] = await Promise.all([
        prisma.post.findMany({
          where,
          select: {
            id: true,
            slug: true,
            title: true,
            excerpt: true,
            featuredImage: true,
            readingTime: true,
            viewCount: true,
            publishedAt: true,
            createdAt: true,
            updatedAt: true,
            author: {
              select: { id: true, name: true, avatarUrl: true },
            },
            tags: { select: { id: true, name: true, color: true } },
            categories: { select: { id: true, name: true } },
          },
          orderBy: { publishedAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.post.count({ where }),
      ]);

      results = posts.map((post) => ({
        ...post,
        publishedAt: post.publishedAt?.toISOString(),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      }));

      total = postsTotal;
    }

    const result = createPaginationResult(results, total, { page, limit });

    return { success: true, data: result };
  } catch (error) {
    console.error("Search error:", error);

    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid search parameters",
        data: error.errors,
      });
    }

    throw createError({ statusCode: 500, statusMessage: "Search failed" });
  }
});
