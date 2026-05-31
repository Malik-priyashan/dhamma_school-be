-- CreateTable
CREATE TABLE "Special" (
    "id" TEXT NOT NULL,
    "dancing" JSONB,
    "kathika" JSONB,
    "padyagayana" JSONB,
    "debate" JSONB,
    "acting" JSONB,
    "singing" JSONB,
    "prefectOrClassLeader" JSONB,
    "committee" JSONB,
    "other" JSONB,
    "announcingFormId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Special_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnouncingForm" (
    "id" TEXT NOT NULL,
    "fullNameWithSurname" TEXT NOT NULL,
    "birthday" TIMESTAMP(3),
    "address" TEXT,
    "phoneLand" TEXT,
    "phoneMobile" TEXT,
    "school" TEXT,
    "guardianName" TEXT,
    "guardianAddress" TEXT,
    "specialId" TEXT,
    "studentAgreement" BOOLEAN NOT NULL DEFAULT false,
    "marks" DOUBLE PRECISION,
    "status" "SelectionStatus" NOT NULL DEFAULT 'NOT_SELECTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnnouncingForm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Special_announcingFormId_key" ON "Special"("announcingFormId");

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncingForm_specialId_key" ON "AnnouncingForm"("specialId");

-- AddForeignKey
ALTER TABLE "Special" ADD CONSTRAINT "Special_announcingFormId_fkey" FOREIGN KEY ("announcingFormId") REFERENCES "AnnouncingForm"("id") ON DELETE SET NULL ON UPDATE CASCADE;
