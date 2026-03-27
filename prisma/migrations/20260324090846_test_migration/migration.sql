-- CreateTable
CREATE TABLE "CourierRequest" (
    "id" SERIAL NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_si" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address_en" TEXT NOT NULL,
    "address_si" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourierRequest_pkey" PRIMARY KEY ("id")
);
