/*
  Warnings:

  - The values [demande_ecole] on the enum `permission_cible` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `permission` MODIFY `cible` ENUM('absence', 'affectationEnseignant', 'anneeScolaire', 'annonce', 'apprenant', 'apprenantParent', 'bulletin', 'cibleAnnoce', 'classeMatiere', 'classeScolaire', 'configScolarite', 'conversation', 'decisionFinAnnee', 'demandeEcole', 'dossierScolarite', 'ecole', 'emploiDuTemps', 'employe', 'employeDocument', 'employeRole', 'evaluation', 'inscription', 'ligneBulletin', 'matiere', 'matiereUe', 'message', 'niveauScolaire', 'note', 'paiement', 'parent', 'participantConversation', 'periodeScolaire', 'politiqueEvaluation', 'regleEvaluation', 'role', 'rolePermission', 'trancheScolarite', 'typeEvaluation', 'uniteEnseignement', 'user', 'all') NOT NULL;
