import { jwtVerify } from "jose";

export async function verifyJWT(event: any) {
  const config = useRuntimeConfig();
  const authHeader = getHeader(event, "authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const jwtSecret = new TextEncoder().encode(config.jwtSecret);
    const { payload } = await jwtVerify(token, jwtSecret);

    return payload as {
      sub: string;
      email: string;
      name: string;
      isAdmin: boolean;
    };
  } catch (error) {
    console.error("JWT verification failed:", error);
    throw createError({
      statusCode: 403,
      statusMessage: "Unauthorized",
    });
  }
}

export function requireAuth(event: any) {
  return requireUserSession(event).then((user) => {
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Authentication required",
      });
    }
    return user;
  });
}

export function requireAdmin() {
  return async (event: any) => {
    const user = await requireAuth(event);

    if (!user.isAdmin) {
      throw createError({
        statusCode: 403,
        statusMessage: "Insufficient permissions",
      });
    }

    return user;
  };
}
