/*
  Warnings:

  - You are about to drop the column `priceSeater` on the `RecurringTrip` table. All the data in the column will be lost.
  - You are about to drop the column `priceSleeper` on the `RecurringTrip` table. All the data in the column will be lost.
  - You are about to drop the column `routeFrom` on the `RecurringTrip` table. All the data in the column will be lost.
  - You are about to drop the column `routeTo` on the `RecurringTrip` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RecurringTrip" DROP COLUMN "priceSeater",
DROP COLUMN "priceSleeper",
DROP COLUMN "routeFrom",
DROP COLUMN "routeTo";
