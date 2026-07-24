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

  async createCustomRole(dto: CreateRoleDto) {
    // 1. Vérifier l'unicité du nom du rôle
    const existingRole = await this.prisma.role.findUnique({
      where: { nom: dto.nom },
    });

    if (existingRole) {
      throw new ConflictException(`Le rôle "${dto.nom}" existe déjà.`);
    }

    // 2. Transformer ["READ_user", "CREATE_absence"] en [{ action: "READ", cible: "user" }, ...]
    const parsedPermissions = dto.permissions.map((permKey) => {
      const [actionStr, ...cibleParts] = permKey.split('_');
      const cibleStr = cibleParts.join('_'); // Au cas où une cible contienne un '_'

      return {
        action: actionStr as Action,
        cible: cibleStr as CibleAction,
      };
    });

    // 3. Récupérer les identifiants réels de la table Permission en base
    const permissionsInDb = await this.prisma.permission.findMany({
      where: {
        OR: parsedPermissions.map((p) => ({
          action: p.action,
          cible: p.cible,
        })),
      },
    });

    // Si certaines permissions envoyées n'existent pas en BDD
    if (permissionsInDb.length !== dto.permissions.length) {
      throw new BadRequestException(
        "Une ou plusieurs permissions spécifiées sont invalides ou n'existent pas en BDD.",
      );
    }

    // 4. Créer le rôle et rattacher les permissions
    return this.prisma.role.create({
      data: {
        nom: dto.nom,
        description: dto.description,
        estSystem: false,
        rolePermission: {
          create: permissionsInDb.map((perm) => ({
            permissionId: perm.id,
          })),
        },
      },
      include: {
        rolePermission: {
          include: {
            permission: true,
          },
        },
      },
    });
  }
}