-- CreateTable
CREATE TABLE "ContactUs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "reply" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "repliedAt" TIMESTAMP(3),

    CONSTRAINT "ContactUs_pkey" PRIMARY KEY ("id")
);