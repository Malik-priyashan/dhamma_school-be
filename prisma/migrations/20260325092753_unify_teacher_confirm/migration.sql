-- CreateEnum
CREATE TYPE "LibraryStatus" AS ENUM ('VERY_GOOD', 'GOOD', 'NORMAL', 'WEAK');

-- CreateEnum
CREATE TYPE "SelectionStatus" AS ENUM ('SELECTED', 'NOT_SELECTED');

-- CreateTable
CREATE TABLE "PrefectBoard" (
    "id" UUID NOT NULL,
    "studentId" UUID,
    "fullNameEn" TEXT NOT NULL,
    "fullNameSi" TEXT,
    "addressEn" TEXT,
    "addressSi" TEXT,
    "gradeEn" TEXT,
    "gradeSi" TEXT,
    "entranceDay" TIMESTAMP(3),
    "entranceNo" TEXT,
    "firstTermPlace" TEXT,
    "firstTermMarks" DOUBLE PRECISION,
    "secondTermPlace" TEXT,
    "secondTermMarks" DOUBLE PRECISION,
    "thirdTermPlace" TEXT,
    "thirdTermMarks" DOUBLE PRECISION,
    "absentDaysCount" INTEGER,
    "isPrefect" "YesNo" NOT NULL DEFAULT 'NO',
    "isPrefectYears" INTEGER[],
    "isClassLeader" "YesNo" NOT NULL DEFAULT 'NO',
    "isClassLeaderYears" INTEGER[],
    "participateForCompetitions" "YesNo" NOT NULL DEFAULT 'NO',
    "participateForCompetitionsYears" INTEGER[],
    "isInAnnouncingClub" "YesNo" NOT NULL DEFAULT 'NO',
    "isInAnnouncingClubYears" INTEGER[],
    "isOnStage" "YesNo" NOT NULL DEFAULT 'NO',
    "isOnStageYears" INTEGER[],
    "participateToKatina" "YesNo" NOT NULL DEFAULT 'NO',
    "participateToKatinaYears" INTEGER[],
    "poyaDayCount" INTEGER,
    "studentAgreement" BOOLEAN NOT NULL DEFAULT false,
    "parentsNameEn" TEXT,
    "parentsNameSi" TEXT,
    "parentsAgreement" BOOLEAN NOT NULL DEFAULT false,
    "libraryStatus" "LibraryStatus",
    "specialNoteEn" TEXT,
    "specialNoteSi" TEXT,
    "teachersAgreement" BOOLEAN NOT NULL DEFAULT false,
    "teachersAgreementFile" TEXT,
    "teachersConfirmFile" TEXT,
    "regNo" TEXT,
    "marks" DOUBLE PRECISION,
    "status" "SelectionStatus" NOT NULL DEFAULT 'NOT_SELECTED',
    "date" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrefectBoard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PrefectBoard_studentId_idx" ON "PrefectBoard"("studentId");

-- AddForeignKey
ALTER TABLE "PrefectBoard" ADD CONSTRAINT "PrefectBoard_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
