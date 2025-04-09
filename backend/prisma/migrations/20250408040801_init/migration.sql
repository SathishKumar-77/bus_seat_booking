-- CreateTable
CREATE TABLE "buses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "numberPlate" TEXT NOT NULL,
    "routeFrom" TEXT NOT NULL,
    "routeTo" TEXT NOT NULL,
    "departure" TIMESTAMP(3) NOT NULL,
    "arrival" TIMESTAMP(3) NOT NULL,
    "operatorId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seats" (
    "id" SERIAL NOT NULL,
    "seatNo" TEXT NOT NULL,
    "busId" INTEGER NOT NULL,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "buses_numberPlate_key" ON "buses"("numberPlate");

-- CreateIndex
CREATE UNIQUE INDEX "seats_seatNo_busId_key" ON "seats"("seatNo", "busId");

-- AddForeignKey
ALTER TABLE "buses" ADD CONSTRAINT "buses_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seats" ADD CONSTRAINT "seats_busId_fkey" FOREIGN KEY ("busId") REFERENCES "buses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
