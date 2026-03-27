/*
  Warnings:

  - You are about to drop the `CourierRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "YesNo" AS ENUM ('YES', 'NO');

-- DropTable
DROP TABLE "CourierRequest";

-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "fullNameWithSurnameEn" TEXT NOT NULL,
    "fullNameWithSurnameSi" TEXT,
    "nameWithInitialsEn" TEXT,
    "nameWithInitialsSi" TEXT,
    "dob" TIMESTAMP(3),
    "addressEn" TEXT,
    "addressSi" TEXT,
    "phone1" TEXT,
    "phone2" TEXT,
    "schoolEn" TEXT,
    "schoolSi" TEXT,
    "earlierSchool" "YesNo" NOT NULL DEFAULT 'NO',
    "earlierSchoolEn" TEXT,
    "earlierSchoolSi" TEXT,
    "reasonForLeaveEn" TEXT,
    "reasonForLeaveSi" TEXT,
    "fatherFullNameEn" TEXT,
    "fatherFullNameSi" TEXT,
    "fatherJobEn" TEXT,
    "fatherJobSi" TEXT,
    "fatherJobAddressEn" TEXT,
    "fatherJobAddressSi" TEXT,
    "motherFullNameEn" TEXT,
    "motherFullNameSi" TEXT,
    "motherJobEn" TEXT,
    "motherJobSi" TEXT,
    "motherJobAddressEn" TEXT,
    "motherJobAddressSi" TEXT,
    "guardianFullNameEn" TEXT,
    "guardianFullNameSi" TEXT,
    "guardianJobEn" TEXT,
    "guardianJobSi" TEXT,
    "guardianJobAddressEn" TEXT,
    "guardianJobAddressSi" TEXT,
    "emergencyPersonNameEn" TEXT,
    "emergencyPersonNameSi" TEXT,
    "emergencyPersonAddressEn" TEXT,
    "emergencyPersonAddressSi" TEXT,
    "emergencyNumber" TEXT,
    "disabilities" "YesNo" NOT NULL DEFAULT 'NO',
    "disabilityReasonEn" TEXT,
    "disabilityReasonSi" TEXT,
    "medicated" "YesNo" NOT NULL DEFAULT 'NO',
    "registrationPayment" DOUBLE PRECISION,
    "registrationDate" TIMESTAMP(3),
    "agreeToTerms" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sibling" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameSi" TEXT,
    "gradeEn" TEXT,
    "gradeSi" TEXT,

    CONSTRAINT "Sibling_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sibling_studentId_idx" ON "Sibling"("studentId");

-- AddForeignKey
ALTER TABLE "Sibling" ADD CONSTRAINT "Sibling_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
