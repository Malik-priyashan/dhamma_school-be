-- CreateTable
CREATE TABLE "RegistrationPayment" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "studentRequestId" TEXT,
    "studentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistrationPayment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RegistrationPayment" ADD CONSTRAINT "RegistrationPayment_studentRequestId_fkey" FOREIGN KEY ("studentRequestId") REFERENCES "StudentRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationPayment" ADD CONSTRAINT "RegistrationPayment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
