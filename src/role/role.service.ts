// src/roles/roles.service.ts
import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { Action, CibleAction } from '../generated/prisma/client';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}
  //service pour la création d'un rôle personnalisé
  async createCustomRole(dto: CreateRoleDto) {
    // vérifier si le rôle existe déjà dans l'école concernée en bd via son nom et l'id de l'école
    const existingRole = await this.prisma.role.findUnique({
      where: {
        nom_ecoleId: {
          ecoleId: dto.ecoleId,
          nom: dto.nom,
        },
      },
    });

    if (existingRole) {
      throw new ConflictException(`Le rôle "${dto.nom}" existe déjà.`);
    }

    // Transformer ["READ_user", "CREATE_absence"] en [{ action: "READ", cibleAction: "user" }, ...]
    const parsedPermissions = dto.permissions.map((permKey) => {
      const [action, cibleAction] = permKey.split('_');

      return {
        action: action as Action,
        cible: cibleAction as CibleAction,
      };
    });

    // Récupérer les id des permissions associées en Db (Database) [{id: "uuid-1"}, {id: "uuid-2"}, etc]
    const permissionsInDb = await this.prisma.permission.findMany({
      where: {
        OR: parsedPermissions.map((p) => ({
          action: p.action,
          cible: p.cible,
        })),
      },
      select: {
        id: true,
      },
    });

    // Si certaines permissions envoyées n'existent pas en Db, on renvoie une erreur.
    if (permissionsInDb.length !== dto.permissions.length) {
      throw new BadRequestException(
        "Une ou plusieurs permissions spécifiées sont invalides ou n'existent pas en BDD.",
      );
    }

    // Créer le rôle et rattacher les id des permissions
    const newRole = await this.prisma.role.create({
      data: {
        nom: dto.nom,
        description: dto.description,
        estSystem: false,
        ecoleId: dto.ecoleId,
        rolePermission: {
          createMany: {
            //au lieu d'utiliser un create qui va générer des requêtes pour chaque élément du tableau,
            //on utilise un createMany pour tout injecter d'un coup et comme le front n'a pas direct besoin de ce qui est inséré, on fera un retour manuel.
            data: permissionsInDb.map((perm) => ({
              permissionId: perm.id,
            })),
          },
        },
      },
    });
    //réponse renvoyée si tout s'est bien passer.
    return {
      success: true,
      message: `Le rôle ${newRole.nom} a été créé avec succès`,
      role: {
        id: newRole.id,
        nom: newRole.nom,
      },
    };
    //next function about role.
  }
}
