-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ADMIN';

-- CreateTable
CREATE TABLE "operator_keys" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used_at" TIMESTAMP(3),
    "usedBy" INTEGER,
    "createdBy" INTEGER NOT NULL,

    CONSTRAINT "operator_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "operator_keys_key_key" ON "operator_keys"("key");
