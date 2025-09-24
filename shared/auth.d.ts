declare module "#auth-utils" {
  interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
    isActive: boolean;
    twoFactorEnabled: boolean;
    lastSeenAt?: string;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    isAdmin: boolean;
  }

  interface UserSession {
    // Add your own fields
  }

  interface SecureSessionData {
    // Add your own fields
  }
}

export {};
