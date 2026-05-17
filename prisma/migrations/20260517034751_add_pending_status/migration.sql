-- AlterEnum
ALTER TYPE "SelectionStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "AnnouncingForm" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "PrefectBoard" ALTER COLUMN "status" SET DEFAULT 'PENDING';
