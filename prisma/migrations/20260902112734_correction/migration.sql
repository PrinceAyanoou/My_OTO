/*
  Warnings:

  - You are about to drop the column `datePubication` on the `annonce` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `annonce` DROP COLUMN `datePubication`,
    ADD COLUMN `datePublication` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
