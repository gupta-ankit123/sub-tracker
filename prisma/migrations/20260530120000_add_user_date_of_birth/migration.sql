-- Adds the optional date_of_birth column to users. Nullable so existing
-- accounts remain valid; new accounts will populate it at sign-up and the
-- profile screen lets users edit it later.
ALTER TABLE "users" ADD COLUMN "date_of_birth" DATE;
