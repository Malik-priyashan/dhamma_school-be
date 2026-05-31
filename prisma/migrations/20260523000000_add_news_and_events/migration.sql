-- CreateTable
CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "image" TEXT,
    "topic" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "happenedDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "image" TEXT,
    "topic" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "happenedDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "News_happenedDate_idx" ON "News"("happenedDate");

-- CreateIndex
CREATE INDEX "Event_happenedDate_idx" ON "Event"("happenedDate");