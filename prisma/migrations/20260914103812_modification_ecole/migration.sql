-- AlterTable
ALTER TABLE `ecole` ADD COLUMN `adresse` VARCHAR(191) NULL,
    ADD COLUMN `logoUrl` VARCHAR(191) NULL,
    ADD COLUMN `ministereTutelle` VARCHAR(191) NULL DEFAULT 'Ministère de l''Éducation Nationale',
    ADD COLUMN `slogan` VARCHAR(191) NULL;
