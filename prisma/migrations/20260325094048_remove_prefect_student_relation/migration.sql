/*
  Warnings:

  - You are about to drop the column `studentId` on the `PrefectBoard` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PrefectBoard" DROP CONSTRAINT "PrefectBoard_studentId_fkey";

-- DropIndex
DROP INDEX "PrefectBoard_studentId_idx";

-- AlterTable
ALTER TABLE "PrefectBoard" DROP COLUMN "studentId";
