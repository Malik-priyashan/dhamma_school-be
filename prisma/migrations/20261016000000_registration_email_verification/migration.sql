CREATE TABLE "RegistrationEmailVerification" (
    "email" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "proofHash" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "verifiedAt" TIMESTAMP(3),
    CONSTRAINT "RegistrationEmailVerification_pkey" PRIMARY KEY ("email")
);

CREATE INDEX "RegistrationEmailVerification_expiresAt_idx" ON "RegistrationEmailVerification"("expiresAt");
