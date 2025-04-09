/*
  Warnings:

  - You are about to drop the `buses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Seat" DROP CONSTRAINT "Seat_busId_fkey";

-- DropForeignKey
ALTER TABLE "buses" DROP CONSTRAINT "buses_operatorId_fkey";

-- DropTable
DROP TABLE "buses";

-- CreateTable
CREATE TABLE "Bus" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "numberPlate" TEXT NOT NULL,
    "routeFrom" TEXT NOT NULL,
    "routeTo" TEXT NOT NULL,
    "acType" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "seatCount" INTEGER NOT NULL,
    "operatorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" SERIAL NOT NULL,
    "busId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringTrip" (
    "id" SERIAL NOT NULL,
    "busId" INTEGER NOT NULL,
    "routeFrom" TEXT NOT NULL,
    "routeTo" TEXT NOT NULL,
    "departureTime" TEXT NOT NULL,
    "arrivalTime" TEXT NOT NULL,
    "daysOfWeek" TEXT[],
    "priceSeater" INTEGER NOT NULL,
    "priceSleeper" INTEGER NOT NULL,

    CONSTRAINT "RecurringTrip_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Bus" ADD CONSTRAINT "Bus_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringTrip" ADD CONSTRAINT "RecurringTrip_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
