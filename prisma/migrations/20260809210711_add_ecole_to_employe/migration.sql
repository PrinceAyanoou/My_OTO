/*
  Warnings:

  - Added the required column `ecoleId` to the `employe` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `employe` ADD COLUMN `ecoleId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `employe` ADD CONSTRAINT `employe_ecoleId_fkey` FOREIGN KEY (`ecoleId`) REFERENCES `ecole`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
