ALTER TABLE "Student" ADD COLUMN "gender" TEXT;
ALTER TABLE "StudentRequest" ADD COLUMN "gender" TEXT;
ALTER TABLE "Student" ADD CONSTRAINT "Student_gender_check" CHECK ("gender" IN ('BOY', 'GIRL') OR "gender" IS NULL);
ALTER TABLE "StudentRequest" ADD CONSTRAINT "StudentRequest_gender_check" CHECK ("gender" IN ('BOY', 'GIRL') OR "gender" IS NULL);
