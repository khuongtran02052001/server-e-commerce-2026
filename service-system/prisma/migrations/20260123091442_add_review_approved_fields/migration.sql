/*
  Warnings:

  - A unique constraint covering the columns `[productId]` on the table `RatingDistribution` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "adminNotes" TEXT,
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "RatingDistribution_productId_key" ON "RatingDistribution"("productId");
