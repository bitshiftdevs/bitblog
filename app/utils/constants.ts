export const USER_ROLES = {
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  AUTHOR: 'Author',
  REVIEWER: 'Reviewer',
} as const;

export const PERMISSIONS = {
  // Posts
  POSTS_READ: 'posts.read',
  POSTS_WRITE: 'posts.write',
  POSTS_PUBLISH: 'posts.publish',
  POSTS_DELETE: 'posts.delete',

  // Users
  USERS_READ: 'users.read',
  USERS_WRITE: 'users.write',
  USERS_DELETE: 'users.delete',
  USERS_MANAGE: 'users.manage',

  // Media
  MEDIA_READ: 'media.read',
  MEDIA_WRITE: 'media.write',
  MEDIA_DELETE: 'media.delete',

  // Comments
  COMMENTS_READ: 'comments.read',
  COMMENTS_WRITE: 'comments.write',
  COMMENTS_DELETE: 'comments.delete',
  COMMENTS_MODERATE: 'comments.moderate',

  // Settings
  SETTINGS_READ: 'settings.read',
  SETTINGS_WRITE: 'settings.write',

  // Analytics
  ANALYTICS_READ: 'analytics.read',

  // Admin (super permission)
  ADMIN: 'admin',
} as const;

export const POST_STATUS = {
  draft: 'draft',
  scheduled: 'scheduled',
  published: 'published',
  archived: 'archived',
} as const;

export const POST_VISIBILITY = {
  public: 'public',
  PRIVATE: 'PRIVATE',
  UNLISTED: 'UNLISTED',
} as const;

export const COMMENT_STATUS = {
  PENDING: 'PENDING',
  approved: 'approved',
  rejected: 'rejected',
  SPAM: 'SPAM',
} as const;
