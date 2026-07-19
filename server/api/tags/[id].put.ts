import { CreateTagSchema } from "~~/shared/schemas";
import prisma from "~~/server/db";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  try {
    const id = getRouterParam(event, "id");
    const body = await readBody(event);

    // Validate with partial schema (all fields optional)
    const validatedData = CreateTagSchema.partial().parse(body);

    // Check tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      throw createError({
        statusCode: 404,
        statusMessage: "Tag not found",
      });
    }

    // If slug is being changed, check for conflicts
    if (validatedData.slug && validatedData.slug !== id) {
      const conflicting = await prisma.tag.findUnique({
        where: { id: validatedData.slug },
      });

      if (conflicting) {
        throw createError({
          statusCode: 400,
          statusMessage: "A tag with this slug already exists",
        });
      }
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        ...(validatedData.slug && validatedData.slug !== id && { id: validatedData.slug }),
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.color !== undefined && { color: validatedData.color }),
      },
    });

    return {
      success: true,
      data: {
        id: tag.id,
        name: tag.name,
        description: tag.description,
        color: tag.color,
        createdAt: tag.createdAt.toISOString(),
        updatedAt: tag.updatedAt.toISOString(),
      },
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    if (error.name === "ZodError") {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid tag data",
        data: { message: "Validation failed", errors: error.errors },
      });
    }

    if (error.code === "P2002") {
      throw createError({
        statusCode: 400,
        statusMessage: "A tag with this slug already exists",
      });
    }

    console.error("Error updating tag:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update tag",
    });
  }
});
