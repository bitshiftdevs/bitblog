import prisma from "~~/server/db";

export default defineOAuthGitHubEventHandler({
  async onSuccess(event, { user, tokens }) {
    try {
      // Check if user already exists by email
      let dbUser = await prisma.user.upsert({
        where: { email: user.email! },
        omit: { createdAt: true, updatedAt: true },
        create: {
          name: user.name || user.login || "GitHub User",
          email: user.email!,
          avatarUrl: user.avatar_url,
          bio: user.bio,
          emailVerified: true, // GitHub emails are verified
          isActive: true,
          isAdmin: false,
        },
        update: {
          emailVerified: true,
        },
      });

      // Set full user session
      await setUserSession(event, {
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
      });

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
