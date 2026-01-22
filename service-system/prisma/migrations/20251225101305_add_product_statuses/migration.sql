-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProductStatus" ADD VALUE 'FEATURED';
ALTER TYPE "ProductStatus" ADD VALUE 'OUT_OF_STOCK';
ALTER TYPE "ProductStatus" ADD VALUE 'DISCONTINUED';
ALTER TYPE "ProductStatus" ADD VALUE 'PREORDER';
