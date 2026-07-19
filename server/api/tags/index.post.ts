import { CreateTagSchema } from "~~/shared/schemas";
import prisma from "~~/server/db";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  try {
    const body = await readBody(event);
    const validatedData = CreateTagSchema.parse(body);

    // Check if a tag with this slug already exists
    const existingTag = await prisma.tag.findUnique({
      where: { id: validatedData.slug },
    });

    if (existingTag) {
      throw createError({
        statusCode: 400,
        statusMessage: "A tag with this slug already exists",
      });
    }

    const tag = await prisma.tag.create({
      data: {
        id: validatedData.slug,
        name: validatedData.name,
        description: validatedData.description,
        color: validatedData.color,
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

    console.error("Error creating tag:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create tag",
    });
  }
});
