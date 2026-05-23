-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Server" AS ENUM ('draco', 'imagiro', 'orukam', 'tylezia', 'hellmina', 'talkasha');

-- CreateTable
CREATE TABLE "RevenueEntry" (
    "id" TEXT NOT NULL,
    "server" "Server" NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revenu" DECIMAL(18,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevenueEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RevenueEntry_server_idx" ON "RevenueEntry"("server");

-- CreateIndex
CREATE INDEX "RevenueEntry_date_idx" ON "RevenueEntry"("date");
