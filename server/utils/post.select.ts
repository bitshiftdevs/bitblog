import { PostInclude } from "~~/shared/generated/prisma/models";

export const user = { id: true, name: true, avatarUrl: true };
const userBio = {
  email: true,
  bio: true,
  ...user,
};

export const tag = { id: true, name: true, color: true, description: true };
export const category = { id: true, name: true, description: true };
export const postRelated = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  featuredImage: true,
  viewCount: true,
  readingTime: true,
  publishedAt: true,
  author: { select: user },
};
export const postEditInclude = {
  author: { select: userBio },
  coAuthors: { select: userBio },
  tags: { select: tag },
  categories: { select: category },
};
export const postInclude: PostInclude = {
  ...postEditInclude,
  comments: {
    where: {
      status: "approved",
      parentId: null, // Only top-level comments
    },
    include: {
      author: { select: user },
      replies: {
        where: { status: "approved" },
        include: { author: { select: user } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  },
  _count: {
    select: {
      comments: {
        where: {
          status: "approved",
        },
      },
    },
  },
};
