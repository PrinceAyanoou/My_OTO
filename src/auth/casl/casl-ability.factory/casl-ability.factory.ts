// src/auth/casl/casl-ability.factory.ts
import {
  AbilityBuilder,
  createMongoAbility,
  MongoAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import {
  permission_action,
  permission_cible,
} from '../../../generated/prisma/client';

export type Subjects = permission_cible | 'all';
export type AppAbility = MongoAbility<[permission_action, Subjects]>;

export interface UserContext {
  id: string;
  clerkUserId: string;
  employe?: {
    roles: Array<{
      ecoleId: string;
      permissions: Array<{
        action: permission_action;
        cible: permission_cible;
      }>;
    }>;
  };
  parent?: { id: string };
  apprenant?: { id: string };
}

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: UserContext, ecoleId?: string) {
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    // SI C'EST UN EMPLOYE : Charger ses permissions de rôle pour l'école actuelle
    //s'assurer que ce rôle prend effet dans la bonne école
    if (user.employe && ecoleId) {
      for (const role of user.employe.roles) {
        if (role.ecoleId === ecoleId) {
          for (const perm of role.permissions) {
            if (perm.action === permission_action.MANAGE) {
              //gestion du cas ou l'utilisateur a tous les droits sur une ressource. AVOIR TOUS LES DROITS SUR ALL c'est pour le backoffice
              can(permission_action.MANAGE, perm.cible);
            } else {
              can(perm.action, perm.cible);
            }
          }
        }
      }
    }

    // SI C'EST UN PARENT : Règles par défaut liées aux parents
    if (user.parent) {
      //Absences
      can(permission_action.READ, permission_cible.absence);

      //Annonces
      can(permission_action.READ, permission_cible.annonce);

      //Apprenant
      can(permission_action.READ, permission_cible.apprenant);

      //Bulletin
      can(permission_action.READ, permission_cible.bulletin);

      //conversation
      can(permission_action.READ, permission_cible.conversation);

      //Dossier-Scolarité
      can(permission_action.READ, permission_cible.dossierScolarite);

      //emploi du temps
      can(permission_action.READ, permission_cible.emploiDuTemps);

      //message
      can(permission_action.READ, permission_cible.message);
      can(permission_action.CREATE, permission_cible.message);
      can(permission_action.UPDATE, permission_cible.message);
      can(permission_action.DELETE, permission_cible.message);

      //note
      can(permission_action.READ, permission_cible.note);

      //paiement
      can(permission_action.READ, permission_cible.paiement);

      //tranche-scolarité
      can(permission_action.READ, permission_cible.trancheScolarite);

      // Les restrictions d'appartenance à un enfant précis se feront via les critères ou l'objet CASL dans les services.
    }

    // SI C'EST UN APPRENANT : Règles par défaut pour les apprenants.
    if (user.apprenant) {
      can(permission_action.READ, permission_cible.note);
      can(permission_action.READ, permission_cible.bulletin);
      can(permission_action.READ, permission_cible.emploiDuTemps);
      can(permission_action.READ, permission_cible.annonce);
    }

    return build({
      detectSubjectType: (item) => item,
    });
  }
}
