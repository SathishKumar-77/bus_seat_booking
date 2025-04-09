-- CreateTable
CREATE TABLE "BookedSeats" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "seatId" INTEGER NOT NULL,
    "bookingDate" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookedSeats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookedSeats_bookingId_seatId_key" ON "BookedSeats"("bookingId", "seatId");

-- AddForeignKey
ALTER TABLE "BookedSeats" ADD CONSTRAINT "BookedSeats_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookedSeats" ADD CONSTRAINT "BookedSeats_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "seats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
