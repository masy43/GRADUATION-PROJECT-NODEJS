/*
  Warnings:

  - You are about to drop the column `first_name` on the `SkinProfile` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `SkinProfile` table. All the data in the column will be lost.
  - Made the column `firebaseId` on table `SkinProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "SkinProfile" DROP COLUMN "first_name",
DROP COLUMN "last_name",
ALTER COLUMN "firebaseId" SET NOT NULL;
