-- CreateEnum
CREATE TYPE "PremiumStatus" AS ENUM ('none', 'pending', 'active', 'rejected', 'cancelled');

-- CreateEnum
CREATE TYPE "BusinessStatus" AS ENUM ('none', 'pending', 'active', 'rejected', 'cancelled');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "businessAppliedAt" TIMESTAMP(3),
ADD COLUMN     "businessApprovedAt" TIMESTAMP(3),
ADD COLUMN     "businessApprovedBy" TEXT,
ADD COLUMN     "businessRejectedAt" TIMESTAMP(3),
ADD COLUMN     "businessStatus" "BusinessStatus" NOT NULL DEFAULT 'none',
ADD COLUMN     "isActive" BOOLEAN DEFAULT false,
ADD COLUMN     "isBusiness" BOOLEAN DEFAULT false,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "loyaltyPoints" INTEGER,
ADD COLUMN     "membershipType" TEXT,
ADD COLUMN     "preferences" JSONB,
ADD COLUMN     "premiumAppliedAt" TIMESTAMP(3),
ADD COLUMN     "premiumApprovedAt" TIMESTAMP(3),
ADD COLUMN     "premiumApprovedBy" TEXT,
ADD COLUMN     "premiumRejectedAt" TIMESTAMP(3),
ADD COLUMN     "premiumStatus" "PremiumStatus" NOT NULL DEFAULT 'none',
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "rewardPoints" INTEGER,
ADD COLUMN     "totalSpent" INTEGER;

-- CreateTable
CREATE TABLE "UserAccessRequest" (
    "id" UUID NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAccessRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSubscription" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'subscribed',
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" UUID NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventParams" JSONB,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscription_email_key" ON "NewsletterSubscription"("email");
