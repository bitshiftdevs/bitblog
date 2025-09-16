// apps/api/server/api/search.get.ts
import { z } from "zod";
import {
  createPaginationOptions,
  createPaginationResult,
  createSearchFilter,
} from "~~/lib/utils/database";
import { SearchSchema } from "~~/lib/schemas";
import prisma from "../db";

export default defineEventHandler(async (event) => {
  try {
    const query = await getValidatedQuery(event, SearchSchema.parse);
    const { query: searchQuery, type, filters, ...paginationOptions } = query;
    const { page, limit } = createPaginationOptions(paginationOptions);

    let results = [];
    let total = 0;

    if (type === "posts" || type === "all") {
      // Build where clause for posts
      const where: any = {
        status: "PUBLISHED",
        visibility: "PUBLIC",
      };

      // Apply filters
      if (filters?.status) where.status = filters.status;
      if (filters?.authorId) where.authorId = filters.authorId;
      if (filters?.tagId) {
        where.tags = { some: { tagId: filters.tagId } };
      }
      if (filters?.categoryId) {
        where.categories = { some: { categoryId: filters.categoryId } };
      }
      if (filters?.fromDate || filters?.toDate) {
        where.publishedAt = {};
        if (filters.fromDate)
          where.publishedAt.gte = new Date(filters.fromDate);
        if (filters.toDate) where.publishedAt.lte = new Date(filters.toDate);
      }

      // Add search filter
      const searchFilter = createSearchFilter(searchQuery, [
        "title",
        "excerpt",
      ]);
      if (searchFilter.OR) {
        where.OR = searchFilter.OR;
      }

      // Get posts
      const [posts, postsTotal] = await Promise.all([
        prisma.post.findMany({
          where,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
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
                  },
                },
              },
            },
          },
          orderBy: {
            publishedAt: "desc",
          },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.post.count({ where }),
      ]);

      results = posts.map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        featuredImage: post.featuredImage,
        readingTime: post.readingTime,
        viewCount: post.viewCount,
        publishedAt: post.publishedAt?.toISOString(),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        author: post.author,
        tags: post.tags,
        categories: post.categories,
      }));

      total = postsTotal;
    }

    const result = createPaginationResult(results, total, { page, limit });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Search error:", error);

    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid search parameters",
        data: error.errors,
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Search failed",
    });
  }
});
