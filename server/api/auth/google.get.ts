import prisma from "~~/server/db";

export default defineOAuthGoogleEventHandler({
  config: {},
  async onSuccess(event, { user, tokens }) {
    try {
      // Check if user already exists by email
      let dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (!dbUser) {
        // Create new user
        dbUser = await prisma.user.create({
          data: {
            name: user.name || "Google User",
            email: user.email,
            avatarUrl: user.picture,
            emailVerified: user.email_verified || true, // Google emails are typically verified
            isActive: true,
            isAdmin: false,
          },
        });
      } else {
        // Update existing user with Google info if needed
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            avatarUrl: user.picture || dbUser.avatarUrl,
            emailVerified: true,
          },
        });
      }

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
          createdAt: dbUser.createdAt,
          updatedAt: dbUser.updatedAt,
          isAdmin: dbUser.isAdmin,
        },
      });

      return sendRedirect(event, "/");
    } catch (error) {
      console.error("Google OAuth success handler error:", error);
      return sendRedirect(event, "/auth/login?error=oauth_error");
    }
  },
  onError(event, error) {
    console.error("Google OAuth error:", error);
    return sendRedirect(event, "/auth/login?error=oauth_failed");
  },
});
