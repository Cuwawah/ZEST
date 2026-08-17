-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accentColor" TEXT,
ADD COLUMN     "hideBranding" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "phone" TEXT,
ALTER COLUMN "plan" SET DEFAULT 'free';

-- Backfill: existing users who are mid-trial (plan inactive, trial in the
-- future) become free-tier users instead of being locked out when the trial
-- ends. Truly lapsed users (trial already passed) stay 'inactive'.
UPDATE "User"
SET "plan" = 'free'
WHERE "plan" = 'inactive'
  AND "trialEndsAt" IS NOT NULL
  AND "trialEndsAt" > now();
