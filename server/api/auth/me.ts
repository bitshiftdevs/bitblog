import prisma from "~~/server/db";

export default defineEventHandler(async (event) => {
  switch (event.method) {
    case "GET":
      const payload = await verifyJWT(event);
      const user = await prisma.user.findUnique({
        where: { id: payload?.sub },
      });
      return {
        success: true,
        data: user,
      };
    default:
      break;
  }
});
