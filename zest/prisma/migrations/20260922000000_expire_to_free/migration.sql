-- Expired Pro subscriptions should fall back to the free plan, not lock the account.
-- This moves users left in plan='inactive' by the old expiry sweep back to free
-- so they can use the site and accept bookings again (free limit: 1 event type).
--
-- If you have manually-banned users (via admin deactivate) that must stay locked,
-- exclude them, e.g.:
--   UPDATE "User" SET "plan" = 'free', "trialEndsAt" = NULL
--   WHERE "plan" = 'inactive' AND "email" NOT IN ('banned@example.com');
UPDATE "User" SET "plan" = 'free', "trialEndsAt" = NULL WHERE "plan" = 'inactive';
