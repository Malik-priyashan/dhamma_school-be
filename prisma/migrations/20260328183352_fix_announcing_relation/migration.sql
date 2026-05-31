/*
  Warnings:

  - You are about to drop the column `specialId` on the `AnnouncingForm` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "AnnouncingForm_specialId_key";

-- AlterTable
ALTER TABLE "AnnouncingForm" DROP COLUMN "specialId";
