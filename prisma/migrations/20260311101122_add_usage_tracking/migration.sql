-- CreateEnum
CREATE TYPE "UsageFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'RARELY', 'NEVER');

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "last_used_date" TIMESTAMP(3),
ADD COLUMN     "usage_frequency" "UsageFrequency" NOT NULL DEFAULT 'MONTHLY';
