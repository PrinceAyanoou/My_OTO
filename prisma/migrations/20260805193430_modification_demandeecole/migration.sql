-- DropForeignKey
ALTER TABLE `demandeecole` DROP FOREIGN KEY `demandeecole_demandeurId_fkey`;

-- AddForeignKey
ALTER TABLE `demandeecole` ADD CONSTRAINT `demandeecole_demandeurId_fkey` FOREIGN KEY (`demandeurId`) REFERENCES `user`(`clerkUserId`) ON DELETE CASCADE ON UPDATE CASCADE;
