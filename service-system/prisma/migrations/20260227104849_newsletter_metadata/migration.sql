-- AlterTable
ALTER TABLE "NewsletterSubscription" ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "userAgent" TEXT,
ALTER COLUMN "status" SET DEFAULT 'active';
