-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "last_paid_date" TIMESTAMP(3),
ADD COLUMN     "payment_method" VARCHAR(50),
ADD COLUMN     "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING';
