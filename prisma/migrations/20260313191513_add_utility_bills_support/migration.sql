/*
  Warnings:

  - You are about to drop the column `trnasaction_id` on the `billing_history` table. All the data in the column will be lost.
  - The `payment_method` column on the `billing_history` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `payment_method` column on the `subscriptions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('UPI', 'CARD', 'NET_BANKING', 'WALLET', 'CASH', 'BANK_TRANSFER', 'OTHER');

-- AlterTable
ALTER TABLE "bill_estimates" ADD COLUMN     "actual_recorded_at" TIMESTAMP(3),
ADD COLUMN     "estimated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "billing_history" DROP COLUMN "trnasaction_id",
ADD COLUMN     "tranasaction_id" VARCHAR(255),
DROP COLUMN "payment_method",
ADD COLUMN     "payment_method" "PaymentMethod";

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "payment_method",
ADD COLUMN     "payment_method" "PaymentMethod";

-- CreateIndex
CREATE INDEX "subscriptions_payment_status_next_billing_date_idx" ON "subscriptions"("payment_status", "next_billing_date");
