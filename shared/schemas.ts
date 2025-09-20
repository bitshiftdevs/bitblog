import { z } from "zod";

// Base schemas
export const PostStatusSchema = z.enum([
  "DRAFT",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
]);
export const PostVisibilitySchema = z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]);
export const CommentStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SPAM",
]);
export const InvitationStatusSchema = z.enum([
  "PENDING",
  "ACCEPTED",
  "EXPIRED",
  "REVOKED",
]);

// Pagination and sorting
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const SortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const ListParamsSchema = PaginationSchema.merge(SortSchema).extend({
  search: z.string().optional(),
});

// Auth schemas
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.boolean().optional(),
});
export type LoginType = z.output<typeof LoginSchema>;

export const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  token: z.string().optional(), // Invitation token
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8).max(128),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).max(128),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
});

// User and role schemas
export const CreateUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  roleIds: z.array(z.string().uuid()).min(1),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
  roleIds: z.array(z.string().uuid()).optional(),
});

export const CreateRoleSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(200).optional(),
  permissions: z.record(z.array(z.string())),
});

export const UpdateRoleSchema = CreateRoleSchema.partial();

// Post schemas
export const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/),
  excerpt: z.string().max(500).optional(),
  content: z.any(), // TipTap JSON content
  status: PostStatusSchema.default("DRAFT"),
  visibility: PostVisibilitySchema.default("PUBLIC"),
  featuredImage: z.string().url().optional(),
  canonicalUrl: z.string().url().optional(),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  seoKeywords: z.string().max(200).optional(),
  coAuthorIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  scheduledAt: z.string().datetime().optional(),
});

export const UpdatePostSchema = CreatePostSchema.partial().extend({
  id: z.string().uuid(),
});

export const PostFiltersSchema = z.object({
  status: PostStatusSchema.optional(),
  visibility: PostVisibilitySchema.optional(),
  authorId: z.string().uuid().optional(),
  tagId: z.string().optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

// Tag and category schemas
export const CreateTagSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(200).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
});

export const UpdateTagSchema = CreateTagSchema.partial().extend({
  id: z.string().uuid(),
});

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(50),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(200).optional(),
  parentId: z.string().uuid().optional(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial().extend({
  id: z.string().uuid(),
});

// Media schemas
export const UploadSignedUrlSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string(),
  size: z
    .number()
    .int()
    .min(1)
    .max(50 * 1024 * 1024), // 50MB max
});

export const CreateMediaSchema = z.object({
  key: z.string(),
  filename: z.string().min(1).max(255),
  mimeType: z.string(),
  size: z.number().int().min(1),
  width: z.number().int().min(1).optional(),
  height: z.number().int().min(1).optional(),
  altText: z.string().max(200).optional(),
  caption: z.string().max(500).optional(),
});

export const UpdateMediaSchema = z.object({
  altText: z.string().max(200).optional(),
  caption: z.string().max(500).optional(),
});

// Comment schemas
export const CreateCommentSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().min(1).max(2000),
  parentId: z.string().uuid().optional(),
  // For guest comments
  guestName: z.string().min(1).max(100).optional(),
  guestEmail: z.string().email().optional(),
});

export const UpdateCommentSchema = z.object({
  content: z.string().min(1).max(2000).optional(),
  status: CommentStatusSchema.optional(),
});

// Invitation schemas
export const CreateInvitationSchema = z.object({
  email: z.string().email(),
  roleIds: z.array(z.string().uuid()).min(1),
  expiresAt: z.string().datetime().optional(),
});

// Site settings schemas
export const UpdateSiteSettingsSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  logo: z.string().url().optional(),
  favicon: z.string().url().optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  socialLinks: z
    .object({
      twitter: z.string().url().optional(),
      facebook: z.string().url().optional(),
      instagram: z.string().url().optional(),
      linkedin: z.string().url().optional(),
      github: z.string().url().optional(),
    })
    .optional(),
  seoSettings: z
    .object({
      defaultTitle: z.string().max(60).optional(),
      defaultDescription: z.string().max(160).optional(),
      defaultImage: z.string().url().optional(),
    })
    .optional(),
  analyticsSettings: z
    .object({
      googleAnalyticsId: z.string().optional(),
      facebookPixelId: z.string().optional(),
    })
    .optional(),
  emailSettings: z
    .object({
      fromName: z.string().optional(),
      fromEmail: z.string().email().optional(),
      replyTo: z.string().email().optional(),
    })
    .optional(),
  commentSettings: z
    .object({
      enabled: z.boolean().default(true),
      requireApproval: z.boolean().default(true),
      allowGuestComments: z.boolean().default(true),
      enableNotifications: z.boolean().default(true),
    })
    .optional(),
});

// Search schemas
export const SearchSchema = z
  .object({
    query: z.string().min(1).max(100),
    type: z
      .enum(["posts", "users", "tags", "categories", "all"])
      .default("posts"),
    filters: z
      .object({
        status: PostStatusSchema.optional(),
        authorId: z.string().uuid().optional(),
        tagId: z.string().uuid().optional(),
        categoryId: z.string().uuid().optional(),
        fromDate: z.string().datetime().optional(),
        toDate: z.string().datetime().optional(),
      })
      .optional(),
  })
  .merge(PaginationSchema);

// Bulk operations schemas
export const BulkPostActionSchema = z.object({
  postIds: z.array(z.string().uuid()).min(1),
  action: z.enum(["publish", "unpublish", "archive", "delete", "duplicate"]),
  data: z
    .object({
      status: PostStatusSchema.optional(),
      categoryIds: z.array(z.string().uuid()).optional(),
      tagIds: z.array(z.string().uuid()).optional(),
    })
    .optional(),
});

// Export all schemas as a single object for easy importing
export const schemas = {
  // Auth
  LoginSchema,
  RegisterSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
  UpdateProfileSchema,

  // Users and roles
  CreateUserSchema,
  UpdateUserSchema,
  CreateRoleSchema,
  UpdateRoleSchema,

  // Posts
  CreatePostSchema,
  UpdatePostSchema,
  PostFiltersSchema,
  BulkPostActionSchema,

  // Tags and categories
  CreateTagSchema,
  UpdateTagSchema,
  CreateCategorySchema,
  UpdateCategorySchema,

  // Media
  UploadSignedUrlSchema,
  CreateMediaSchema,
  UpdateMediaSchema,

  // Comments
  CreateCommentSchema,
  UpdateCommentSchema,

  // Invitations
  CreateInvitationSchema,

  // Settings
  UpdateSiteSettingsSchema,

  // Search
  SearchSchema,

  // Common
  PaginationSchema,
  SortSchema,
  ListParamsSchema,
};
