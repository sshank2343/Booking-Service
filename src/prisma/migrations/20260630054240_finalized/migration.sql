/*
  Warnings:

  - You are about to drop the column `finalizeAt` on the `idempotencykey` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `idempotencykey` DROP COLUMN `finalizeAt`,
    ADD COLUMN `finalized` BOOLEAN NOT NULL DEFAULT false;
