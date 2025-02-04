/*
  Warnings:

  - A unique constraint covering the columns `[firebaseId]` on the table `SkinProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SkinProfile_firebaseId_key" ON "SkinProfile"("firebaseId");
