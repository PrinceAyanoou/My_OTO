-- DropForeignKey
ALTER TABLE `apprenant` DROP FOREIGN KEY `Apprenant_userId_fkey`;

-- AddForeignKey
ALTER TABLE `apprenant` ADD CONSTRAINT `Apprenant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
