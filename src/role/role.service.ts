// src/roles/roles.service.ts
import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { Action, CibleAction } from '../generated/prisma/client';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}
  //service pour la création d'un rôle personnalisé
  async createCustomRole(dto: CreateRoleDto, ecoleId: string) {
    // vérifier si le rôle existe déjà dans l'école concernée en bd via son nom et l'id de l'école
    const existingRole = await this.prisma.role.findUnique({
      where: {
        nom_ecoleId: {
          ecoleId: ecoleId,
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
        ecoleId: ecoleId,
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
  }

  //service pour la modification d'un rôle.
  async updateRole(roleId: string, ecoleId: string, dto: UpdateRoleDto) {
    //Vérifier que le rôle existe dans l'école
    const existingRole = await this.prisma.role.findUnique({
      where: {
        id: roleId,
        ecoleId: ecoleId,
      },
    });

    if (!existingRole) {
      throw new NotFoundException(
        `Le rôle avec l'ID "${roleId}" n'existe pas.`,
      );
    }

    // Interdire la modification des rôles système par précaution
    if (existingRole.estSystem) {
      throw new BadRequestException(
        'Les rôles système ne peuvent pas être modifiés.',
      );
    }

    // Si le nom change, vérifier qu'il n'y a pas de conflit au sein de la même école
    if (dto.nom && dto.nom !== existingRole.nom) {
      const duplicateRole = await this.prisma.role.findUnique({
        where: {
          nom_ecoleId: {
            ecoleId: ecoleId,
            nom: dto.nom,
          },
        },
      });

      if (duplicateRole) {
        throw new ConflictException(
          `Un rôle nommé "${dto.nom}" existe déjà pour cette école.`,
        );
      }
    }

    // Variable pour stocker les IDs des permissions valide si fournies
    let validPermissionIds: string[] = [];

    // Si la liste des permissions est fournie dans le DTO, on les valide
    if (dto.permissions && dto.permissions.length > 0) {
      const parsedPermissions = dto.permissions.map((permKey) => {
        const [action, cibleAction] = permKey.split('_');
        return {
          action: action as Action,
          cible: cibleAction as CibleAction,
        };
      });

      const permissionsInDb = await this.prisma.permission.findMany({
        where: {
          OR: parsedPermissions.map((p) => ({
            action: p.action,
            cible: p.cible,
          })),
        },
        select: { id: true },
      });

      if (permissionsInDb.length !== dto.permissions.length) {
        throw new BadRequestException(
          "Une ou plusieurs permissions spécifiées sont invalides ou n'existent pas en BDD.",
        );
      }

      validPermissionIds = permissionsInDb.map((p) => p.id);
    }

    // Mettre à jour le rôle et ses liaisons dans une transaction
    const updatedRole = await this.prisma.$transaction(async (tx) => {
      // Mettre à jour les permissions si elles ont été fournies dans le DTO
      if (dto.permissions) {
        // Supprimer toutes les anciennes liaisons de ce rôle
        await tx.rolePermission.deleteMany({
          where: { roleId },
        });

        // Re-créer les nouvelles liaisons
        if (validPermissionIds.length > 0) {
          await tx.rolePermission.createMany({
            data: validPermissionIds.map((permissionId) => ({
              roleId,
              permissionId,
            })),
          });
        }
      }

      // Mettre à jour les champs scalaires du rôle
      return tx.role.update({
        where: { id: roleId },
        data: {
          nom: dto.nom,
          description: dto.description,
          ecoleId: ecoleId,
        },
      });
    });

    // 5. Réponse
    return {
      success: true,
      message: `Le rôle "${updatedRole.nom}" a été mis à jour avec succès.`,
      role: {
        id: updatedRole.id,
        nom: updatedRole.nom,
      },
    };
  }
}
