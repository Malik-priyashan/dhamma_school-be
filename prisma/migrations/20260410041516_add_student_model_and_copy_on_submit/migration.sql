-- CreateTable
CREATE TABLE "Student" (
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

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentSibling" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grade" TEXT,

    CONSTRAINT "StudentSibling_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentSibling_studentId_idx" ON "StudentSibling"("studentId");

-- AddForeignKey
ALTER TABLE "StudentSibling" ADD CONSTRAINT "StudentSibling_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
