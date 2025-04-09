/*
  Warnings:

  - Added the required column `priceSeater` to the `Bus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceSleeper` to the `Bus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bus" ADD COLUMN     "priceSeater" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "priceSleeper" DOUBLE PRECISION NOT NULL;
