-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "ContactUsStatus" AS ENUM ('READ', 'NOT_READ');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "ContactUs" ADD COLUMN "studentId" TEXT;
ALTER TABLE "ContactUs" ADD COLUMN "senderName" TEXT;
ALTER TABLE "ContactUs" ADD COLUMN "status" "ContactUsStatus" NOT NULL DEFAULT 'NOT_READ';
ALTER TABLE "ContactUs" RENAME COLUMN "sentAt" TO "createdAt";
ALTER TABLE "ContactUs" DROP COLUMN "reply";
ALTER TABLE "ContactUs" DROP COLUMN "repliedAt";

-- Backfill sender names for existing rows before making the column required.
UPDATE "ContactUs"
SET "senderName" = COALESCE(NULLIF("senderName", ''), "name")
WHERE "senderName" IS NULL OR "senderName" = '';

ALTER TABLE "ContactUs" ALTER COLUMN "senderName" SET NOT NULL;

-- CreateIndex
CREATE INDEX "ContactUs_studentId_idx" ON "ContactUs"("studentId");

-- CreateIndex
CREATE INDEX "ContactUs_status_idx" ON "ContactUs"("status");

-- AddForeignKey
ALTER TABLE "ContactUs"
ADD CONSTRAINT "ContactUs_studentId_fkey"
FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;