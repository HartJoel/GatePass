-- CreateEnum
CREATE TYPE "EstateStatus" AS ENUM ('ACTIVE', 'DEACTIVATED');

-- AlterTable
ALTER TABLE "estate" ADD COLUMN     "status" "EstateStatus" NOT NULL DEFAULT 'ACTIVE';
