/*
  Warnings:

  - A unique constraint covering the columns `[nom,ecoleId]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ecoleId` to the `Role` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Role_nom_key` ON `role`;

-- AlterTable
ALTER TABLE `role` ADD COLUMN `ecoleId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Role_nom_ecoleId_key` ON `Role`(`nom`, `ecoleId`);

-- AddForeignKey
ALTER TABLE `Role` ADD CONSTRAINT `Role_ecoleId_fkey` FOREIGN KEY (`ecoleId`) REFERENCES `Ecole`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
