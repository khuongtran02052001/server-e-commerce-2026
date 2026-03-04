-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "assignedDeliverymanId" UUID,
ADD COLUMN     "cashCollectedAmount" INTEGER,
ADD COLUMN     "cashCollectedAt" TIMESTAMP(3),
ADD COLUMN     "paymentReceivedAt" TIMESTAMP(3),
ADD COLUMN     "paymentReceivedById" UUID;

-- CreateTable
CREATE TABLE "OrderActionLog" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "actorId" UUID,
    "actorRole" TEXT,
    "action" TEXT NOT NULL,
    "notes" TEXT,
    "cashCollectedAmount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderActionLog_orderId_createdAt_idx" ON "OrderActionLog"("orderId", "createdAt");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_assignedDeliverymanId_fkey" FOREIGN KEY ("assignedDeliverymanId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_paymentReceivedById_fkey" FOREIGN KEY ("paymentReceivedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderActionLog" ADD CONSTRAINT "OrderActionLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderActionLog" ADD CONSTRAINT "OrderActionLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
