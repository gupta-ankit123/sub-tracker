-- CreateEnum
CREATE TYPE "BillType" AS ENUM ('FIXED', 'VARIABLE');

-- CreateEnum
CREATE TYPE "EstimationMethod" AS ENUM ('MANUAL', 'HISTORICAL_AVG', 'WEIGHTED_AVG', 'SEASONAL_AVG');

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "bill_type" "BillType" NOT NULL DEFAULT 'FIXED',
ADD COLUMN     "billing_day" INTEGER,
ADD COLUMN     "is_variable" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "bill_history" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "billing_month" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "units_consumed" DECIMAL(10,2),
    "bill_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3),
    "paid_date" TIMESTAMP(3),
    "bill_image_url" TEXT,
    "bill_pdf_url" TEXT,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bill_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bill_estimates" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "billing_month" TIMESTAMP(3) NOT NULL,
    "estimatedAmount" DECIMAL(10,2) NOT NULL,
    "estimation_method" "EstimationMethod" NOT NULL,
    "confidence_score" DECIMAL(3,2),
    "min_amount" DECIMAL(10,2),
    "max_amount" DECIMAL(10,2),
    "actual_amount" DECIMAL(10,2),
    "variance" DECIMAL(10,2),
    "variance_percentage" DECIMAL(5,2),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bill_estimates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bill_history_subscription_id_idx" ON "bill_history"("subscription_id");

-- CreateIndex
CREATE INDEX "bill_history_billing_month_idx" ON "bill_history"("billing_month");

-- CreateIndex
CREATE UNIQUE INDEX "bill_history_subscription_id_billing_month_key" ON "bill_history"("subscription_id", "billing_month");

-- CreateIndex
CREATE INDEX "bill_estimates_subscription_id_idx" ON "bill_estimates"("subscription_id");

-- CreateIndex
CREATE INDEX "bill_estimates_billing_month_idx" ON "bill_estimates"("billing_month");

-- CreateIndex
CREATE UNIQUE INDEX "bill_estimates_subscription_id_billing_month_key" ON "bill_estimates"("subscription_id", "billing_month");

-- AddForeignKey
ALTER TABLE "bill_history" ADD CONSTRAINT "bill_history_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_estimates" ADD CONSTRAINT "bill_estimates_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
