import { CreateCategorySchema } from "~~/shared/schemas";
import prisma from "~~/server/db";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  try {
    const id = getRouterParam(event, "id");
    const body = await readBody(event);

    // Validate with partial schema (all fields optional)
    const validatedData = CreateCategorySchema.partial().parse(body);

    // Check category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw createError({
        statusCode: 404,
        statusMessage: "Category not found",
      });
    }

    // If slug is being changed, check for conflicts
    if (validatedData.slug && validatedData.slug !== id) {
      const conflicting = await prisma.category.findUnique({
        where: { id: validatedData.slug },
      });

      if (conflicting) {
        throw createError({
          statusCode: 400,
          statusMessage: "A category with this slug already exists",
        });
      }
    }

    // If parentId is being set, verify it exists and isn't self-referencing
    if (validatedData.parentId !== undefined) {
      if (validatedData.parentId) {
        const targetId = validatedData.slug || id;
        if (validatedData.parentId === targetId) {
          throw createError({
            statusCode: 400,
            statusMessage: "A category cannot be its own parent",
          });
        }

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
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(validatedData.slug && validatedData.slug !== id && { id: validatedData.slug }),
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.parentId !== undefined && { parentId: validatedData.parentId || null }),
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

    console.error("Error updating category:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update category",
    });
  }
});
