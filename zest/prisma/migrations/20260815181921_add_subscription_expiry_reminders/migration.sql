-- AlterTable
ALTER TABLE "User" ADD COLUMN     "planExpiresAt" TIMESTAMP(3),
ADD COLUMN     "renewalNoticeDismissedAt" TIMESTAMP(3),
ADD COLUMN     "sentReminders" TEXT;
