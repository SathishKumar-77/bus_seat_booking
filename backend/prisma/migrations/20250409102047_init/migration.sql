/*
  Warnings:

  - Added the required column `operatorId` to the `RecurringTrip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RecurringTrip" ADD COLUMN     "operatorId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "RecurringTrip" ADD CONSTRAINT "RecurringTrip_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
