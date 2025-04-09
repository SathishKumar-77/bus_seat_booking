/*
  Warnings:

  - You are about to drop the `seats` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "seats" DROP CONSTRAINT "seats_busId_fkey";

-- DropTable
DROP TABLE "seats";

-- CreateTable
CREATE TABLE "Seat" (
    "id" SERIAL NOT NULL,
    "busId" INTEGER NOT NULL,
    "seatNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "Seat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_busId_fkey" FOREIGN KEY ("busId") REFERENCES "buses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
