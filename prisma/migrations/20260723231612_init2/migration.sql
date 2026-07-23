/*
  Warnings:

  - You are about to drop the column `code` on the `permission` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `permission` table. All the data in the column will be lost.
  - You are about to drop the column `nom` on the `permission` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[action,cible]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `action` to the `Permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cible` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Permission_code_key` ON `permission`;

-- DropIndex
DROP INDEX `Permission_nom_idx` ON `permission`;

-- AlterTable
ALTER TABLE `permission` DROP COLUMN `code`,
    DROP COLUMN `description`,
    DROP COLUMN `nom`,
    ADD COLUMN `action` ENUM('READ', 'CREATE', 'UPDATE', 'DELETE', 'MANAGE') NOT NULL,
    ADD COLUMN `cible` ENUM('absence', 'affectationEnseignant', 'anneeScolaire', 'annonce', 'apprenant', 'apprenantParent', 'bulletin', 'cibleAnnoce', 'classeMatiere', 'classeScolaire', 'configScolarite', 'conversation', 'decisionFinAnnee', 'dossierScolarite', 'ecole', 'emploiDuTemps', 'employe', 'employeDocument', 'employeRole', 'evaluation', 'inscription', 'ligneBulletin', 'matiere', 'matiereUe', 'message', 'niveauScolaire', 'note', 'paiement', 'parent', 'participantConversation', 'periodeScolaire', 'politiqueEvaluation', 'regleEvaluation', 'role', 'rolePermission', 'trancheScolarite', 'typeEvaluation', 'uniteEnseignement', 'user') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Permission_action_cible_key` ON `Permission`(`action`, `cible`);
