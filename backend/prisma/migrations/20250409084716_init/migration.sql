/*
  Warnings:

  - Added the required column `priceSeater` to the `RecurringTrip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceSleeper` to the `RecurringTrip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `routeFrom` to the `RecurringTrip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `routeTo` to the `RecurringTrip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RecurringTrip" ADD COLUMN     "priceSeater" INTEGER NOT NULL,
ADD COLUMN     "priceSleeper" INTEGER NOT NULL,
ADD COLUMN     "routeFrom" TEXT NOT NULL,
ADD COLUMN     "routeTo" TEXT NOT NULL;
