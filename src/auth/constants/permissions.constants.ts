// src/auth/constants/permissions.constants.ts
const actionValues = ['READ', 'CREATE', 'UPDATE', 'DELETE', 'MANAGE'] as const;

const cibleValues = [
  'absence',
  'affectationEnseignant',
  'anneeScolaire',
  'annonce',
  'apprenant',
  'apprenantParent',
  'bulletin',
  'cibleAnnoce',
  'classeMatiere',
  'classeScolaire',
  'configScolarite',
  'conversation',
  'decisionFinAnnee',
  'dossierScolarite',
  'ecole',
  'emploiDuTemps',
  'employe',
  'employeDocument',
  'employeRole',
  'evaluation',
  'inscription',
  'ligneBulletin',
  'matiere',
  'matiereUe',
  'message',
  'niveauScolaire',
  'note',
  'paiement',
  'parent',
  'participantConversation',
  'periodeScolaire',
  'politiqueEvaluation',
  'regleEvaluation',
  'role',
  'rolePermission',
  'trancheScolarite',
  'typeEvaluation',
  'uniteEnseignement',
  'user',
  'all',
] as const;

export type PermissionAction = (typeof actionValues)[number];
export type PermissionCible = (typeof cibleValues)[number];

export interface PermissionDefinition {
  action: PermissionAction;
  cible: PermissionCible;
  description: string;
}

export const ALL_PERMISSIONS: PermissionDefinition[] = cibleValues.flatMap(
  (cible) =>
    actionValues.map((action) => ({
      action,
      cible,
      description: `Permet d'effectuer l'action ${action} sur la ressource ${cible}`,
    })),
);
