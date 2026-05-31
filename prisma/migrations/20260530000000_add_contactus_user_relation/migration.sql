-- AlterTable
ALTER TABLE "ContactUs" ADD COLUMN "userId" TEXT;

-- CreateIndex
CREATE INDEX "ContactUs_userId_idx" ON "ContactUs"("userId");

-- AddForeignKey
ALTER TABLE "ContactUs"
ADD CONSTRAINT "ContactUs_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;