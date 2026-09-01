import prisma from "~~/server/db";

export default defineEventHandler(async (event) => {
  // Get categories
  const [categories, tags] = await prisma.$transaction([
    prisma.category.findMany({
      select: { id: true, name: true },
    }),
    prisma.tag.findMany({
      select: { id: true, name: true },
    }),
  ]);

  return {
    success: true,
    data: { categories, tags },
  };
});
