import type { Editor, Range } from "@tiptap/vue-3";

export type PostStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
export type PostVisibility = "PUBLIC" | "PRIVATE" | "UNLISTED";
export type CommentStatus = "PENDING" | "APPROVED" | "REJECTED" | "SPAM";
export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";

export type TiptapCommandType = {
  editor: Editor;
  range: Range;
  props: any;
};
export type EditorView = "editor" | "preview" | "code";
export interface User {
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
  roles: UserRole[];
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Record<string, string[]>;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  role: Role;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content: any; // TipTap JSON
  status: PostStatus;
  visibility: PostVisibility;
  featuredImage?: string;
  canonicalUrl?: string;
  readingTime?: number;
  viewCount: number;
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  author: User;
  authorId: string;
  coAuthors: User[];
  tags: PostTagWithTag[];
  categories: PostCategoryWithCategory[];
  _count?: {
    comments: number;
  };
}

export interface PostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  status: PostStatus;
  visibility: PostVisibility;
  featuredImage?: string;
  readingTime?: number;
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  tags: PostTagWithTag[];
  categories: PostCategoryWithCategory[];
  _count?: {
    comments: number;
  };
}

export interface PostRevision {
  id: string;
  postId: string;
  content: any;
  title: string;
  excerpt?: string;
  note?: string;
  version: number;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    posts: number;
  };
}

export interface PostTagWithTag {
  id: string;
  tag: Tag;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  parent?: Category;
  children?: Category[];
  _count?: {
    posts: number;
  };
}

export interface PostCategoryWithCategory {
  id: string;
  category: Category;
}

export interface Media {
  id: string;
  key: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  altText?: string;
  caption?: string;
  uploadedById?: string;
  createdAt: string;
  updatedAt: string;
  uploadedBy?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  status: CommentStatus;
  authorId?: string;
  guestName?: string;
  guestEmail?: string;
  createdAt: string;
  updatedAt: string;
  parentId?: string;
  author?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  replies?: Comment[];
  _count?: {
    replies: number;
  };
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: string;
  lastUsedAt: string;
}

export interface AuditLog {
  id: string;
  entity: string;
  entityId: string;
  action: string;
  details?: any;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Invitation {
  id: string;
  email: string;
  token: string;
  roleIds: string[];
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  usedAt?: string;
  invitedById: string;
}

export interface SiteSettings {
  id?: string;
  key?: string;
  value?: any;
  updatedAt?: string;
  updatedById?: string;
  general?: {
    title?: string;
    description?: string;
    logo?: string;
    favicon?: string;
  };
  seo?: {
    defaultTitle?: string;
    defaultDescription?: string;
    defaultImage?: string;
  };
  social?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
  comments?: {
    enabled?: boolean;
    requireApproval?: boolean;
    allowGuestComments?: boolean;
    enableNotifications?: boolean;
  };
  analytics?: {
    googleAnalyticsId?: string;
    facebookPixelId?: string;
  };
  email?: {
    fromName?: string;
    fromEmail?: string;
    replyTo?: string;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ListResponse<T> extends ApiResponse<PaginatedResponse<T>> {}

// Search and filtering types
export interface PostFilters {
  status?: PostStatus;
  visibility?: PostVisibility;
  authorId?: string;
  tagId?: string;
  categoryId?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ListParams extends PaginationParams, SortParams {
  search?: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresAt: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  token?: string; // Invitation token
}

export interface AuthUser extends User {
  permissions: string[];
}

// Media upload types
export interface UploadSignedUrlRequest {
  filename: string;
  contentType: string;
  size: number;
}

export interface UploadSignedUrlResponse {
  uploadUrl: string;
  key: string;
  fields?: Record<string, string>;
}

// Editor types (TipTap content structure)
export interface EditorContent {
  type: string;
  attrs?: Record<string, any>;
  content?: EditorContent[];
  marks?: Array<{
    type: string;
    attrs?: Record<string, any>;
  }>;
  text?: string;
}

// Dashboard stats
export interface DashboardStats {
  posts: {
    total: number;
    published: number;
    draft: number;
    scheduled: number;
  };
  users: {
    total: number;
    active: number;
  };
  comments: {
    total: number;
    pending: number;
    approved: number;
  };
  media: {
    total: number;
    totalSize: number;
  };
  recentActivity: AuditLog[];
}

// SEO and metadata
export interface SeoMetadata {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterCard?: "summary" | "summary_large_image";
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
}

// RSS Feed types
export interface FeedItem {
  title: string;
  description: string;
  link: string;
  pubDate: Date;
  author: string;
  guid: string;
  categories?: string[];
  content?: string;
  image?: string;
}

export interface FeedConfig {
  title: string;
  description: string;
  link: string;
  language?: string;
  copyright?: string;
  managingEditor?: string;
  webMaster?: string;
  categories?: string[];
  image?: {
    url: string;
    title: string;
    link: string;
    width?: number;
    height?: number;
  };
}
