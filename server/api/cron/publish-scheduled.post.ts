import prisma from "~~/server/db";

/**
 * Publishes any post whose status=scheduled and scheduledAt<=now.
 * Protect via CRON_SECRET runtime config, sent as `x-cron-secret` header.
 * Point Vercel/Cloudflare cron at POST /api/cron/publish-scheduled every minute.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const provided = getRequestHeader(event, "x-cron-secret");
  const expected = (config as any).cronSecret;

  if (!expected || provided !== expected) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const now = new Date();
  const due = await prisma.post.findMany({
    where: {
      status: "scheduled",
      scheduledAt: { lte: now },
    },
    select: { id: true },
  });

  if (due.length === 0) {
    return { success: true, published: 0 };
  }

  const result = await prisma.post.updateMany({
    where: { id: { in: due.map((p) => p.id) } },
    data: { status: "published", publishedAt: now },
  });

  return { success: true, published: result.count };
});
