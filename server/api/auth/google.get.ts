import prisma from "~~/server/db";

export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user }) {
    try {
      // Check if user already exists by email
      let dbUser = await prisma.user.upsert({
        where: { email: user.email! },
        omit: { createdAt: true, updatedAt: true },
        create: {
          name: user.name || "Google User",
          email: user.email!,
          avatarUrl: user.picture,
          bio: user.bio,
          emailVerified: true,
          isActive: true,
          isAdmin: false,
        },
        update: {
          name: user.name || "Google User",
          avatarUrl: user.picture,
          emailVerified: true,
        },
      });

      // Set full user session
      await setUserSession(
        event,
        {
          user: {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            avatarUrl: dbUser.avatarUrl,
            bio: dbUser.bio,
            isActive: dbUser.isActive,
            twoFactorEnabled: dbUser.twoFactorEnabled,
            emailVerified: dbUser.emailVerified,
            isAdmin: dbUser.isAdmin,
          },
        },
        { maxAge: 604800 }, // 1 week
      );

      return sendRedirect(event, "/");
    } catch (error) {
      console.error("GitHub OAuth success handler error:", error);
      return sendRedirect(event, "/auth?error=oauth_error");
    }
  },
  onError(event, error) {
    console.error("GitHub OAuth error:", error);
    return sendRedirect(event, "/auth?error=oauth_failed");
  },
});
