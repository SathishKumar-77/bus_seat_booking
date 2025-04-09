/*
  Warnings:

  - Added the required column `acType` to the `buses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `buses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "buses" ADD COLUMN     "acType" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;
