/*
  Warnings:

  - A unique constraint covering the columns `[bookingId]` on the table `IdempotencyKey` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bookingId` to the `IdempotencyKey` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Booking_idempotencyKeyId_fkey`;

-- AlterTable
ALTER TABLE `idempotencykey` ADD COLUMN `bookingId` INTEGER NOT NULL,
    ADD COLUMN `finalizeAt` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX `IdempotencyKey_bookingId_key` ON `IdempotencyKey`(`bookingId`);

-- AddForeignKey
ALTER TABLE `IdempotencyKey` ADD CONSTRAINT `IdempotencyKey_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
