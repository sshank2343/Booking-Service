/*
  Warnings:

  - You are about to drop the column `idempotencyKeyId` on the `booking` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Booking_idempotencyKeyId_key` ON `booking`;

-- AlterTable
ALTER TABLE `booking` DROP COLUMN `idempotencyKeyId`;
