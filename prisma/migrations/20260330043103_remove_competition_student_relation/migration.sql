-- CreateTable
CREATE TABLE "Competition" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "grade" TEXT,
    "competitionName" TEXT NOT NULL,
    "studentAgreement" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);
