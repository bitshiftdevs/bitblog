/*
  Warnings:

  - You are about to drop the column `slug` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `uploadedById` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `tags` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerifiedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `invitedById` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastSeenAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `audit_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `invitations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `post_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `post_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `site_settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_roles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_uploadedById_fkey";

-- DropForeignKey
ALTER TABLE "post_categories" DROP CONSTRAINT "post_categories_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "post_categories" DROP CONSTRAINT "post_categories_postId_fkey";

-- DropForeignKey
ALTER TABLE "post_tags" DROP CONSTRAINT "post_tags_postId_fkey";

-- DropForeignKey
ALTER TABLE "post_tags" DROP CONSTRAINT "post_tags_tagId_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_roleId_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_userId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_invitedById_fkey";

-- DropIndex
DROP INDEX "categories_slug_key";

-- DropIndex
DROP INDEX "media_uploadedById_idx";

-- DropIndex
DROP INDEX "posts_slug_idx";

-- DropIndex
DROP INDEX "tags_slug_key";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "comments" DROP COLUMN "ipAddress",
DROP COLUMN "userAgent";

-- AlterTable
ALTER TABLE "media" DROP COLUMN "height",
DROP COLUMN "uploadedById",
DROP COLUMN "width";

-- AlterTable
ALTER TABLE "tags" DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "emailVerifiedAt",
DROP COLUMN "invitedById",
DROP COLUMN "lastSeenAt",
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "audit_logs";

-- DropTable
DROP TABLE "invitations";

-- DropTable
DROP TABLE "post_categories";

-- DropTable
DROP TABLE "post_tags";

-- DropTable
DROP TABLE "roles";

-- DropTable
DROP TABLE "sessions";

-- DropTable
DROP TABLE "site_settings";

-- DropTable
DROP TABLE "user_roles";

-- DropEnum
DROP TYPE "InvitationStatus";

-- CreateTable
CREATE TABLE "_PostToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PostToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CategoryToPost" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CategoryToPost_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PostToTag_B_index" ON "_PostToTag"("B");

-- CreateIndex
CREATE INDEX "_CategoryToPost_B_index" ON "_CategoryToPost"("B");

-- AddForeignKey
ALTER TABLE "_PostToTag" ADD CONSTRAINT "_PostToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToTag" ADD CONSTRAINT "_PostToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToPost" ADD CONSTRAINT "_CategoryToPost_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToPost" ADD CONSTRAINT "_CategoryToPost_B_fkey" FOREIGN KEY ("B") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
