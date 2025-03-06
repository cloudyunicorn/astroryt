/*
  Warnings:

  - You are about to drop the column `planetaryPositions` on the `BirthChart` table. All the data in the column will be lost.
  - Added the required column `planetaryData` to the `BirthChart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rawHorizonsData` to the `BirthChart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vedicData` to the `BirthChart` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BirthChart" DROP COLUMN "planetaryPositions",
ADD COLUMN     "planetaryData" JSONB NOT NULL,
ADD COLUMN     "rawHorizonsData" JSONB NOT NULL,
ADD COLUMN     "vedicData" JSONB NOT NULL;
