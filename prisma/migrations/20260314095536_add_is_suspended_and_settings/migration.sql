-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isSuspended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "orderUpdates" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "promotionalEmails" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "GlobalSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "platformName" TEXT NOT NULL DEFAULT 'Kitabu LMS',
    "supportEmail" TEXT NOT NULL DEFAULT 'support@kitabu.com',
    "allowRegistrations" BOOLEAN NOT NULL DEFAULT true,
    "intasendTestMode" BOOLEAN NOT NULL DEFAULT true,
    "intasendPubKey" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlobalSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "topic" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);
