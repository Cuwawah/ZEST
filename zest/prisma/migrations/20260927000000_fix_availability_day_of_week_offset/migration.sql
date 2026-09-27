-- The event-type availability UI stored day-of-week using a Monday-first
-- index (0 = Mon), while the slot engine derives day-of-week from
-- Date.getUTCDay() (0 = Sun). Every weekly rule written through the UI was
-- therefore shifted forward by exactly one day: a therapist who selected
-- Monday was served on Sunday.
--
-- The engine and its tests already used the getUTCDay() convention, so this
-- correction only moves stored values forward to match what the user
-- actually clicked.
--
-- Guarded to weekly rules with a non-null dayOfWeek. 'dateOverride' rules key
-- off "date" and 'monthly' rules off "dayOfMonth"; their dayOfWeek column is
-- NULL and must stay NULL.
--
-- Reverse (if ever needed): ("dayOfWeek" + 6) % 7

UPDATE "AvailabilityRule"
SET "dayOfWeek" = ("dayOfWeek" + 1) % 7
WHERE type = 'weekly'
  AND "dayOfWeek" IS NOT NULL;
