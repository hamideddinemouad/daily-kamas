-- CreateTable
CREATE TABLE "KamasSoldEntry" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "kamasQuantity" DECIMAL(18,4) NOT NULL,
    "pricePerM" DECIMAL(18,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KamasSoldEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KamasSoldEntry_createdAt_idx" ON "KamasSoldEntry"("createdAt");
