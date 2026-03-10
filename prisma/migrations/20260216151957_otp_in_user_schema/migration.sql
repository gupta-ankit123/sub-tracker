/*
  Warnings:

  - You are about to drop the `otp_verifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "otp_verifications" DROP CONSTRAINT "otp_verifications_user_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "otpCode" TEXT,
ADD COLUMN     "otpExpiry" TIMESTAMP(3);

-- DropTable
DROP TABLE "otp_verifications";
