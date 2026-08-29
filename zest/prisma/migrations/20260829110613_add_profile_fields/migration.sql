-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "profileSlug" TEXT,
ADD COLUMN     "socialLinks" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_profileSlug_key" ON "User"("profileSlug");
