/*
  Warnings:

  - You are about to drop the `Seat` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Seat" DROP CONSTRAINT "Seat_busId_fkey";

-- DropForeignKey
ALTER TABLE "_BookedSeats" DROP CONSTRAINT "_BookedSeats_B_fkey";

-- DropTable
DROP TABLE "Seat";

-- CreateTable
CREATE TABLE "seats" (
    "id" SERIAL NOT NULL,
    "busId" INTEGER NOT NULL,
    "seatNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',

    CONSTRAINT "seats_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "seats" ADD CONSTRAINT "seats_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookedSeats" ADD CONSTRAINT "_BookedSeats_B_fkey" FOREIGN KEY ("B") REFERENCES "seats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
