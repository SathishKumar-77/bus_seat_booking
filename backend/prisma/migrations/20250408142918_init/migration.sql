/*
  Warnings:

  - A unique constraint covering the columns `[numberPlate]` on the table `Bus` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Bus_numberPlate_key" ON "Bus"("numberPlate");
