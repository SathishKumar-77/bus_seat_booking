-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'BUS_OPERATOR');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
