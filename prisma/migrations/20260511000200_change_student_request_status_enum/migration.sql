-- CreateEnum
CREATE TYPE "StudentRequestStatus" AS ENUM ('ACCEPTED', 'REJECTED', 'PENDING');

-- AlterTable
ALTER TABLE "StudentRequest" ADD COLUMN "status" "StudentRequestStatus" NOT NULL DEFAULT 'PENDING';

UPDATE "StudentRequest"
SET "status" = CASE
  WHEN "isAccepted" = TRUE THEN 'ACCEPTED'::"StudentRequestStatus"
  ELSE 'PENDING'::"StudentRequestStatus"
END;

ALTER TABLE "StudentRequest" DROP COLUMN "isAccepted";