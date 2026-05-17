/*
  Warnings:

  - The primary key for the `PrefectBoard` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `addressEn` on the `PrefectBoard` table. All the data in the column will be lost.
  - You are about to drop the column `addressSi` on the `PrefectBoard` table. All the data in the column will be lost.
  - You are about to drop the column `fullNameEn` on the `PrefectBoard` table. All the data in the column will be lost.
  - You are about to drop the column `fullNameSi` on the `PrefectBoard` table. All the data in the column will be lost.
  - You are about to drop the column `gradeEn` on the `PrefectBoard` table. All the data in the column will be lost.
  - You are about to drop the column `gradeSi` on the `PrefectBoard` table. All the data in the column will be lost.
  - You are about to drop the column `parentsNameEn` on the `PrefectBoard` table. All the data in the column will be lost.
  - You are about to drop the column `parentsNameSi` on the `PrefectBoard` table. All the data in the column will be lost.
  - You are about to drop the column `specialNoteEn` on the `PrefectBoard` table. All the data in the column will be lost.
  - You are about to drop the column `specialNoteSi` on the `PrefectBoard` table. All the data in the column will be lost.
  - The primary key for the `Sibling` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `gradeEn` on the `Sibling` table. All the data in the column will be lost.
  - You are about to drop the column `gradeSi` on the `Sibling` table. All the data in the column will be lost.
  - You are about to drop the column `nameEn` on the `Sibling` table. All the data in the column will be lost.
  - You are about to drop the column `nameSi` on the `Sibling` table. All the data in the column will be lost.
  - The primary key for the `Student` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `addressEn` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `addressSi` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `disabilityReasonEn` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `disabilityReasonSi` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `earlierSchoolEn` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `earlierSchoolSi` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyPersonAddressEn` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyPersonAddressSi` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyPersonNameEn` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyPersonNameSi` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `fatherFullNameEn` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `fatherFullNameSi` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `fatherJobAddressEn` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `fatherJobAddressSi` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `fatherJobEn` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `fatherJobSi` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `fullNameWithSurnameEn` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `fullNameWithSurnameSi` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `gradeEn` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `gradeSi` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `guardianFullNameEn` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `guardianFullNameSi` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `guardianJobAddressEn` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `guardianJobAddressSi` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `guardianJobEn` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `guardianJobSi` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `houseEn` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `houseSi` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `motherFullNameEn` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `motherFullNameSi` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `motherJobAddressEn` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `motherJobAddressSi` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `motherJobEn` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `motherJobSi` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `nameWithInitialsEn` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `nameWithInitialsSi` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `reasonForLeaveEn` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `reasonForLeaveSi` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `schoolEn` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `schoolSi` on the `Student` table. All the data in the column will be lost.
  - Added the required column `fullName` to the `PrefectBoard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Sibling` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullNameWithSurname` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Sibling" DROP CONSTRAINT "Sibling_studentId_fkey";

-- AlterTable
ALTER TABLE "PrefectBoard" DROP CONSTRAINT "PrefectBoard_pkey",
DROP COLUMN "addressEn",
DROP COLUMN "addressSi",
DROP COLUMN "fullNameEn",
DROP COLUMN "fullNameSi",
DROP COLUMN "gradeEn",
DROP COLUMN "gradeSi",
DROP COLUMN "parentsNameEn",
DROP COLUMN "parentsNameSi",
DROP COLUMN "specialNoteEn",
DROP COLUMN "specialNoteSi",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "grade" TEXT,
ADD COLUMN     "libraryStatusConfirmationFile" TEXT,
ADD COLUMN     "parentsName" TEXT,
ADD COLUMN     "specialNote" TEXT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "PrefectBoard_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Sibling" DROP CONSTRAINT "Sibling_pkey",
DROP COLUMN "gradeEn",
DROP COLUMN "gradeSi",
DROP COLUMN "nameEn",
DROP COLUMN "nameSi",
ADD COLUMN     "grade" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "studentId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Sibling_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Student" DROP CONSTRAINT "Student_pkey",
DROP COLUMN "addressEn",
DROP COLUMN "addressSi",
DROP COLUMN "disabilityReasonEn",
DROP COLUMN "disabilityReasonSi",
DROP COLUMN "earlierSchoolEn",
DROP COLUMN "earlierSchoolSi",
DROP COLUMN "emergencyPersonAddressEn",
DROP COLUMN "emergencyPersonAddressSi",
DROP COLUMN "emergencyPersonNameEn",
DROP COLUMN "emergencyPersonNameSi",
DROP COLUMN "fatherFullNameEn",
DROP COLUMN "fatherFullNameSi",
DROP COLUMN "fatherJobAddressEn",
DROP COLUMN "fatherJobAddressSi",
DROP COLUMN "fatherJobEn",
DROP COLUMN "fatherJobSi",
DROP COLUMN "fullNameWithSurnameEn",
DROP COLUMN "fullNameWithSurnameSi",
DROP COLUMN "gradeEn",
DROP COLUMN "gradeSi",
DROP COLUMN "guardianFullNameEn",
DROP COLUMN "guardianFullNameSi",
DROP COLUMN "guardianJobAddressEn",
DROP COLUMN "guardianJobAddressSi",
DROP COLUMN "guardianJobEn",
DROP COLUMN "guardianJobSi",
DROP COLUMN "houseEn",
DROP COLUMN "houseSi",
DROP COLUMN "motherFullNameEn",
DROP COLUMN "motherFullNameSi",
DROP COLUMN "motherJobAddressEn",
DROP COLUMN "motherJobAddressSi",
DROP COLUMN "motherJobEn",
DROP COLUMN "motherJobSi",
DROP COLUMN "nameWithInitialsEn",
DROP COLUMN "nameWithInitialsSi",
DROP COLUMN "reasonForLeaveEn",
DROP COLUMN "reasonForLeaveSi",
DROP COLUMN "schoolEn",
DROP COLUMN "schoolSi",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "disabilityReason" TEXT,
ADD COLUMN     "earlierSchoolReason" TEXT,
ADD COLUMN     "emergencyPersonAddress" TEXT,
ADD COLUMN     "emergencyPersonName" TEXT,
ADD COLUMN     "fatherFullName" TEXT,
ADD COLUMN     "fatherJob" TEXT,
ADD COLUMN     "fatherJobAddress" TEXT,
ADD COLUMN     "fullNameWithSurname" TEXT NOT NULL,
ADD COLUMN     "grade" TEXT,
ADD COLUMN     "guardianFullName" TEXT,
ADD COLUMN     "guardianJob" TEXT,
ADD COLUMN     "guardianJobAddress" TEXT,
ADD COLUMN     "house" TEXT,
ADD COLUMN     "motherFullName" TEXT,
ADD COLUMN     "motherJob" TEXT,
ADD COLUMN     "motherJobAddress" TEXT,
ADD COLUMN     "nameWithInitials" TEXT,
ADD COLUMN     "reasonForLeave" TEXT,
ADD COLUMN     "school" TEXT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Student_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Sibling" ADD CONSTRAINT "Sibling_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
