-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `clerkUserId` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `prenoms` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `statut` ENUM('ACTIF', 'SUSPENDU', 'DESACTIVE', 'DOIT_MODIFIER_MDP') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_clerkUserId_key`(`clerkUserId`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ecole` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `type` ENUM('MATERNELLE_PRIMAIRE', 'COLLEGE_LYCEE', 'UNIVERSITE') NOT NULL,
    `nomFondateur` VARCHAR(191) NOT NULL,
    `ville` VARCHAR(191) NOT NULL,
    `boitePostale` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `statut` ENUM('EN_ATTENTE', 'ACTIF', 'SUSPENDU', 'DESACTIVE') NOT NULL DEFAULT 'EN_ATTENTE',
    `code` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `valideAt` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Ecole_boitePostale_key`(`boitePostale`),
    UNIQUE INDEX `Ecole_email_key`(`email`),
    UNIQUE INDEX `Ecole_code_key`(`code`),
    INDEX `Ecole_ville_idx`(`ville`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `estSystem` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Role_nom_key`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmployeRole` (
    `employeId` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `EmployeRole_roleId_idx`(`roleId`),
    PRIMARY KEY (`employeId`, `roleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permission` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Permission_code_key`(`code`),
    INDEX `Permission_nom_idx`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RolePermission` (
    `roleId` VARCHAR(191) NOT NULL,
    `permissionId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RolePermission_permissionId_idx`(`permissionId`),
    PRIMARY KEY (`roleId`, `permissionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Employe` (
    `id` VARCHAR(191) NOT NULL,
    `matricule` VARCHAR(191) NOT NULL,
    `dateEmbauche` DATETIME(3) NOT NULL,
    `clerkUserId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Employe_matricule_key`(`matricule`),
    UNIQUE INDEX `Employe_clerkUserId_key`(`clerkUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmployeDocument` (
    `id` VARCHAR(191) NOT NULL,
    `employeId` VARCHAR(191) NOT NULL,
    `type` ENUM('DIPLOME', 'CONTRAT', 'PIECE_IDENTITE', 'JUSTIFICATIF') NOT NULL,
    `titre` VARCHAR(191) NOT NULL,
    `documentUrl` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `EmployeDocument_employeId_idx`(`employeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Parent` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `profession` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Parent_userId_key`(`userId`),
    INDEX `Parent_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Apprenant` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `matricule` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `prenoms` VARCHAR(191) NOT NULL,
    `Sexe` ENUM('MASCULIN', 'FEMININ') NOT NULL,
    `dateNaissance` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Apprenant_userId_key`(`userId`),
    UNIQUE INDEX `Apprenant_matricule_key`(`matricule`),
    INDEX `Apprenant_userId_idx`(`userId`),
    INDEX `Apprenant_matricule_idx`(`matricule`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ApprenantParent` (
    `apprenantId` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NOT NULL,
    `lien` ENUM('PERE', 'MERE', 'TUTEUR') NOT NULL,

    INDEX `ApprenantParent_parentId_idx`(`parentId`),
    PRIMARY KEY (`apprenantId`, `parentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnneeScolaire` (
    `id` VARCHAR(191) NOT NULL,
    `ecoleId` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `dateDebut` DATETIME(3) NOT NULL,
    `dateFin` DATETIME(3) NOT NULL,
    `statut` ENUM('EN_COURS', 'EN_PREPARATION', 'TERMINEE', 'ARCHIVEE') NOT NULL DEFAULT 'EN_PREPARATION',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AnneeScolaire_ecoleId_idx`(`ecoleId`),
    UNIQUE INDEX `AnneeScolaire_nom_ecoleId_key`(`nom`, `ecoleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PeriodeScolaire` (
    `id` VARCHAR(191) NOT NULL,
    `annneScolaireId` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `ordre` INTEGER NOT NULL,
    `dateDebut` DATETIME(3) NOT NULL,
    `dateFin` DATETIME(3) NOT NULL,
    `statut` ENUM('NON_COMMENCEE', 'OUVERTE', 'CLOTUREE', 'ARCHIVEE') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PeriodeScolaire_annneScolaireId_idx`(`annneScolaireId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NiveauScolaire` (
    `id` VARCHAR(191) NOT NULL,
    `ecoleId` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `NiveauScolaire_ecoleId_idx`(`ecoleId`),
    UNIQUE INDEX `NiveauScolaire_nom_ecoleId_key`(`nom`, `ecoleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClassScolaire` (
    `id` VARCHAR(191) NOT NULL,
    `niveauScolaireId` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `capacite` INTEGER NOT NULL,
    `emploiDuTempsId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ClassScolaire_emploiDuTempsId_key`(`emploiDuTempsId`),
    INDEX `ClassScolaire_niveauScolaireId_idx`(`niveauScolaireId`),
    UNIQUE INDEX `ClassScolaire_niveauScolaireId_nom_key`(`niveauScolaireId`, `nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Matiere` (
    `id` VARCHAR(191) NOT NULL,
    `ecoleId` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `CodeMat` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Matiere_ecoleId_idx`(`ecoleId`),
    UNIQUE INDEX `Matiere_nom_ecoleId_key`(`nom`, `ecoleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UniteEnseignement` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `coefficient` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `UniteEnseignement_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MatiereUe` (
    `uniteEnseignementId` VARCHAR(191) NOT NULL,
    `matiereId` VARCHAR(191) NOT NULL,
    `coefficient` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`uniteEnseignementId`, `matiereId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClasseMatirere` (
    `id` VARCHAR(191) NOT NULL,
    `classeScolaireId` VARCHAR(191) NOT NULL,
    `matiereId` VARCHAR(191) NOT NULL,
    `uniteEnseignementId` VARCHAR(191) NULL,
    `coefficient` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ClasseMatirere_classeScolaireId_idx`(`classeScolaireId`),
    UNIQUE INDEX `ClasseMatirere_classeScolaireId_matiereId_key`(`classeScolaireId`, `matiereId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AffectationEnseignant` (
    `id` VARCHAR(191) NOT NULL,
    `employeId` VARCHAR(191) NOT NULL,
    `classeScolaireId` VARCHAR(191) NOT NULL,
    `matiereId` VARCHAR(191) NOT NULL,
    `anneeScolaireId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AffectationEnseignant_employeId_idx`(`employeId`),
    INDEX `AffectationEnseignant_anneeScolaireId_idx`(`anneeScolaireId`),
    UNIQUE INDEX `AffectationEnseignant_matiereId_classeScolaireId_anneeScolai_key`(`matiereId`, `classeScolaireId`, `anneeScolaireId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmploiDuTemps` (
    `id` VARCHAR(191) NOT NULL,
    `affectationEnseignantId` VARCHAR(191) NOT NULL,
    `jourDeLaSemaine` ENUM('LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE') NOT NULL,
    `heureDebut` VARCHAR(191) NOT NULL,
    `heureFin` VARCHAR(191) NOT NULL,
    `classeScolaireId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `EmploiDuTemps_affectationEnseignantId_jourDeLaSemaine_heureD_key`(`affectationEnseignantId`, `jourDeLaSemaine`, `heureDebut`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TypeEvaluation` (
    `id` VARCHAR(191) NOT NULL,
    `ecoleId` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `TypeEvaluation_ecoleId_nom_key`(`ecoleId`, `nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PolitiqueEvaluation` (
    `id` VARCHAR(191) NOT NULL,
    `ecoleId` VARCHAR(191) NOT NULL,
    `anneeScolaireId` VARCHAR(191) NOT NULL,
    `classeScolaireId` VARCHAR(191) NULL,
    `nom` VARCHAR(191) NOT NULL,
    `methodeCalcul` ENUM('MOYENNE_SIMPLE', 'MOYENNE_PONDEREE') NOT NULL,
    `methodeArrondi` ENUM('AUCUN', 'ENTIER', 'DIXIEME', 'CENTIEME') NOT NULL,
    `afficherRang` BOOLEAN NOT NULL DEFAULT true,
    `estActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PolitiqueEvaluation_classeScolaireId_key`(`classeScolaireId`),
    INDEX `PolitiqueEvaluation_ecoleId_idx`(`ecoleId`),
    INDEX `PolitiqueEvaluation_anneeScolaireId_idx`(`anneeScolaireId`),
    INDEX `PolitiqueEvaluation_classeScolaireId_idx`(`classeScolaireId`),
    UNIQUE INDEX `PolitiqueEvaluation_nom_ecoleId_key`(`nom`, `ecoleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RegleEvaluation` (
    `id` VARCHAR(191) NOT NULL,
    `nombreMin` INTEGER NOT NULL DEFAULT 0,
    `coefficientType` INTEGER NOT NULL DEFAULT 1,
    `politiqueId` VARCHAR(191) NOT NULL,
    `typeEvaluationId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RegleEvaluation_politiqueId_idx`(`politiqueId`),
    INDEX `RegleEvaluation_typeEvaluationId_idx`(`typeEvaluationId`),
    UNIQUE INDEX `RegleEvaluation_politiqueId_typeEvaluationId_key`(`politiqueId`, `typeEvaluationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Evaluation` (
    `id` VARCHAR(191) NOT NULL,
    `titre` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `affectationId` VARCHAR(191) NOT NULL,
    `typeEvaluationId` VARCHAR(191) NOT NULL,
    `periodeScolaireId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Evaluation_affectationId_idx`(`affectationId`),
    INDEX `Evaluation_periodeScolaireId_idx`(`periodeScolaireId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Note` (
    `id` VARCHAR(191) NOT NULL,
    `Valeur` DOUBLE NOT NULL,
    `Observation` VARCHAR(191) NOT NULL,
    `noteSur` INTEGER NOT NULL DEFAULT 20,
    `inscriptionApprenantId` VARCHAR(191) NOT NULL,
    `inscriptionAnneeId` VARCHAR(191) NOT NULL,
    `affectationEnseignantId` VARCHAR(191) NOT NULL,
    `typeEvaluationId` VARCHAR(191) NOT NULL,
    `periodeScolaireId` VARCHAR(191) NOT NULL,
    `evaluationId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Note_inscriptionApprenantId_inscriptionAnneeId_idx`(`inscriptionApprenantId`, `inscriptionAnneeId`),
    INDEX `Note_affectationEnseignantId_idx`(`affectationEnseignantId`),
    INDEX `Note_typeEvaluationId_idx`(`typeEvaluationId`),
    INDEX `Note_periodeScolaireId_idx`(`periodeScolaireId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inscription` (
    `matricule` VARCHAR(191) NULL,
    `dateInscription` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `type` ENUM('INSCRIPTION', 'REINSCRIPTION', 'TRANSFERT_EN_COURS_D_ANNEE') NOT NULL,
    `apprenantId` VARCHAR(191) NOT NULL,
    `anneeScolaireId` VARCHAR(191) NOT NULL,
    `classeScolaireId` VARCHAR(191) NOT NULL,
    `configuartionScolariteId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Inscription_matricule_key`(`matricule`),
    INDEX `Inscription_classeScolaireId_anneeScolaireId_idx`(`classeScolaireId`, `anneeScolaireId`),
    UNIQUE INDEX `Inscription_apprenantId_classeScolaireId_key`(`apprenantId`, `classeScolaireId`),
    PRIMARY KEY (`apprenantId`, `anneeScolaireId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bulletin` (
    `moyenneGenerale` DOUBLE NOT NULL,
    `documentUrl` VARCHAR(191) NOT NULL,
    `Rang` INTEGER NULL,
    `estGenere` BOOLEAN NOT NULL DEFAULT false,
    `dateGeneration` DATETIME(3) NULL,
    `appreciation` VARCHAR(191) NULL,
    `decisionFinAnnee` ENUM('ADMIS', 'REDOUBLE', 'EXCLU', 'TRANSFERE') NOT NULL,
    `inscriptionApprenantId` VARCHAR(191) NOT NULL,
    `inscriptionAnneeId` VARCHAR(191) NOT NULL,
    `periodeScolaireId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Bulletin_periodeScolaireId_idx`(`periodeScolaireId`),
    PRIMARY KEY (`inscriptionApprenantId`, `inscriptionAnneeId`, `periodeScolaireId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LigneBulletin` (
    `id` VARCHAR(191) NOT NULL,
    `bulletinId` VARCHAR(191) NOT NULL,
    `bulletinApprenantId` VARCHAR(191) NOT NULL,
    `bulletinAnneeId` VARCHAR(191) NOT NULL,
    `matiereId` VARCHAR(191) NOT NULL,
    `moyenne` DOUBLE NOT NULL,
    `coefficient` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `LigneBulletin_matiereId_idx`(`matiereId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Absence` (
    `id` VARCHAR(191) NOT NULL,
    `dateDebut` DATETIME(3) NOT NULL,
    `dateFin` DATETIME(3) NOT NULL,
    `motif` VARCHAR(191) NOT NULL,
    `statut` ENUM('JUSTIFIEE', 'NON_JUSTIFIEE') NOT NULL,
    `commentaire` VARCHAR(191) NULL,
    `declareParUserId` VARCHAR(191) NOT NULL,
    `justificatifUrl` VARCHAR(191) NULL,
    `inscriptionApprenantId` VARCHAR(191) NOT NULL,
    `inscriptionAnneeId` VARCHAR(191) NOT NULL,
    `affectationEnseignantId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Absence_inscriptionApprenantId_inscriptionAnneeId_idx`(`inscriptionApprenantId`, `inscriptionAnneeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConfigurationScolarite` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `estActive` BOOLEAN NOT NULL DEFAULT true,
    `ecoleId` VARCHAR(191) NOT NULL,
    `niveauScolaireId` VARCHAR(191) NOT NULL,
    `anneeScolaireId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ConfigurationScolarite_niveauScolaireId_anneeScolaireId_key`(`niveauScolaireId`, `anneeScolaireId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TrancheScolarite` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `montant` INTEGER NOT NULL,
    `dateEcheance` DATETIME(3) NOT NULL,
    `ordre` INTEGER NOT NULL,
    `configurationScolariteId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `TrancheScolarite_configurationScolariteId_idx`(`configurationScolariteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DossierScolarite` (
    `id` VARCHAR(191) NOT NULL,
    `montant` INTEGER NOT NULL,
    `resteAPayer` INTEGER NOT NULL,
    `statut` ENUM('A_JOUR', 'EN_RETARD', 'SOLDEE') NOT NULL,
    `inscriptionApprenantId` VARCHAR(191) NOT NULL,
    `inscriptionAnneeId` VARCHAR(191) NOT NULL,
    `configurationScolariteId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `DossierScolarite_inscriptionApprenantId_inscriptionAnneeId_idx`(`inscriptionApprenantId`, `inscriptionAnneeId`),
    UNIQUE INDEX `DossierScolarite_inscriptionApprenantId_inscriptionAnneeId_key`(`inscriptionApprenantId`, `inscriptionAnneeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Paiement` (
    `id` VARCHAR(191) NOT NULL,
    `montant` INTEGER NOT NULL,
    `datePaiement` DATETIME(3) NOT NULL,
    `moyenPaiement` ENUM('BANQUE', 'MOBILE_MONEY', 'ESPECES') NOT NULL,
    `references` VARCHAR(191) NULL,
    `recuUrl` VARCHAR(191) NULL,
    `dossierScolariteId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Paiement_dossierScolariteId_idx`(`dossierScolariteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Annonce` (
    `id` VARCHAR(191) NOT NULL,
    `titre` VARCHAR(191) NOT NULL,
    `contenu` VARCHAR(191) NOT NULL,
    `datePubication` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dateExpiration` DATETIME(3) NOT NULL,
    `ecoleId` VARCHAR(191) NOT NULL,
    `auteurId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Annonce_ecoleId_idx`(`ecoleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CibleAnnonce` (
    `id` VARCHAR(191) NOT NULL,
    `public` ENUM('TOUS', 'EMPLOYE', 'PARENT', 'APPRENANT') NOT NULL,
    `annonceId` VARCHAR(191) NOT NULL,
    `classeScolaireId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CibleAnnonce_annonceId_idx`(`annonceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Conversation` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('PRIVEE', 'GROUPE') NOT NULL,
    `ecoleId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Conversation_ecoleId_idx`(`ecoleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ParticipantConversation` (
    `conversationId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ParticipantConversation_userId_idx`(`userId`),
    PRIMARY KEY (`conversationId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
    `id` VARCHAR(191) NOT NULL,
    `contenu` VARCHAR(191) NOT NULL,
    `fichierUrl` VARCHAR(191) NULL,
    `dateEnvoi` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lu` BOOLEAN NOT NULL DEFAULT false,
    `conversationId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Message_conversationId_idx`(`conversationId`),
    INDEX `Message_conversationId_dateEnvoi_idx`(`conversationId`, `dateEnvoi`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DecisionFinAnnee` (
    `id` VARCHAR(191) NOT NULL,
    `decision` ENUM('ADMIS', 'REDOUBLE', 'EXCLU', 'TRANSFERE') NOT NULL,
    `inscriptionApprenantId` VARCHAR(191) NOT NULL,
    `inscriptionAnneeId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `DecisionFinAnnee_inscriptionApprenantId_inscriptionAnneeId_key`(`inscriptionApprenantId`, `inscriptionAnneeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_EcoleToUser` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_EcoleToUser_AB_unique`(`A`, `B`),
    INDEX `_EcoleToUser_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EmployeRole` ADD CONSTRAINT `EmployeRole_employeId_fkey` FOREIGN KEY (`employeId`) REFERENCES `Employe`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeRole` ADD CONSTRAINT `EmployeRole_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RolePermission` ADD CONSTRAINT `RolePermission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RolePermission` ADD CONSTRAINT `RolePermission_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `Permission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employe` ADD CONSTRAINT `Employe_clerkUserId_fkey` FOREIGN KEY (`clerkUserId`) REFERENCES `User`(`clerkUserId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeDocument` ADD CONSTRAINT `EmployeDocument_employeId_fkey` FOREIGN KEY (`employeId`) REFERENCES `Employe`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Parent` ADD CONSTRAINT `Parent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Apprenant` ADD CONSTRAINT `Apprenant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprenantParent` ADD CONSTRAINT `ApprenantParent_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Parent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprenantParent` ADD CONSTRAINT `ApprenantParent_apprenantId_fkey` FOREIGN KEY (`apprenantId`) REFERENCES `Apprenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnneeScolaire` ADD CONSTRAINT `AnneeScolaire_ecoleId_fkey` FOREIGN KEY (`ecoleId`) REFERENCES `Ecole`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PeriodeScolaire` ADD CONSTRAINT `PeriodeScolaire_annneScolaireId_fkey` FOREIGN KEY (`annneScolaireId`) REFERENCES `AnneeScolaire`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NiveauScolaire` ADD CONSTRAINT `NiveauScolaire_ecoleId_fkey` FOREIGN KEY (`ecoleId`) REFERENCES `Ecole`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClassScolaire` ADD CONSTRAINT `ClassScolaire_niveauScolaireId_fkey` FOREIGN KEY (`niveauScolaireId`) REFERENCES `NiveauScolaire`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClassScolaire` ADD CONSTRAINT `ClassScolaire_emploiDuTempsId_fkey` FOREIGN KEY (`emploiDuTempsId`) REFERENCES `EmploiDuTemps`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Matiere` ADD CONSTRAINT `Matiere_ecoleId_fkey` FOREIGN KEY (`ecoleId`) REFERENCES `Ecole`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatiereUe` ADD CONSTRAINT `MatiereUe_uniteEnseignementId_fkey` FOREIGN KEY (`uniteEnseignementId`) REFERENCES `UniteEnseignement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatiereUe` ADD CONSTRAINT `MatiereUe_matiereId_fkey` FOREIGN KEY (`matiereId`) REFERENCES `Matiere`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClasseMatirere` ADD CONSTRAINT `ClasseMatirere_classeScolaireId_fkey` FOREIGN KEY (`classeScolaireId`) REFERENCES `ClassScolaire`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClasseMatirere` ADD CONSTRAINT `ClasseMatirere_matiereId_fkey` FOREIGN KEY (`matiereId`) REFERENCES `Matiere`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClasseMatirere` ADD CONSTRAINT `ClasseMatirere_uniteEnseignementId_fkey` FOREIGN KEY (`uniteEnseignementId`) REFERENCES `UniteEnseignement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AffectationEnseignant` ADD CONSTRAINT `AffectationEnseignant_employeId_fkey` FOREIGN KEY (`employeId`) REFERENCES `Employe`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AffectationEnseignant` ADD CONSTRAINT `AffectationEnseignant_classeScolaireId_fkey` FOREIGN KEY (`classeScolaireId`) REFERENCES `ClassScolaire`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AffectationEnseignant` ADD CONSTRAINT `AffectationEnseignant_matiereId_fkey` FOREIGN KEY (`matiereId`) REFERENCES `Matiere`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AffectationEnseignant` ADD CONSTRAINT `AffectationEnseignant_anneeScolaireId_fkey` FOREIGN KEY (`anneeScolaireId`) REFERENCES `AnneeScolaire`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmploiDuTemps` ADD CONSTRAINT `EmploiDuTemps_affectationEnseignantId_fkey` FOREIGN KEY (`affectationEnseignantId`) REFERENCES `AffectationEnseignant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TypeEvaluation` ADD CONSTRAINT `TypeEvaluation_ecoleId_fkey` FOREIGN KEY (`ecoleId`) REFERENCES `Ecole`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PolitiqueEvaluation` ADD CONSTRAINT `PolitiqueEvaluation_ecoleId_fkey` FOREIGN KEY (`ecoleId`) REFERENCES `Ecole`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PolitiqueEvaluation` ADD CONSTRAINT `PolitiqueEvaluation_anneeScolaireId_fkey` FOREIGN KEY (`anneeScolaireId`) REFERENCES `AnneeScolaire`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PolitiqueEvaluation` ADD CONSTRAINT `PolitiqueEvaluation_classeScolaireId_fkey` FOREIGN KEY (`classeScolaireId`) REFERENCES `ClassScolaire`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RegleEvaluation` ADD CONSTRAINT `RegleEvaluation_politiqueId_fkey` FOREIGN KEY (`politiqueId`) REFERENCES `PolitiqueEvaluation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RegleEvaluation` ADD CONSTRAINT `RegleEvaluation_typeEvaluationId_fkey` FOREIGN KEY (`typeEvaluationId`) REFERENCES `TypeEvaluation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evaluation` ADD CONSTRAINT `Evaluation_affectationId_fkey` FOREIGN KEY (`affectationId`) REFERENCES `AffectationEnseignant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evaluation` ADD CONSTRAINT `Evaluation_typeEvaluationId_fkey` FOREIGN KEY (`typeEvaluationId`) REFERENCES `TypeEvaluation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evaluation` ADD CONSTRAINT `Evaluation_periodeScolaireId_fkey` FOREIGN KEY (`periodeScolaireId`) REFERENCES `PeriodeScolaire`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Note` ADD CONSTRAINT `Note_inscriptionApprenantId_inscriptionAnneeId_fkey` FOREIGN KEY (`inscriptionApprenantId`, `inscriptionAnneeId`) REFERENCES `Inscription`(`apprenantId`, `anneeScolaireId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Note` ADD CONSTRAINT `Note_affectationEnseignantId_fkey` FOREIGN KEY (`affectationEnseignantId`) REFERENCES `AffectationEnseignant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Note` ADD CONSTRAINT `Note_typeEvaluationId_fkey` FOREIGN KEY (`typeEvaluationId`) REFERENCES `TypeEvaluation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Note` ADD CONSTRAINT `Note_periodeScolaireId_fkey` FOREIGN KEY (`periodeScolaireId`) REFERENCES `PeriodeScolaire`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Note` ADD CONSTRAINT `Note_evaluationId_fkey` FOREIGN KEY (`evaluationId`) REFERENCES `Evaluation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscription` ADD CONSTRAINT `Inscription_apprenantId_fkey` FOREIGN KEY (`apprenantId`) REFERENCES `Apprenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscription` ADD CONSTRAINT `Inscription_anneeScolaireId_fkey` FOREIGN KEY (`anneeScolaireId`) REFERENCES `AnneeScolaire`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscription` ADD CONSTRAINT `Inscription_classeScolaireId_fkey` FOREIGN KEY (`classeScolaireId`) REFERENCES `ClassScolaire`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscription` ADD CONSTRAINT `Inscription_configuartionScolariteId_fkey` FOREIGN KEY (`configuartionScolariteId`) REFERENCES `ConfigurationScolarite`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bulletin` ADD CONSTRAINT `Bulletin_inscriptionApprenantId_inscriptionAnneeId_fkey` FOREIGN KEY (`inscriptionApprenantId`, `inscriptionAnneeId`) REFERENCES `Inscription`(`apprenantId`, `anneeScolaireId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bulletin` ADD CONSTRAINT `Bulletin_periodeScolaireId_fkey` FOREIGN KEY (`periodeScolaireId`) REFERENCES `PeriodeScolaire`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LigneBulletin` ADD CONSTRAINT `LigneBulletin_bulletinApprenantId_bulletinAnneeId_bulletinI_fkey` FOREIGN KEY (`bulletinApprenantId`, `bulletinAnneeId`, `bulletinId`) REFERENCES `Bulletin`(`inscriptionApprenantId`, `inscriptionAnneeId`, `periodeScolaireId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LigneBulletin` ADD CONSTRAINT `LigneBulletin_matiereId_fkey` FOREIGN KEY (`matiereId`) REFERENCES `Matiere`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Absence` ADD CONSTRAINT `Absence_inscriptionApprenantId_inscriptionAnneeId_fkey` FOREIGN KEY (`inscriptionApprenantId`, `inscriptionAnneeId`) REFERENCES `Inscription`(`apprenantId`, `anneeScolaireId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Absence` ADD CONSTRAINT `Absence_affectationEnseignantId_fkey` FOREIGN KEY (`affectationEnseignantId`) REFERENCES `AffectationEnseignant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConfigurationScolarite` ADD CONSTRAINT `ConfigurationScolarite_ecoleId_fkey` FOREIGN KEY (`ecoleId`) REFERENCES `Ecole`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConfigurationScolarite` ADD CONSTRAINT `ConfigurationScolarite_niveauScolaireId_fkey` FOREIGN KEY (`niveauScolaireId`) REFERENCES `NiveauScolaire`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConfigurationScolarite` ADD CONSTRAINT `ConfigurationScolarite_anneeScolaireId_fkey` FOREIGN KEY (`anneeScolaireId`) REFERENCES `AnneeScolaire`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrancheScolarite` ADD CONSTRAINT `TrancheScolarite_configurationScolariteId_fkey` FOREIGN KEY (`configurationScolariteId`) REFERENCES `ConfigurationScolarite`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DossierScolarite` ADD CONSTRAINT `DossierScolarite_inscriptionApprenantId_inscriptionAnneeId_fkey` FOREIGN KEY (`inscriptionApprenantId`, `inscriptionAnneeId`) REFERENCES `Inscription`(`apprenantId`, `anneeScolaireId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DossierScolarite` ADD CONSTRAINT `DossierScolarite_configurationScolariteId_fkey` FOREIGN KEY (`configurationScolariteId`) REFERENCES `ConfigurationScolarite`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Paiement` ADD CONSTRAINT `Paiement_dossierScolariteId_fkey` FOREIGN KEY (`dossierScolariteId`) REFERENCES `DossierScolarite`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Annonce` ADD CONSTRAINT `Annonce_ecoleId_fkey` FOREIGN KEY (`ecoleId`) REFERENCES `Ecole`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Annonce` ADD CONSTRAINT `Annonce_auteurId_fkey` FOREIGN KEY (`auteurId`) REFERENCES `Employe`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CibleAnnonce` ADD CONSTRAINT `CibleAnnonce_annonceId_fkey` FOREIGN KEY (`annonceId`) REFERENCES `Annonce`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_ecoleId_fkey` FOREIGN KEY (`ecoleId`) REFERENCES `Ecole`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParticipantConversation` ADD CONSTRAINT `ParticipantConversation_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParticipantConversation` ADD CONSTRAINT `ParticipantConversation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DecisionFinAnnee` ADD CONSTRAINT `DecisionFinAnnee_inscriptionApprenantId_inscriptionAnneeId_fkey` FOREIGN KEY (`inscriptionApprenantId`, `inscriptionAnneeId`) REFERENCES `Inscription`(`apprenantId`, `anneeScolaireId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EcoleToUser` ADD CONSTRAINT `_EcoleToUser_A_fkey` FOREIGN KEY (`A`) REFERENCES `Ecole`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EcoleToUser` ADD CONSTRAINT `_EcoleToUser_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
