-- AlterTable
ALTER TABLE `ecole` ADD COLUMN `createurId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `ecole` ADD CONSTRAINT `ecole_createurId_fkey` FOREIGN KEY (`createurId`) REFERENCES `user`(`clerkUserId`) ON DELETE SET NULL ON UPDATE CASCADE;