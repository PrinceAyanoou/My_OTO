// src/prisma/permissions.seed.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ALL_PERMISSIONS } from '../auth/constants/permissions.constants';

@Injectable()
export class PermissionsSeedService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedPermissions();
  }

  async seedPermissions() {
    for (const perm of ALL_PERMISSIONS) {
      await this.prisma.permission.upsert({
        where: {
          action_cible: {
            action: perm.action,
            cible: perm.cible,
          },
        },
        update: {},
        create: {
          action: perm.action,
          cible: perm.cible,
        },
      });
    }
    console.log('Permissions synchronisées avec succès en BDD.');
  }
}
