-- AlterTable
ALTER TABLE "AvailabilityRule" ADD COLUMN     "dayOfMonth" INTEGER,
ADD COLUMN     "everyNDays" INTEGER;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "reminderSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "EventType" ADD COLUMN     "capacity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "reminderHours" INTEGER NOT NULL DEFAULT 24;
