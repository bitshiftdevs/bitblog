import { CreateCategorySchema } from "~~/shared/schemas";
import prisma from "~~/server/db";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  try {
    const body = await readBody(event);
    const validatedData = CreateCategorySchema.parse(body);

    // Check if a category with this slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: validatedData.slug },
    });

    if (existingCategory) {
      throw createError({
        statusCode: 400,
        statusMessage: "A category with this slug already exists",
      });
    }

    // If parentId is provided, verify it exists
    if (validatedData.parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: validatedData.parentId },
      });

      if (!parentCategory) {
        throw createError({
          statusCode: 400,
          statusMessage: "Parent category not found",
        });
      }
    }

    const category = await prisma.category.create({
      data: {
        id: validatedData.slug,
        name: validatedData.name,
        description: validatedData.description,
        parentId: validatedData.parentId,
      },
      include: {
        parent: { select: { id: true, name: true } },
        children: { select: { id: true, name: true } },
      },
    });

    return {
      success: true,
      data: {
        id: category.id,
        name: category.name,
        description: category.description,
        parentId: category.parentId,
        parent: category.parent,
        children: category.children,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      },
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    if (error.name === "ZodError") {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid category data",
        data: { message: "Validation failed", errors: error.errors },
      });
    }

    if (error.code === "P2002") {
      throw createError({
        statusCode: 400,
        statusMessage: "A category with this slug already exists",
      });
    }

    console.error("Error creating category:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create category",
    });
  }
});
