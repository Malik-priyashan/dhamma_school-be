-- CreateEnum
CREATE TYPE "StudentMonitor" AS ENUM ('GIVEN', 'NOT_GIVEN');

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "gradeEn" TEXT,
ADD COLUMN     "gradeSi" TEXT,
ADD COLUMN     "houseEn" TEXT,
ADD COLUMN     "houseSi" TEXT,
ADD COLUMN     "indexNo" TEXT,
ADD COLUMN     "libraryNo" TEXT,
ADD COLUMN     "medicine" TEXT,
ADD COLUMN     "studentActiveMonitor" "StudentMonitor" NOT NULL DEFAULT 'NOT_GIVEN';
