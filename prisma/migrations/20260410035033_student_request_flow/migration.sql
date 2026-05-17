/*
  Warnings:

  - You are about to drop the `Sibling` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Student` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Sibling" DROP CONSTRAINT "Sibling_studentId_fkey";

-- DropTable
DROP TABLE "Sibling";

-- DropTable
DROP TABLE "Student";

-- CreateTable
CREATE TABLE "StudentRequest" (
    "id" TEXT NOT NULL,
    "fullNameWithSurname" TEXT NOT NULL,
    "nameWithInitials" TEXT,
    "dob" TIMESTAMP(3),
    "address" TEXT,
    "phone1" TEXT,
    "phone2" TEXT,
    "school" TEXT,
    "earlierSchool" "YesNo" NOT NULL DEFAULT 'NO',
    "earlierSchoolReason" TEXT,
    "reasonForLeave" TEXT,
    "fatherFullName" TEXT,
    "fatherJob" TEXT,
    "fatherJobAddress" TEXT,
    "motherFullName" TEXT,
    "motherJob" TEXT,
    "motherJobAddress" TEXT,
    "guardianFullName" TEXT,
    "guardianJob" TEXT,
    "guardianJobAddress" TEXT,
    "emergencyPersonName" TEXT,
    "emergencyPersonAddress" TEXT,
    "emergencyNumber" TEXT,
    "disabilities" "YesNo" NOT NULL DEFAULT 'NO',
    "disabilityReason" TEXT,
    "medicated" "YesNo" NOT NULL DEFAULT 'NO',
    "medicine" TEXT,
    "registrationPayment" DOUBLE PRECISION,
    "registrationDate" TIMESTAMP(3),
    "indexNo" TEXT,
    "libraryNo" TEXT,
    "house" TEXT,
    "grade" TEXT,
    "studentActiveMonitor" "StudentMonitor" NOT NULL DEFAULT 'NOT_GIVEN',
    "agreeToTerms" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentRequestSibling" (
    "id" TEXT NOT NULL,
    "studentRequestId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grade" TEXT,

    CONSTRAINT "StudentRequestSibling_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentRequestSibling_studentRequestId_idx" ON "StudentRequestSibling"("studentRequestId");

-- AddForeignKey
ALTER TABLE "StudentRequestSibling" ADD CONSTRAINT "StudentRequestSibling_studentRequestId_fkey" FOREIGN KEY ("studentRequestId") REFERENCES "StudentRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
