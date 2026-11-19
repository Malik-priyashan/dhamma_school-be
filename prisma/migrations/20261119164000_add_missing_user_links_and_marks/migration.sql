-- Add user ownership links missing from the existing migration history.
ALTER TABLE "Student" ADD COLUMN "userId" TEXT;
ALTER TABLE "StudentRequest" ADD COLUMN "userId" TEXT;

CREATE INDEX "Student_userId_idx" ON "Student"("userId");
CREATE INDEX "StudentRequest_userId_idx" ON "StudentRequest"("userId");

ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StudentRequest" ADD CONSTRAINT "StudentRequest_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Retain the legacy Competition table and add the current marks model.
CREATE TABLE "Marks" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "teacherName" TEXT,
  "term1Marks" DOUBLE PRECISION,
  "term2Marks" DOUBLE PRECISION,
  "term3Marks" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Marks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Marks_studentId_idx" ON "Marks"("studentId");
CREATE INDEX "Marks_year_idx" ON "Marks"("year");
ALTER TABLE "Marks" ADD CONSTRAINT "Marks_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
